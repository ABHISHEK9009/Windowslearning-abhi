import { Link } from 'react-router-dom';
import {
  Search, Calendar, Video, MessageCircle, ShieldCheck,
  CreditCard, Clock, Star, Users, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const learnerSteps = [
  { icon: Search, title: 'Browse Verified Mentors', description: 'Search by skill, price, or availability. Every mentor is Aadhaar-verified for your safety.' },
  { icon: Calendar, title: 'Book a Session', description: 'Choose 1-hour, 2-hour, or 4-hour live sessions. Pick time slots that work for you.' },
  { icon: Video, title: 'Learn in Real-Time', description: 'Connect via live video for interactive sessions with personalized feedback and guidance.' },
  { icon: MessageCircle, title: 'Get Ongoing Support', description: 'Access resources, track progress, and rebook your favorite mentors anytime.' },
];

const mentorSteps = [
  { icon: Users, title: 'Apply & Get Verified', description: 'Submit your expertise and complete Aadhaar verification to join our mentor network.' },
  { icon: CreditCard, title: 'Set Your Rates', description: 'Price your sessions between ₹500-₹3000 per hour. You keep 80% of every session.' },
  { icon: Clock, title: 'Manage Your Schedule', description: 'Set your availability and accept bookings on your own terms.' },
  { icon: Star, title: 'Earn & Grow', description: 'Get weekly payouts every Friday. Build your reputation with reviews and ratings.' },
];

const HowItWorksPage = () => {
  const { ref: ref1, isVisible: v1 } = useScrollReveal();
  const { ref: ref2, isVisible: v2 } = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-28 text-center how-it-works-hero">
          <div className="container-main">
            <h1 className="text-white text-balance mb-4 opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
              How Windows Learning Works
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto opacity-0 animate-fade-up" style={{ animationDelay: '250ms' }}>
              Whether you want to learn or teach — getting started takes just a few steps
            </p>
          </div>
        </section>

        {/* For Learners */}
        <section ref={ref1} className="py-20 md:py-28">
          <div className="container-main">
            <div className="text-center mb-16">
              <span className={`inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 transition-all duration-700 ${v1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                For Learners
              </span>
              <h2 className={`text-balance transition-all duration-700 delay-100 ${v1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                Start learning in 4 simple steps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {learnerSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className={`relative text-center transition-all duration-700 ${v1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{ transitionDelay: v1 ? `${200 + i * 100}ms` : '0ms' }}
                  >
                    <div className="flex items-center justify-center mb-5">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">Step {i + 1}</span>
                    <h3 className="text-lg font-semibold mt-1 mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* For Mentors */}
        <section ref={ref2} className="py-20 md:py-28" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
          <div className="container-main">
            <div className="text-center mb-16">
              <span className={`inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4 transition-all duration-700 ${v2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                For Mentors
              </span>
              <h2 className={`text-balance transition-all duration-700 delay-100 ${v2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                Start earning from your expertise
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {mentorSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className={`relative text-center transition-all duration-700 ${v2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{ transitionDelay: v2 ? `${200 + i * 100}ms` : '0ms' }}
                  >
                    <div className="flex items-center justify-center mb-5">
                      <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Icon className="h-7 w-7 text-accent" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground tabular-nums">Step {i + 1}</span>
                    <h3 className="text-lg font-semibold mt-1 mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="py-20 md:py-28">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="text-balance mb-4">Built on trust & security</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: ShieldCheck, title: 'Aadhaar Verified', desc: 'Every mentor undergoes identity verification for your safety.' },
                { icon: CreditCard, title: 'Secure Payments', desc: 'PCI-compliant transactions via UPI, Cards & NetBanking.' },
                { icon: Star, title: 'Transparent Reviews', desc: 'Honest ratings from real learners to guide your choice.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="text-center p-6 rounded-xl bg-card border shadow-card">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center how-it-works-cta-section">
          <div className="container-main">
            <h2 className="text-balance mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join thousands of learners and mentors on India's most trusted live mentorship platform.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/mentors">
                <Button size="lg" className="gap-2 active:scale-[0.97] transition-all">
                  Browse Mentors <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="gap-2 active:scale-[0.97] transition-all text-green-500 active:text-white">
                  Become a Mentor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
