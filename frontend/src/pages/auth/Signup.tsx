import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'LEARNER' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'MENTOR' ? '/onboarding/mentor' : '/onboarding/learner';
      navigate(redirectPath);
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', {
        ...form,
        role: form.role.toUpperCase(),
      });
      const { user: newUser, token } = response.data.data;
      login(newUser, token);
      toast({
        title: "Account Created!",
        description: "You have been successfully registered and logged in.",
      });
    } catch (err: any) {
      const message = err.response?.data?.message || "An unexpected error occurred.";
      setError(message);
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post('/auth/google', { accessToken: tokenResponse.access_token, role: form.role.toUpperCase() });
        const { user: newUser, token } = response.data.data;
        login(newUser, token);
        toast({ title: "Account Created!", description: "You have been successfully registered and logged in." });
        const redirectPath = newUser.role === 'MENTOR' ? '/onboarding/mentor' : '/onboarding/learner';
        navigate(redirectPath);
      } catch (err: any) {
        const message = err.response?.data?.message || "Google authentication failed.";
        setError(message);
        toast({ title: "Registration Failed", description: message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      const message = "Google authentication failed.";
      setError(message);
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 signup-background">
        <div className="w-full max-w-md bg-card rounded-2xl border shadow-card p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Join Windows Learning</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">Create your account and start learning today.</p>

          {/* Role toggle */}
          <div className="flex rounded-lg border p-1 mb-6">
            {(['LEARNER', 'MENTOR'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setForm(f => ({ ...f, role }))}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  form.role === role ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {role === 'LEARNER' ? 'I want to learn' : 'I want to mentor'}
              </button>
            ))}
          </div>

          <div className="space-y-3 mb-6">
            <button type="button" onClick={() => handleGoogleLogin()} disabled={isLoading} className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border hover:bg-secondary transition-colors text-sm font-medium active:scale-[0.98]">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Create a strong password"
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full h-11 active:scale-[0.98] transition-all" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            By signing up, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
