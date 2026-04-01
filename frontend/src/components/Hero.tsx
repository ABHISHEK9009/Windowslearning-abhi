import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const popularSearches = [
  'React Development',
  'Data Science',
  'UI/UX Design',
  'Cloud Architecture',
  'Digital Marketing'
];

const stats = {
  mentorCount: '500+',
  sessionsCompleted: '10,000+',
  satisfaction: '99%',
  avgRating: '4.9/5'
};

import heroBg from '@/assets/hero-bg.jpg';

const Hero = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/mentors?q=${encodeURIComponent(query)}`);
  };

  return (
    <section
      className="relative min-h-[600px] md:min-h-[680px] flex items-center overflow-hidden hero-background"
    >
      {/* Background image */}
      <img
        src={heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        loading="eager"
      />

      <div className="container-main relative z-10 py-24 md:py-32">
        <div className="max-w-2xl">
          <h1
            className="text-white text-balance opacity-0 animate-fade-up"
            style={{ animationDelay: '100ms' }}
          >
            Learn from the best.
            <br />
            <span className="text-accent">Live & interactive.</span>
          </h1>

          <p
            className="mt-5 text-lg md:text-xl text-white/80 max-w-lg opacity-0 animate-fade-up"
            style={{ animationDelay: '250ms' }}
          >
            Connect with verified industry experts for personalized, real-time mentorship sessions. No pre-recorded courses — just live guidance.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mt-8 flex items-center bg-white rounded-lg overflow-hidden shadow-xl opacity-0 animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            <Search className="ml-4 h-5 w-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "React Development" or "Data Science"'
              className="flex-1 h-12 md:h-14 px-3 text-foreground text-sm md:text-base border-none outline-none bg-transparent"
            />
            <button
              type="submit"
              className="h-12 md:h-14 px-6 md:px-8 bg-primary text-primary-foreground font-semibold text-sm md:text-base hover:bg-primary/90 transition-colors active:scale-[0.97]"
            >
              Search
            </button>
          </form>

          {/* Popular tags */}
          <div
            className="mt-5 flex flex-wrap items-center gap-2 opacity-0 animate-fade-up"
            style={{ animationDelay: '550ms' }}
          >
            <span className="text-sm text-white/60 font-medium">Popular:</span>
            {popularSearches.map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/mentors?q=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 text-sm text-white border border-white/30 rounded-full hover:bg-white hover:text-foreground transition-all active:scale-[0.96]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
        <div className="container-main flex items-center justify-between py-4 gap-4 overflow-x-auto">
          {[
            { label: 'Verified Mentors', value: stats.mentorCount },
            { label: 'Sessions Completed', value: stats.sessionsCompleted },
            { label: 'Satisfaction Rate', value: stats.satisfaction },
            { label: 'Avg. Rating', value: stats.avgRating },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center flex-shrink-0 opacity-0 animate-fade-up hero-stat">
              <div className="text-xl md:text-2xl font-bold text-white tabular-nums">{stat.value}</div>
              <div className="text-xs md:text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
