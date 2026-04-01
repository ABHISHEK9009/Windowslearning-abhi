import { useState } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useSkills, useSkillsByCategory } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

interface SkillsFilterProps {
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  onClearAll: () => void;
}

const SkillsFilter = ({ selectedSkills, onSkillToggle, onClearAll }: SkillsFilterProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Programming': true,
    'Design': false,
    'Business': false,
    'Data Science': false,
    'Marketing': false,
    'Writing': false,
    'Languages': false,
    'Other': false
  });

  const { data: skillsByCategory = {}, isLoading } = useSkillsByCategory();
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredSkillsByCategory = Object.entries(skillsByCategory).reduce((acc, [category, skills]) => {
    const filteredSkills = skills.filter(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredSkills.length > 0) {
      acc[category] = filteredSkills;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const totalSkillsCount = Object.values(skillsByCategory).reduce((total, skills) => total + skills.length, 0);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Skills Filter</h3>
        {selectedSkills.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear All ({selectedSkills.length})
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Skills Count */}
      <p className="text-sm text-muted-foreground">
        {totalSkillsCount} skills available across {Object.keys(skillsByCategory).length} categories
      </p>

      {/* Skills by Category */}
      <div className="space-y-3">
        {Object.entries(filteredSkillsByCategory).map(([category, skills]) => (
          <div key={category} className="border rounded-lg">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm">{category}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">({skills.length})</span>
                {expandedCategories[category] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>
            
            {expandedCategories[category] && (
              <div className="px-3 pb-3 border-t">
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => onSkillToggle(skill)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {skill}
                        {isSelected && (
                          <X className="inline-block ml-1 h-3 w-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {Object.keys(filteredSkillsByCategory).length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No skills found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Selected Skills Summary */}
      {selectedSkills.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-2">Selected Skills:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => (
              <span
                key={skill}
                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsFilter;
