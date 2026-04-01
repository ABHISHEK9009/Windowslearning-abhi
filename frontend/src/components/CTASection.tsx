import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const features = [
  'Live 1:1 video sessions with industry experts',
  'All mentors are Aadhaar-verified',
  'Secure payments via UPI, Cards & NetBanking',
  'Flexible scheduling — book when you want',
  'Track your learning progress in one dashboard',
];

const CTASection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="py-20 md:py-28"
      style={{ background: 'linear-gradient(135deg, hsl(210, 70%, 12%) 0%, hsl(199, 60%, 20%) 100%)' }}
    >
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className={`text-white text-balance mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            >
              Ready to accelerate your career?
            </h2>
            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li
                  key={feature}
                  className={`flex items-start gap-3 text-white/80 transition-all duration-700 cta-feature-li ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                >
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm md:text-base">{feature}</span>
                </li>
              ))}
            </ul>
            <div
              className={`flex flex-wrap gap-3 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            >
              <Link to="/mentors">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-all">
                  Find a Mentor
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="active:scale-[0.97] transition-all text-green-500 active:text-white"
                >
                  Become a Mentor
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats / Social proof */}
          <div
            className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}
          >
            {[
              { value: '₹500-₹3000', label: 'Per hour, set by mentors' },
              { value: '80%', label: 'Earnings kept by mentors' },
              { value: '98%', label: 'Learner satisfaction' },
              { value: 'Weekly', label: 'Payouts every Friday' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="text-2xl font-bold text-white tabular-nums">{item.value}</div>
                <div className="text-sm text-white/60 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
