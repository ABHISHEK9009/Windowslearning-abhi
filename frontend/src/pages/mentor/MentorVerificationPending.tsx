import { Link } from 'react-router-dom';
import { Clock, Edit, HelpCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MentorVerificationPending = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="w-full max-w-lg bg-card rounded-2xl border shadow-sm p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
            <Clock className="h-10 w-10 text-warning" />
          </div>
          <h2 className="text-2xl font-bold">Profile Under Review</h2>
          <p className="text-muted-foreground">
            Your mentor profile has been submitted for verification. Our team will review it within <strong>24-48 hours</strong>.
            You'll receive an email once approved.
          </p>
          <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p><strong>What we check:</strong></p>
            <ul className="mt-2 space-y-1 text-left list-disc list-inside">
              <li>Identity verification (Government ID)</li>
              <li>Professional experience & credentials</li>
              <li>Profile completeness</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/mentor/profile/edit" className="flex-1">
              <Button variant="outline" className="w-full gap-2"><Edit className="h-4 w-4" /> Edit Profile</Button>
            </Link>
            <Button variant="outline" className="flex-1 gap-2"><RefreshCw className="h-4 w-4" /> Check Status</Button>
          </div>
          <Link to="/help" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <HelpCircle className="h-4 w-4" /> Need help? Contact Support
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MentorVerificationPending;
