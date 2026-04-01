import React, { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { useSkillSearch, useSkillSuggestions } from '@/hooks/useSkillSearch';
import { Skill } from '@/data/skillTaxonomy';

interface SimpleSkillSearchProps {
  onSkillsChange?: (skills: string[]) => void;
  placeholder?: string;
  maxSuggestions?: number;
}

const SimpleSkillSearch: React.FC<SimpleSkillSearchProps> = ({
  onSkillsChange,
  placeholder = "Search skills...",
  maxSuggestions = 10,
}) => {
  const {
    searchQuery,
    selectedSkills,
    handleSearch,
    setSearchQuery,
    toggleSkill,
    clearSelectedSkills,
    addToRecentSearches,
    highDemandSkills,
  } = useSkillSearch();

  const { suggestions } = useSkillSuggestions(searchQuery, selectedSkills);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Notify parent of skill changes
  useEffect(() => {
    onSkillsChange?.(selectedSkills);
  }, [selectedSkills, onSkillsChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
  };

  // Handle skill selection
  const handleSkillSelect = (skill: Skill) => {
    toggleSkill(skill.id);
    addToRecentSearches(skill.name);
    setSearchQuery('');
    setShowDropdown(false);
    searchInputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === 'Enter' && searchQuery.trim()) {
      addToRecentSearches(searchQuery);
      setShowDropdown(false);
    }
  };

  // Get more variety of skills - combine high demand with all categories
  const getAllSkillsVariety = () => {
    const allSkills = [
      // High demand skills first
      ...highDemandSkills,
      
      // Add more skills from different categories for variety
      { id: 'mobile-development', name: 'Mobile App Development', category: 'Technology', subcategory: 'Mobile Development', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Building mobile applications' },
      { id: 'digital-marketing', name: 'Digital Marketing', category: 'Business', subcategory: 'Sales & Marketing', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Online marketing strategies' },
      { id: 'graphic-design', name: 'Graphic Design', category: 'Creative', subcategory: 'Design', keywords: [], tools: [], demand: 'high' as const, trending: false, description: 'Visual design and branding' },
      { id: 'content-writing', name: 'Content Writing', category: 'Creative', subcategory: 'Content Creation', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Writing engaging content' },
      { id: 'project-management', name: 'Project Management', category: 'Business', subcategory: 'Management', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Project planning and execution' },
      { id: 'data-analysis', name: 'Data Analysis', category: 'Technology', subcategory: 'AI & Machine Learning', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Analyzing and interpreting data' },
      { id: 'video-editing', name: 'Video Editing', category: 'Creative', subcategory: 'Content Creation', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Video production and editing' },
      { id: 'financial-analysis', name: 'Financial Analysis', category: 'Business', subcategory: 'Finance', keywords: [], tools: [], demand: 'high' as const, trending: false, description: 'Financial planning and analysis' },
      { id: 'cloud-computing', name: 'Cloud Computing', category: 'Technology', subcategory: 'Cloud & DevOps', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Cloud infrastructure services' },
      { id: 'sales', name: 'Sales', category: 'Business', subcategory: 'Sales & Marketing', keywords: [], tools: [], demand: 'high' as const, trending: false, description: 'Sales techniques and business development' },
      { id: 'ui-ux-design', name: 'UI/UX Design', category: 'Creative', subcategory: 'Design', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'User interface and experience design' },
      { id: 'machine-learning', name: 'Machine Learning', category: 'Technology', subcategory: 'AI & Machine Learning', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Building ML models and systems' },
      { id: 'social-media-marketing', name: 'Social Media Marketing', category: 'Business', subcategory: 'Sales & Marketing', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Social media strategy and management' },
      { id: 'backend-development', name: 'Backend Development', category: 'Technology', subcategory: 'Web Development', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Server-side development' },
      { id: 'android-development', name: 'Android Development', category: 'Technology', subcategory: 'Mobile Development', keywords: [], tools: [], demand: 'high' as const, trending: false, description: 'Building Android apps' },
      { id: 'ios-development', name: 'iOS Development', category: 'Technology', subcategory: 'Mobile Development', keywords: [], tools: [], demand: 'high' as const, trending: false, description: 'Building iOS apps' },
      { id: 'devops', name: 'DevOps', category: 'Technology', subcategory: 'Cloud & DevOps', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Development operations and automation' },
      { id: 'investment-banking', name: 'Investment Banking', category: 'Business', subcategory: 'Finance', keywords: [], tools: [], demand: 'high' as const, trending: false, description: 'Investment banking services' },
      { id: 'product-management', name: 'Product Management', category: 'Business', subcategory: 'Management', keywords: [], tools: [], demand: 'high' as const, trending: true, description: 'Product strategy and development' },
      { id: 'virtual-assistant', name: 'Virtual Assistant', category: 'Operations', subcategory: 'Administration & Support', keywords: [], tools: [], demand: 'medium' as const, trending: true, description: 'Administrative support services' },
    ];

    // Remove duplicates and return variety
    const uniqueSkills = allSkills.filter((skill, index, self) => 
      self.findIndex(s => s.id === skill.id) === index
    );

    return uniqueSkills.slice(0, maxSuggestions);
  };

  const displaySkills = searchQuery.trim() 
    ? suggestions.slice(0, maxSuggestions)
    : getAllSkillsVariety();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-8 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Simple Dropdown - Just Skills */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {displaySkills.length > 0 ? (
            <div className="py-1">
              {displaySkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillSelect(skill)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                    selectedSkills.includes(skill.id) ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{skill.name}</span>
                    {skill.trending && (
                      <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  {selectedSkills.includes(skill.id) && (
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-sm text-muted-foreground">
              No skills found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleSkillSearch;
