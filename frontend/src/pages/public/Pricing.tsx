import { Link } from 'react-router-dom';
import { Check, ArrowRight, IndianRupee, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const plans = [
  {
    name: 'Pay Per Session',
    icon: IndianRupee,
    price: '₹500 - ₹3,000',
    period: 'per hour',
    description: 'Book individual sessions with any mentor. No subscription needed.',
    features: [
      'Access to all verified mentors',
      'Choose session duration (1-4 hours)',
      'Secure payment via UPI/Cards',
      '100% refund on cancellations',
      'Session recordings (with consent)',
    ],
    cta: 'Browse Mentors',
    ctaLink: '/mentors',
    highlight: false,
  },
  {
    name: 'Learning Credits',
    icon: Users,
    price: '₹5,000',
    period: 'for ₹5,500 credits',
    description: 'Buy credits in bulk for a 10% bonus. Use anytime with any mentor.',
    features: [
      'Everything in Pay Per Session',
      '10% bonus on credit purchases',
      'Credits never expire',
      'Priority booking access',
      'Progress dashboard',
    ],
    cta: 'Buy Credits',
    ctaLink: '/signup',
    highlight: true,
  },
  {
    name: 'Corporate Plan',
    icon: Building2,
    price: 'Custom',
    period: 'per team',
    description: 'Upskill your team with custom mentorship programs and reporting.',
    features: [
      'Everything in Learning Credits',
      'Dedicated account manager',
      'Custom mentor matching',
      'Team progress analytics',
      'Invoice-based billing',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
    highlight: false,
  },
];

const Pricing = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 md:py-28 text-center" style={{ background: 'linear-gradient(135deg, hsl(210, 70%, 12%) 0%, hsl(199, 60%, 20%) 100%)' }}>
          <div className="container-main">
            <h1 className="text-white text-balance mb-4 opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Simple, transparent pricing
            </h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto opacity-0 animate-fade-up" style={{ animationDelay: '250ms' }}>
              Pay only for what you need. No hidden fees, no subscriptions required.
            </p>
          </div>
        </section>

        <section ref={ref} className="py-20 md:py-28">
          <div className="container-main">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative rounded-2xl border p-6 md:p-8 transition-all duration-700 ${
                      plan.highlight ? 'bg-card shadow-lg border-primary/30 ring-1 ring-primary/20' : 'bg-card shadow-card'
                    } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{ transitionDelay: isVisible ? `${200 + i * 120}ms` : '0ms' }}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        Most Popular
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                    <div className="mb-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={plan.ctaLink}>
                      <Button
                        className={`w-full gap-2 active:scale-[0.97] transition-all ${plan.highlight ? '' : ''}`}
                        variant={plan.highlight ? 'default' : 'outline'}
                      >
                        {plan.cta} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mentor earnings */}
        <section className="py-16" style={{ backgroundColor: 'hsl(var(--surface-warm))' }}>
          <div className="container-main text-center max-w-2xl">
            <h2 className="mb-4">For Mentors</h2>
            <p className="text-muted-foreground mb-8">
              Set your own rates between ₹500-₹3,000 per hour. Keep 80% of every session earning.
              Weekly payouts every Friday via bank transfer.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="outline" className="gap-2 active:scale-[0.97] transition-all">
                Start Earning <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
