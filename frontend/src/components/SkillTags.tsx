import React from 'react';
import { X, TrendingUp, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skill } from '@/data/skillTaxonomy';

interface SkillTagsProps {
  skills: Skill[];
  onRemove?: (skillId: string) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  showDemand?: boolean;
  showTrending?: boolean;
  compact?: boolean;
}

const SkillTags: React.FC<SkillTagsProps> = ({
  skills,
  onRemove,
  onClearAll,
  maxVisible = 10,
  showDemand = true,
  showTrending = true,
  compact = false,
}) => {
  if (skills.length === 0) return null;

  const visibleSkills = skills.slice(0, maxVisible);
  const hiddenSkills = skills.slice(maxVisible);

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDemandIcon = (demand: string) => {
    switch (demand) {
      case 'high':
        return <Star className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {visibleSkills.map(skill => (
            <Badge
              key={skill.id}
              variant="secondary"
              className={`${getDemandColor(skill.demand)} text-xs px-2 py-0.5`}
            >
              {skill.name}
              {showTrending && skill.trending && (
                <TrendingUp className="ml-1 h-3 w-3 text-green-600" />
              )}
            </Badge>
          ))}
          {hiddenSkills.length > 0 && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              +{hiddenSkills.length}
            </Badge>
          )}
        </div>
        {onClearAll && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs">
            Clear
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with count and clear all */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Selected Skills</span>
          <Badge variant="secondary" className="text-xs">
            {skills.length}
          </Badge>
        </div>
        {onClearAll && (
          <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
            Clear All
          </Button>
        )}
      </div>

      {/* Skill Tags */}
      <div className="flex flex-wrap gap-2">
        {visibleSkills.map(skill => (
          <Badge
            key={skill.id}
            className={`${getDemandColor(skill.demand)} px-3 py-1.5 text-sm font-medium group relative`}
          >
            <div className="flex items-center gap-2">
              {/* Skill Name */}
              <span>{skill.name}</span>
              
              {/* Indicators */}
              <div className="flex items-center gap-1">
                {showTrending && skill.trending && (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                )}
                {showDemand && getDemandIcon(skill.demand)}
              </div>
              
              {/* Remove Button */}
              {onRemove && (
                <button
                  onClick={() => onRemove(skill.id)}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </Badge>
        ))}
        
        {/* Hidden Skills Counter */}
        {hiddenSkills.length > 0 && (
          <Badge variant="outline" className="px-3 py-1.5 text-sm">
            +{hiddenSkills.length} more
          </Badge>
        )}
      </div>

      {/* Skill Details Summary */}
      {skills.length <= 3 && (
        <div className="space-y-1 text-xs text-muted-foreground">
          {skills.map(skill => (
            <div key={skill.id} className="flex items-center gap-2">
              <span>{skill.category} • {skill.subcategory}</span>
              {skill.tools.length > 0 && (
                <span>• Tools: {skill.tools.slice(0, 3).join(', ')}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Categories Summary */}
      {skills.length > 3 && (
        <div className="text-xs text-muted-foreground">
          <div>Categories: {[...new Set(skills.map(s => s.category))].join(', ')}</div>
          <div>Top tools: {[...new Set(skills.flatMap(s => s.tools))].slice(0, 5).join(', ')}</div>
        </div>
      )}
    </div>
  );
};

// Individual Skill Tag Component
interface SkillTagProps {
  skill: Skill;
  onRemove?: () => void;
  showDemand?: boolean;
  showTrending?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SkillTag: React.FC<SkillTagProps> = ({
  skill,
  onRemove,
  showDemand = true,
  showTrending = true,
  size = 'md',
}) => {
  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <Badge className={`${getDemandColor(skill.demand)} ${getSizeClasses()} font-medium group relative`}>
      <div className="flex items-center gap-2">
        <span>{skill.name}</span>
        
        <div className="flex items-center gap-1">
          {showTrending && skill.trending && (
            <TrendingUp className="h-3 w-3 text-green-600" />
          )}
          {showDemand && skill.demand === 'high' && (
            <Star className="h-3 w-3 text-orange-600" />
          )}
        </div>
        
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </Badge>
  );
};

export default SkillTags;
