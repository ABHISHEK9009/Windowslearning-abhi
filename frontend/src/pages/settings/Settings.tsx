import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Palette, Lock, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profilePicture: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifs: true,
    smsNotifs: false,
    sessionReminders: true,
    newsletter: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
  });

  const [theme, setTheme] = useState({ darkMode: false });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email,
        bio: user.learnerProfile?.bio || user.mentorProfile?.bio || '',
        profilePicture: user.profilePicture || '',
      });
      // You would also fetch and set notification, privacy, and theme settings from your backend here
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      const response = await api.patch(`/users/profile`, {
        name: profile.name,
        bio: profile.bio,
      });
      setUser(response.data.data);
      toast({
        title: 'Success',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        const response = await api.post('/users/profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setUser(response.data.data);
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload profile picture.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground mb-6">Manage your account preferences</p>

          {/* Profile */}
          <Card className="mb-6">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.profilePicture ? `http://localhost:3000${profile.profilePicture}` : `https://ui-avatars.com/api/?name=${profile.name}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full bg-primary/10"
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePictureUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div><label className="block text-sm font-medium mb-1">Full Name</label>
                <input name="name" value={profile.name} placeholder="Enter your full name" onChange={handleProfileChange} className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" value={profile.email} placeholder="Enter your email" readOnly className="w-full h-10 px-3 rounded-lg border bg-muted text-sm focus:outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Bio</label>
                <textarea name="bio" value={profile.bio} placeholder="Tell us about yourself" onChange={handleProfileChange} rows={3} className="w-full p-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" /></div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="mb-6">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">Receive updates via email</p></div>
                <Switch checked={notifications.emailNotifs} onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifs: checked })} />
              </div>
              {/* ... other notification settings ... */}
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="mb-6">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Profile Visibility</p><p className="text-xs text-muted-foreground">Allow others to view your profile</p></div>
                <Switch checked={privacy.profileVisible} onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })} />
              </div>
              {/* ... other privacy settings ... */}
            </CardContent>
          </Card>

          {/* Theme */}
          <Card className="mb-6">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">Dark Mode</p><p className="text-xs text-muted-foreground">Switch to dark theme</p></div>
                <Switch checked={theme.darkMode} onCheckedChange={(checked) => setTheme({ ...theme, darkMode: checked })} />
              </div>
            </CardContent>
          </Card>

          {/* Password & Account */}
          <Card className="mb-6">
            <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5" /> Security</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2"><Lock className="h-4 w-4" /> Change Password</Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /> Delete Account</Button>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="gap-1" onClick={handleSaveChanges}><Save className="h-4 w-4" /> Save Changes</Button>
            <Button variant="outline" onClick={() => navigate(user?.role === 'MENTOR' ? '/mentor/dashboard' : '/dashboard')}>Back to Dashboard</Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsPage;
