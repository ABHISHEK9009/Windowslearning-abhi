import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const faqs = [
  { q: 'How does Windows Learning work?', a: 'Windows Learning connects learners with verified industry experts for live, 1-on-1 mentoring sessions via video call. Browse mentors by skill, book a session, and learn in real-time.' },
  { q: 'How are mentors verified?', a: 'All mentors undergo Aadhaar/Government ID verification. We also review their professional experience, qualifications, and conduct background checks before approval.' },
  { q: 'What does a session cost?', a: 'Session rates range from ₹500 to ₹3,000 per hour, set by individual mentors. There are no subscription fees — you pay only for the sessions you book.' },
  { q: 'Can I get a refund for a cancelled session?', a: 'Yes! If you cancel 24 hours before the session, you receive a full refund to your wallet. Cancellations within 24 hours receive a 50% refund.' },
  { q: 'How do mentors get paid?', a: 'Mentors receive 80% of the session fee (20% platform commission). Payouts are processed every Friday via bank transfer.' },
  { q: 'What technology is used for sessions?', a: 'Sessions are conducted via Zoom integration. You\'ll receive a meeting link before your scheduled session. No additional software installation is required.' },
  { q: 'How do I become a mentor?', a: 'Click "Join as Mentor" and complete the onboarding process: add your skills, experience, set your rate, and upload a government ID for verification. Approval takes 24-48 hours.' },
  { q: 'Is my data secure?', a: 'Yes. We use AES-256 encryption for sensitive data, PCI-compliant payment processing via Razorpay, and regular security audits to protect your information.' },
  { q: 'Can companies use Windows Learning for team training?', a: 'Absolutely! We offer Corporate Plans with custom pricing for team upskilling. Contact us at corporate@windowslearning.com for details.' },
  { q: 'What if I have an issue with a session?', a: 'You can report any issues through our Help Center or submit a support ticket. Our admin mediation team resolves disputes within 48 hours.' },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-center mb-8">Everything you need to know about Windows Learning</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card key={i} className="overflow-hidden">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left">
                  <span className="font-medium text-sm pr-4">{faq.q}</span>
                  {openIndex === i ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </button>
                {openIndex === i && (
                  <CardContent className="pt-0 pb-5 px-5">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
