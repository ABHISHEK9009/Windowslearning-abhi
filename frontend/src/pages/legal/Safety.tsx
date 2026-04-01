import { Shield, Eye, Lock, AlertTriangle, UserCheck, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const safetyFeatures = [
  { icon: UserCheck, title: 'Aadhaar Verification', description: 'Every mentor undergoes government ID verification before they can teach on our platform.' },
  { icon: Lock, title: 'Encrypted Data', description: 'AES-256 encryption protects all sensitive information including payment details and personal data.' },
  { icon: Shield, title: 'PCI-Compliant Payments', description: 'Secure transactions via Razorpay with support for UPI, Cards, and NetBanking.' },
  { icon: Eye, title: 'Session Monitoring', description: 'Optional session recording with explicit consent from both parties for quality assurance.' },
  { icon: AlertTriangle, title: 'Dispute Resolution', description: 'Dedicated admin mediation team to handle any issues between mentors and learners.' },
  { icon: MessageSquare, title: 'Report System', description: 'Easy-to-use reporting tools to flag inappropriate behavior or content.' },
];

const Safety = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="py-20 px-4 text-center" style={{ background: 'var(--hero-gradient)' }}>
          <Shield className="h-12 w-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Safety is Our Priority</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            We've built multiple layers of protection to ensure a safe and trustworthy learning environment for everyone.
          </p>
        </div>

        <div className="container max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {safetyFeatures.map(f => (
              <Card key={f.title}>
                <CardContent className="p-6">
                  <f.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="text-center">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold mb-2">See something concerning?</h3>
              <p className="text-sm text-muted-foreground mb-4">Report any safety concerns and our team will investigate promptly.</p>
              <Link to="/support/ticket"><Button>Report an Issue</Button></Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Safety;
