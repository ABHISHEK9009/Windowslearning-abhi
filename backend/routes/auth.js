const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role || 'LEARNER'
        }
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authUser.user) {
      throw new Error('Failed to create user');
    }

    // The trigger will create the profile and wallet automatically
    // Fetch the created profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Create role-specific profile
    if (role === 'MENTOR') {
      await supabase.from('mentor_profiles').insert({
        id: authUser.user.id,
        headline: '',
        verification_status: 'PENDING'
      });
    } else {
      await supabase.from('learner_profiles').insert({
        id: authUser.user.id
      });
    }

    // Generate token
    const token = generateToken(profile);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: profile,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }

    // Generate token
    const token = generateToken(profile);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: profile,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Login failed' 
    });
  }
});

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { accessToken, role } = req.body;

    if (!accessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google access token required' 
      });
    }

    // Verify Google token and get user info
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const googleUser = await googleResponse.json();

    if (!googleUser.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get user info from Google' 
      });
    }

    // Check if user exists
    let { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    let userId;
    let profile;

    if (!existingUser) {
      // Create new user
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: googleUser.email,
        password: crypto.randomUUID(), // Random password for OAuth users
        options: {
          data: {
            full_name: googleUser.name || googleUser.email.split('@')[0],
            avatar_url: googleUser.picture,
            role: role || 'LEARNER'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      userId = authUser.user.id;

      // Create role-specific profile
      if (role === 'MENTOR') {
        await supabase.from('mentor_profiles').insert({
          id: userId,
          headline: '',
          verification_status: 'PENDING'
        });
      } else {
        await supabase.from('learner_profiles').insert({
          id: userId
        });
      }

      // Fetch created profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      profile = newProfile;
    } else {
      profile = existingUser;
      userId = existingUser.id;
    }

    // Generate token
    const token = generateToken(profile);

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: profile,
        token
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Google authentication failed' 
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: { user: profile }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
    });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send reset email' 
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { password } = req.body;
    const access_token = req.query.access_token || req.body.access_token;

    if (!access_token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Access token and new password are required' 
      });
    }

    // Update password using the recovery access token
    const { error } = await supabase.auth.updateUser(
      { password },
      { access_token }
    );

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to reset password' 
    });
  }
});

module.exports = router;
