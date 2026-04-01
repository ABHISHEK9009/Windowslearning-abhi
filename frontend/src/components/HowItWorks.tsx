import { Search, Calendar, Video, MessageCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const steps = [
  {
    icon: Search,
    title: 'Browse Verified Mentors',
    description: 'Search by skill, price, or availability. Every mentor is Aadhaar-verified.',
  },
  {
    icon: Calendar,
    title: 'Book a Session',
    description: 'Choose 1-hour, 2-hour, or 4-hour live sessions at times that work for you.',
  },
  {
    icon: Video,
    title: 'Learn in Real-Time',
    description: 'Connect via live video for interactive sessions with personalized feedback.',
  },
  {
    icon: MessageCircle,
    title: 'Get Ongoing Support',
    description: 'Access resources, track progress, and rebook your favorite mentors anytime.',
  },
];

const HowItWorks = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container-main">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2
            className={`text-balance mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          >
            How Windows Learning works
          </h2>
          <p
            className={`text-muted-foreground text-lg transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
          >
            From browsing to learning — it takes just a few clicks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className={`relative text-center lg:text-left transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: isVisible ? `${200 + i * 100}ms` : '0ms' }}
              >
                {/* Step number connector */}
                <div className="flex items-center justify-center lg:justify-start mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="ml-3 text-sm font-bold text-muted-foreground tabular-nums">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
