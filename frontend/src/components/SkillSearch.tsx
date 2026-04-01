import React, { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp, Clock, Sparkles, ChevronRight } from 'lucide-react';
import { useSkillSearch, useSkillSuggestions } from '@/hooks/useSkillSearch';
import { Skill } from '@/data/skillTaxonomy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SkillSearchProps {
  onSkillsChange?: (skills: string[]) => void;
  placeholder?: string;
  showRecentSearches?: boolean;
  showTrending?: boolean;
  maxSuggestions?: number;
}

const SkillSearch: React.FC<SkillSearchProps> = ({
  onSkillsChange,
  placeholder = "Search for any skill (e.g., 'web', 'finance', 'editing')...",
  showRecentSearches = true,
  showTrending = true,
  maxSuggestions = 8,
}) => {
  const {
    searchQuery,
    searchResults,
    recentSearches,
    selectedSkills,
    selectedSkillDetails,
    relatedSkills,
    handleSearch,
    setSearchQuery,
    toggleSkill,
    clearSelectedSkills,
    addToRecentSearches,
    highDemandSkills,
  } = useSkillSearch();

  const { suggestions, noResults, closestMatches } = useSkillSuggestions(searchQuery, selectedSkills);
  
  const [isFocused, setIsFocused] = useState(false);
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

  // Handle recent search click
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    searchInputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    } else if (e.key === 'Enter' && searchQuery.trim()) {
      // Add to recent searches but don't select if no exact match
      addToRecentSearches(searchQuery);
      setShowDropdown(false);
    }
  };

  const displaySuggestions = searchQuery.trim() ? suggestions.slice(0, maxSuggestions) : highDemandSkills.slice(0, maxSuggestions);

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-20 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        
        {/* Search indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isFocused && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <span>Searching...</span>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Selected Skills */}
          {selectedSkillDetails.length > 0 && (
            <div className="p-3 border-b bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Selected Skills</span>
                <Button variant="ghost" size="sm" onClick={clearSelectedSkills}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSkillDetails.map(skill => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {skill.name}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground mb-2">
                <Search className="h-3 w-3" />
                <span>Search Results</span>
              </div>
              {displaySuggestions.map(skill => (
                <SkillSuggestionItem
                  key={skill.id}
                  skill={skill}
                  isSelected={selectedSkills.includes(skill.id)}
                  onClick={() => handleSkillSelect(skill)}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}

          {/* No Results with Closest Matches */}
          {noResults && (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">No exact matches found</p>
              {closestMatches.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Did you mean:</p>
                  <div className="space-y-1">
                    {closestMatches.map(skill => (
                      <SkillSuggestionItem
                        key={skill.id}
                        skill={skill}
                        isSelected={selectedSkills.includes(skill.id)}
                        onClick={() => handleSkillSelect(skill)}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Default High-Demand Skills */}
          {!searchQuery.trim() && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground mb-2">
                <TrendingUp className="h-3 w-3" />
                <span>Popular Skills</span>
              </div>
              {displaySuggestions.map(skill => (
                <SkillSuggestionItem
                  key={skill.id}
                  skill={skill}
                  isSelected={selectedSkills.includes(skill.id)}
                  onClick={() => handleSkillSelect(skill)}
                />
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && !searchQuery.trim() && recentSearches.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                <span>Recent Searches</span>
              </div>
              {recentSearches.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(query)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 rounded-md transition-colors flex items-center gap-2"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{query}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          )}

          {/* Related Skills */}
          {relatedSkills.length > 0 && selectedSkills.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Related Skills</span>
              </div>
              <div className="flex flex-wrap gap-2 p-2">
                {relatedSkills.map(skill => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30"
                    onClick={() => handleSkillSelect(skill)}
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Skill Suggestion Item Component
interface SkillSuggestionItemProps {
  skill: Skill;
  isSelected: boolean;
  onClick: () => void;
  searchQuery?: string;
}

const SkillSuggestionItem: React.FC<SkillSuggestionItemProps> = ({
  skill,
  isSelected,
  onClick,
  searchQuery,
}) => {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 rounded-md transition-colors flex items-center justify-between group ${
        isSelected ? 'bg-primary/10 border border-primary/30' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">
            {searchQuery ? highlightText(skill.name, searchQuery) : skill.name}
          </span>
          {skill.trending && (
            <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
          )}
          {skill.demand === 'high' && (
            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{skill.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{skill.category}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{skill.subcategory}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        {isSelected ? (
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-muted rounded-full group-hover:border-primary/50"></div>
        )}
      </div>
    </button>
  );
};

export default SkillSearch;
