import { Link } from 'react-router-dom';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const EmailVerification = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="w-full max-w-md bg-card rounded-2xl border shadow-sm p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Check Your Email</h2>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to your email address. Please click the link to verify your account.
          </p>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or click below to resend.
            </p>
          </div>
          <Button variant="outline" className="w-full gap-2">
            <RefreshCw className="h-4 w-4" /> Resend Verification Email
          </Button>
          <Link to="/login">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailVerification;
