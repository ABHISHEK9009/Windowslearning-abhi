import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Search, SlidersHorizontal, Code, BarChart3, Palette, TrendingUp, Briefcase, PenTool, ArrowLeft } from 'lucide-react';
import MentorCard from '@/components/MentorCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useMentors, useCategories } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

const iconMap: Record<string, React.ElementType> = {
  Code, BarChart3, Palette, TrendingUp, Briefcase, PenTool,
};

const BrowseMentors = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [aiFilters, setAiFilters] = useState<{ skill?: string, required_skills?: string[], problem_summary?: string, intent?: string, experience_level?: string }>({});
  const [aiMentors, setAiMentors] = useState<any[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Determine dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'MENTOR' ? '/mentor/dashboard' : '/dashboard';
  };

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch AI Intent
  useEffect(() => {
    const fetchIntent = async () => {
      if (!debouncedQuery.trim()) {
        setAiFilters({});
        setAiMentors(null);
        return;
      }
      
      setIsAiLoading(true);
      try {
        const response = await api.post('/ai/search-intent', { query: debouncedQuery });
        // New API structure directly resolving ranked mentors & ai filters
        const { aiOutput, mentors } = response.data;
        setAiFilters(aiOutput || {});
        setAiMentors(mentors || []);
      } catch (error) {
        console.error('AI search intent failed. Falling back to simple keyword search.', error);
        setAiFilters({ skill: debouncedQuery });
        setAiMentors(null);
      } finally {
        setIsAiLoading(false);
      }
    };
    
    fetchIntent();
  }, [debouncedQuery]);

  // Basic filters
  const filters = useMemo(() => {
    const f: any = {};
    if (aiFilters.skill) f.skill = aiFilters.skill;
    else if (debouncedQuery) f.skill = debouncedQuery; // Fallback
    
    if (selectedCategory) f.category = selectedCategory;
    
    if (priceRange === 'low') { f.minPrice = 500; f.maxPrice = 1200; }
    else if (priceRange === 'mid') { f.minPrice = 1200; f.maxPrice = 2000; }
    else if (priceRange === 'high') { f.minPrice = 2000; }
    return f;
  }, [aiFilters, debouncedQuery, selectedCategory, priceRange]);

  const { data: standardMentors = [], isLoading: isMentorsLoading } = useMentors(filters);

  const mentors = aiMentors !== null ? aiMentors : standardMentors;
  const isLoading = (aiMentors === null && isMentorsLoading) || isAiLoading;

  const clearAllFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setPriceRange('all');
  };

  const hasActiveFilters = query || selectedCategory || priceRange !== 'all';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container-main py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {user && (
                <Link 
                  to={getDashboardLink()}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find your mentor</h1>
            <p className="text-muted-foreground">Browse verified experts across various skill categories</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your problem, e.g., 'I am stuck in my career and need help with interviews'..."
                className="w-full h-11 pl-10 pr-4 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 h-11 px-4 rounded-lg border text-sm font-medium"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>

          {/* AI Problem UX Layer */}
          {aiFilters.problem_summary && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Understanding: {aiFilters.problem_summary}
              </h3>
              {aiFilters.required_skills && aiFilters.required_skills.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">We found mentors to help with:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiFilters.required_skills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium transition-colors hover:bg-primary/20">
                        🎯 {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 space-y-6`}>
              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Active Filters</h4>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {query && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-background rounded">Search: {query}</span>
                      </div>
                    )}
                    {selectedCategory && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-background rounded">Category: {selectedCategory}</span>
                      </div>
                    )}
                    {priceRange !== 'all' && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-background rounded">Price: {priceRange}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="border rounded-lg bg-card p-4">
                <h4 className="text-sm font-semibold mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block text-sm w-full text-left px-3 py-1.5 rounded-md transition-colors ${
                      !selectedCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => {
                    const Icon = iconMap[cat.icon] || Code;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 text-sm w-full text-left px-3 py-1.5 rounded-md transition-colors ${
                          selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <Icon className="h-4 w-4" /> {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="border rounded-lg bg-card p-4">
                <h4 className="text-sm font-semibold mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Prices' },
                    { value: 'low', label: '₹500 - ₹1,200/hr' },
                    { value: 'mid', label: '₹1,200 - ₹2,000/hr' },
                    { value: 'high', label: '₹2,000+/hr' }
                  ].map(range => (
                    <button
                      key={range.value}
                      onClick={() => setPriceRange(range.value as any)}
                      className={`block text-sm w-full text-left px-3 py-1.5 rounded-md transition-colors ${
                        priceRange === range.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Results Summary */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {hasActiveFilters ? (
                          <>
                            Showing <span className="font-medium text-foreground">{mentors.length}</span> mentors
                          </>
                        ) : (
                          <>
                            <span className="font-medium text-foreground">{mentors.length}</span> mentor{mentors.length !== 1 ? 's' : ''} found
                          </>
                        )}
                      </p>
                      {hasActiveFilters && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Filtered by: {query && 'search'}
                          {query && selectedCategory && ' • '}
                          {selectedCategory && 'category'}
                          {(query && selectedCategory) && priceRange !== 'all' && ' • '}
                          {priceRange !== 'all' && 'price range'}
                        </p>
                      )}
                    </div>
                    
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  {/* Results Grid */}
                  {mentors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {mentors.map((mentor: any, i: number) => (
                        <MentorCard key={mentor.id} mentor={mentor} index={i} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        {hasActiveFilters 
                          ? "Try adjusting your search or filters"
                          : "No mentors are available at the moment. Check back later!"
                        }
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseMentors;
