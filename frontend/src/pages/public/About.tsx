import { Link } from 'react-router-dom';
import { Target, Eye, Users, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const stats = {
  mentorCount: '500+',
  sessionsCompleted: '10,000+',
  satisfaction: '99%',
  avgRating: '4.9/5'
};
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 md:py-28 about-hero">
          <div className="container-main max-w-3xl text-center">
            <h1 className="text-white text-balance mb-5 opacity-0 animate-fade-up" style={{ animationDelay: '100ms' }}>
              Democratizing skill development across India
            </h1>
            <p className="text-white/70 text-lg opacity-0 animate-fade-up" style={{ animationDelay: '250ms' }}>
              Windows Learning connects learners directly with verified industry experts through affordable, real-time video sessions — no pre-recorded courses, just personalized knowledge transfer.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section ref={ref} className="py-20 md:py-28">
          <div className="container-main">
            <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              {[
                { icon: Target, title: 'Our Mission', text: 'To democratize skill development by connecting learners directly with industry experts through affordable, real-time video sessions — regardless of their location or budget.' },
                { icon: Eye, title: 'Our Vision', text: 'To become India\'s most trusted live mentorship platform where every learner can access expert guidance and every professional can build a meaningful second career by sharing their knowledge.' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`p-8 rounded-2xl bg-card border shadow-card transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{ transitionDelay: isVisible ? `${200 + i * 150}ms` : '0ms' }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 about-stats-section">
          <div className="container-main">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto text-center">
              {[
                { value: stats.mentorCount, label: 'Verified Mentors' },
                { value: stats.sessionsCompleted, label: 'Sessions Completed' },
                { value: stats.satisfaction, label: 'Satisfaction Rate' },
                { value: stats.avgRating, label: 'Avg. Rating' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-primary tabular-nums">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28">
          <div className="container-main text-center">
            <h2 className="text-balance mb-12">What drives us</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Users, title: 'Community First', desc: 'We build for learners and mentors, creating genuine connections that transform careers.' },
                { icon: ShieldCheck, title: 'Trust & Safety', desc: 'Every mentor is Aadhaar-verified. Every transaction is secure. Every dispute is resolved fairly.' },
                { icon: Globe, title: 'Accessibility', desc: 'Affordable sessions starting at ₹500/hr make expert guidance available to anyone, anywhere in India.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-6 rounded-xl bg-card border shadow-card">
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
        <section className="py-16 text-center about-cta-section">
          <div className="container-main">
            <h2 className="mb-4">Join our growing community</h2>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/mentors">
                <Button size="lg" className="gap-2 active:scale-[0.97] transition-all">
                  Start Learning <ArrowRight className="h-4 w-4" />
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

export default About;
