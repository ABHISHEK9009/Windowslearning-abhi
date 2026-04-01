import { Link } from 'react-router-dom';
import { Code, BarChart3, Palette, TrendingUp, Briefcase, PenTool } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCategories } from '@/hooks/useApi';

const iconMap: Record<string, React.ElementType> = {
  Code,
  BarChart3,
  Palette,
  TrendingUp,
  Briefcase,
  PenTool,
};

const CategoryGrid = () => {
  const { ref, isVisible } = useScrollReveal();
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) return null;

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container-main">
        <h2
          className={`text-balance mb-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          Explore skill categories
        </h2>
        <p
          className={`text-muted-foreground text-lg mb-12 max-w-xl transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          Find the right mentor for the skill you want to master
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat: any, i: number) => {
            const Icon = iconMap[cat.icon] || Code;
            return (
              <Link
                key={cat.id}
                to={`/mentors?category=${cat.id}`}
                className={`group flex flex-col items-center p-6 rounded-xl bg-card border hover:border-primary/30 shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.97] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: isVisible ? `${150 + i * 80}ms` : '0ms' }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center leading-tight group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
                <span className="mt-2 text-xs text-muted-foreground">{cat._count?.skills || 0} skills</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
