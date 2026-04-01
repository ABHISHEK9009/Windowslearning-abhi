import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Skill, 
  SKILL_TAXONOMY, 
  HIGH_DEMAND_SKILLS, 
  getAllSkills, 
  searchSkills, 
  getRelatedSkills 
} from '@/data/skillTaxonomy';

// Hook for skill search with intelligent matching
export const useSkillSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Get all skills from taxonomy (no API call needed for static data)
  const allSkills = useMemo(() => getAllSkills(), []);

  // Search results with intelligent matching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return HIGH_DEMAND_SKILLS; // Show high-demand skills by default
    }
    
    return searchSkills(searchQuery, allSkills);
  }, [searchQuery, allSkills]);

  // Add to recent searches
  const addToRecentSearches = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 5); // Keep only last 5
    });
  }, []);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addToRecentSearches(query);
    }
  }, [addToRecentSearches]);

  // Toggle skill selection
  const toggleSkill = useCallback((skillId: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        return [...prev, skillId];
      }
    });
  }, []);

  // Clear all selected skills
  const clearSelectedSkills = useCallback(() => {
    setSelectedSkills([]);
  }, []);

  // Get selected skill details
  const selectedSkillDetails = useMemo(() => {
    return selectedSkills.map(id => allSkills.find(skill => skill.id === id)).filter(Boolean) as Skill[];
  }, [selectedSkills, allSkills]);

  // Get related skills for selected skills
  const relatedSkills = useMemo(() => {
    if (selectedSkills.length === 0) return [];
    
    const allRelated = selectedSkills.flatMap(skillId => getRelatedSkills(skillId, 3));
    const uniqueRelated = allRelated.filter((skill, index, self) => 
      self.findIndex(s => s.id === skill.id) === index
    );
    
    return uniqueRelated.slice(0, 6);
  }, [selectedSkills]);

  return {
    // Search state
    searchQuery,
    searchResults,
    recentSearches,
    
    // Selection state
    selectedSkills,
    selectedSkillDetails,
    relatedSkills,
    
    // Actions
    handleSearch,
    setSearchQuery,
    toggleSkill,
    clearSelectedSkills,
    addToRecentSearches,
    
    // Data
    allSkills,
    highDemandSkills: HIGH_DEMAND_SKILLS,
  };
};

// Hook for skill-based filtering of any content
export const useSkillFilter = <T extends { tags?: string[]; skills?: string[] }>(
  items: T[],
  selectedSkills: string[]
) => {
  const filteredItems = useMemo(() => {
    if (selectedSkills.length === 0) return items;
    
    return items.filter(item => {
      const itemTags = [...(item.tags || []), ...(item.skills || [])];
      
      // Check if any selected skill matches item tags
      return selectedSkills.some(skillId => {
        const skill = getAllSkills().find(s => s.id === skillId);
        if (!skill) return false;
        
        // Check direct skill match
        if (itemTags.includes(skillId)) return true;
        
        // Check keyword matches
        const hasKeywordMatch = skill.keywords.some(keyword =>
          itemTags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
        
        // Check tool matches
        const hasToolMatch = skill.tools.some(tool =>
          itemTags.some(tag => tag.toLowerCase().includes(tool.toLowerCase()))
        );
        
        return hasKeywordMatch || hasToolMatch;
      });
    });
  }, [items, selectedSkills]);

  return {
    filteredItems,
    filteredCount: filteredItems.length,
    totalCount: items.length,
    isFiltered: selectedSkills.length > 0,
  };
};

// Hook for trending and popular skills
export const useTrendingSkills = () => {
  const allSkills = useMemo(() => getAllSkills(), []);

  const trendingSkills = useMemo(() => {
    return allSkills
      .filter(skill => skill.trending)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allSkills]);

  const highDemandSkills = useMemo(() => {
    return allSkills
      .filter(skill => skill.demand === 'high')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allSkills]);

  const skillsByCategory = useMemo(() => {
    return SKILL_TAXONOMY.map(category => ({
      ...category,
      skills: category.subcategories.flatMap(sub => sub.skills)
    }));
  }, []);

  return {
    trendingSkills,
    highDemandSkills,
    skillsByCategory,
  };
};

// Hook for auto-suggestions and smart recommendations
export const useSkillSuggestions = (query: string, selectedSkills: string[]) => {
  const allSkills = useMemo(() => getAllSkills(), []);

  const suggestions = useMemo(() => {
    if (!query.trim() && selectedSkills.length === 0) {
      return HIGH_DEMAND_SKILLS.slice(0, 5);
    }

    let candidates: Skill[] = [];

    if (query.trim()) {
      candidates = searchSkills(query, allSkills).slice(0, 8);
    } else if (selectedSkills.length > 0) {
      candidates = selectedSkills.flatMap(skillId => getRelatedSkills(skillId, 3));
      // Remove duplicates and already selected
      candidates = candidates.filter((skill, index, self) => 
        self.findIndex(s => s.id === skill.id) === index && !selectedSkills.includes(skill.id)
      ).slice(0, 8);
    }

    return candidates;
  }, [query, selectedSkills, allSkills]);

  const noResults = query.trim() && suggestions.length === 0;

  const closestMatches = useMemo(() => {
    if (!noResults) return [];
    
    // Find closest matches using Levenshtein distance approximation
    return allSkills
      .map(skill => ({
        skill,
        score: calculateSimilarity(query.toLowerCase(), skill.name.toLowerCase())
      }))
      .filter(item => item.score > 0.3) // 30% similarity threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.skill);
  }, [query, allSkills, noResults]);

  return {
    suggestions,
    noResults,
    closestMatches,
  };
};

// Simple similarity calculation for closest matches
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
