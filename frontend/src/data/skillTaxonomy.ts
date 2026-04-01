// Comprehensive Skill Taxonomy for Universal Coverage
export interface Skill {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  keywords: string[];
  tools: string[];
  demand: 'high' | 'medium' | 'low';
  trending: boolean;
  description: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: SkillSubcategory[];
}

export interface SkillSubcategory {
  id: string;
  name: string;
  skills: Skill[];
}

// Universal Skill Taxonomy
export const SKILL_TAXONOMY: SkillCategory[] = [
  {
    id: 'technology',
    name: 'Technology',
    icon: 'Code',
    description: 'Software development, IT, and technical skills',
    subcategories: [
      {
        id: 'web-development',
        name: 'Web Development',
        skills: [
          {
            id: 'web-development',
            name: 'Web Development',
            category: 'Technology',
            subcategory: 'Web Development',
            keywords: ['web', 'website', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript'],
            tools: ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'AWS'],
            demand: 'high',
            trending: true,
            description: 'Building websites and web applications'
          },
          {
            id: 'frontend-development',
            name: 'Frontend Development',
            category: 'Technology',
            subcategory: 'Web Development',
            keywords: ['frontend', 'ui', 'ux', 'react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css'],
            tools: ['React', 'Vue', 'Angular', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Webpack'],
            demand: 'high',
            trending: true,
            description: 'Building user interfaces and user experiences'
          },
          {
            id: 'backend-development',
            name: 'Backend Development',
            category: 'Technology',
            subcategory: 'Web Development',
            keywords: ['backend', 'server', 'api', 'database', 'nodejs', 'python', 'java', 'php'],
            tools: ['Node.js', 'Python', 'Java', 'PHP', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker'],
            demand: 'high',
            trending: true,
            description: 'Building server-side applications and APIs'
          },
          {
            id: 'fullstack-development',
            name: 'Full Stack Development',
            category: 'Technology',
            subcategory: 'Web Development',
            keywords: ['fullstack', 'full-stack', 'mern', 'mean', 'lamp', 'web', 'complete'],
            tools: ['React', 'Node.js', 'MongoDB', 'Express', 'Python', 'Django', 'PostgreSQL'],
            demand: 'high',
            trending: true,
            description: 'End-to-end web development'
          }
        ]
      },
      {
        id: 'mobile-development',
        name: 'Mobile Development',
        skills: [
          {
            id: 'mobile-app-development',
            name: 'Mobile App Development',
            category: 'Technology',
            subcategory: 'Mobile Development',
            keywords: ['mobile', 'app', 'android', 'ios', 'smartphone', 'tablet'],
            tools: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Android Studio', 'Xcode'],
            demand: 'high',
            trending: true,
            description: 'Building mobile applications'
          },
          {
            id: 'android-development',
            name: 'Android Development',
            category: 'Technology',
            subcategory: 'Mobile Development',
            keywords: ['android', 'java', 'kotlin', 'mobile', 'google play'],
            tools: ['Kotlin', 'Java', 'Android Studio', 'Gradle', 'Firebase'],
            demand: 'high',
            trending: false,
            description: 'Building Android applications'
          },
          {
            id: 'ios-development',
            name: 'iOS Development',
            category: 'Technology',
            subcategory: 'Mobile Development',
            keywords: ['ios', 'iphone', 'ipad', 'swift', 'objective-c', 'apple'],
            tools: ['Swift', 'Objective-C', 'Xcode', 'CocoaPods', 'SwiftUI'],
            demand: 'high',
            trending: false,
            description: 'Building iOS applications'
          }
        ]
      },
      {
        id: 'ai-ml',
        name: 'AI & Machine Learning',
        skills: [
          {
            id: 'machine-learning',
            name: 'Machine Learning',
            category: 'Technology',
            subcategory: 'AI & Machine Learning',
            keywords: ['ml', 'machine learning', 'ai', 'artificial intelligence', 'data science', 'python'],
            tools: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Jupyter', 'Pandas'],
            demand: 'high',
            trending: true,
            description: 'Building machine learning models and systems'
          },
          {
            id: 'data-science',
            name: 'Data Science',
            category: 'Technology',
            subcategory: 'AI & Machine Learning',
            keywords: ['data science', 'analytics', 'data analysis', 'statistics', 'python', 'r'],
            tools: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Excel', 'Jupyter'],
            demand: 'high',
            trending: true,
            description: 'Analyzing and interpreting complex data'
          },
          {
            id: 'deep-learning',
            name: 'Deep Learning',
            category: 'Technology',
            subcategory: 'AI & Machine Learning',
            keywords: ['deep learning', 'neural networks', 'tensorflow', 'pytorch', 'ai'],
            tools: ['TensorFlow', 'PyTorch', 'Keras', 'CUDA', 'Python', 'Jupyter'],
            demand: 'high',
            trending: true,
            description: 'Advanced neural network and deep learning techniques'
          }
        ]
      },
      {
        id: 'cloud-devops',
        name: 'Cloud & DevOps',
        skills: [
          {
            id: 'cloud-computing',
            name: 'Cloud Computing',
            category: 'Technology',
            subcategory: 'Cloud & DevOps',
            keywords: ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'infrastructure'],
            tools: ['AWS', 'Azure', 'Google Cloud', 'Terraform', 'Docker', 'Kubernetes'],
            demand: 'high',
            trending: true,
            description: 'Cloud infrastructure and services'
          },
          {
            id: 'devops',
            name: 'DevOps',
            category: 'Technology',
            subcategory: 'Cloud & DevOps',
            keywords: ['devops', 'cicd', 'deployment', 'automation', 'infrastructure'],
            tools: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Ansible', 'Terraform'],
            demand: 'high',
            trending: true,
            description: 'Development operations and automation'
          }
        ]
      }
    ]
  },
  {
    id: 'business',
    name: 'Business',
    icon: 'Briefcase',
    description: 'Business, finance, and management skills',
    subcategories: [
      {
        id: 'sales-marketing',
        name: 'Sales & Marketing',
        skills: [
          {
            id: 'digital-marketing',
            name: 'Digital Marketing',
            category: 'Business',
            subcategory: 'Sales & Marketing',
            keywords: ['marketing', 'digital', 'online', 'seo', 'sem', 'social media'],
            tools: ['Google Analytics', 'Facebook Ads', 'Google Ads', 'Mailchimp', 'HubSpot'],
            demand: 'high',
            trending: true,
            description: 'Online marketing and digital advertising'
          },
          {
            id: 'sales',
            name: 'Sales',
            category: 'Business',
            subcategory: 'Sales & Marketing',
            keywords: ['sales', 'selling', 'revenue', 'business development', 'b2b'],
            tools: ['Salesforce', 'HubSpot', 'LinkedIn Sales Navigator', 'ZoomInfo'],
            demand: 'high',
            trending: false,
            description: 'Sales techniques and business development'
          },
          {
            id: 'social-media-marketing',
            name: 'Social Media Marketing',
            category: 'Business',
            subcategory: 'Sales & Marketing',
            keywords: ['social media', 'facebook', 'instagram', 'twitter', 'linkedin', 'content'],
            tools: ['Facebook Business', 'Instagram', 'LinkedIn', 'Twitter', 'Buffer', 'Hootsuite'],
            demand: 'high',
            trending: true,
            description: 'Social media strategy and management'
          }
        ]
      },
      {
        id: 'finance',
        name: 'Finance',
        skills: [
          {
            id: 'financial-analysis',
            name: 'Financial Analysis',
            category: 'Business',
            subcategory: 'Finance',
            keywords: ['finance', 'financial', 'analysis', 'accounting', 'investment', 'banking'],
            tools: ['Excel', 'QuickBooks', 'SAP', 'Bloomberg', 'Financial Modeling'],
            demand: 'high',
            trending: false,
            description: 'Financial planning and analysis'
          },
          {
            id: 'investment-banking',
            name: 'Investment Banking',
            category: 'Business',
            subcategory: 'Finance',
            keywords: ['investment', 'banking', 'finance', 'mergers', 'acquisitions', 'ipo'],
            tools: ['Excel', 'Bloomberg', 'Capital IQ', 'Financial Modeling', 'Valuation'],
            demand: 'high',
            trending: false,
            description: 'Investment banking and financial services'
          }
        ]
      },
      {
        id: 'management',
        name: 'Management',
        skills: [
          {
            id: 'project-management',
            name: 'Project Management',
            category: 'Business',
            subcategory: 'Management',
            keywords: ['project', 'management', 'pmp', 'agile', 'scrum', 'planning'],
            tools: ['Jira', 'Asana', 'Trello', 'Microsoft Project', 'Slack', 'Confluence'],
            demand: 'high',
            trending: true,
            description: 'Project planning and execution'
          },
          {
            id: 'product-management',
            name: 'Product Management',
            category: 'Business',
            subcategory: 'Management',
            keywords: ['product', 'management', 'product development', 'strategy', 'roadmap'],
            tools: ['Jira', 'Confluence', 'Figma', 'Mixpanel', 'Amplitude', 'Productboard'],
            demand: 'high',
            trending: true,
            description: 'Product strategy and development'
          }
        ]
      }
    ]
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: 'Palette',
    description: 'Design, content, and creative skills',
    subcategories: [
      {
        id: 'design',
        name: 'Design',
        skills: [
          {
            id: 'ui-ux-design',
            name: 'UI/UX Design',
            category: 'Creative',
            subcategory: 'Design',
            keywords: ['ui', 'ux', 'design', 'interface', 'user experience', 'prototype'],
            tools: ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'Photoshop', 'Illustrator'],
            demand: 'high',
            trending: true,
            description: 'User interface and user experience design'
          },
          {
            id: 'graphic-design',
            name: 'Graphic Design',
            category: 'Creative',
            subcategory: 'Design',
            keywords: ['graphic', 'design', 'visual', 'branding', 'logo', 'print'],
            tools: ['Adobe Photoshop', 'Illustrator', 'InDesign', 'Canva', 'Figma'],
            demand: 'high',
            trending: false,
            description: 'Visual design and branding'
          }
        ]
      },
      {
        id: 'content',
        name: 'Content Creation',
        skills: [
          {
            id: 'content-writing',
            name: 'Content Writing',
            category: 'Creative',
            subcategory: 'Content Creation',
            keywords: ['writing', 'content', 'copywriting', 'blog', 'article', 'seo'],
            tools: ['Grammarly', 'Hemingway', 'WordPress', 'Medium', 'Google Docs'],
            demand: 'high',
            trending: true,
            description: 'Writing engaging content for various platforms'
          },
          {
            id: 'video-editing',
            name: 'Video Editing',
            category: 'Creative',
            subcategory: 'Content Creation',
            keywords: ['video', 'editing', 'film', 'youtube', 'production', 'animation'],
            tools: ['Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'After Effects'],
            demand: 'high',
            trending: true,
            description: 'Video production and editing'
          }
        ]
      }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: 'Settings',
    description: 'Operations, support, and administrative skills',
    subcategories: [
      {
        id: 'supply-chain',
        name: 'Supply Chain',
        skills: [
          {
            id: 'supply-chain-management',
            name: 'Supply Chain Management',
            category: 'Operations',
            subcategory: 'Supply Chain',
            keywords: ['supply chain', 'logistics', 'inventory', 'procurement', 'operations'],
            tools: ['SAP', 'Oracle', 'Excel', 'ERP systems', 'Logistics software'],
            demand: 'medium',
            trending: false,
            description: 'Managing supply chain and logistics operations'
          }
        ]
      },
      {
        id: 'admin-support',
        name: 'Administration & Support',
        skills: [
          {
            id: 'virtual-assistant',
            name: 'Virtual Assistant',
            category: 'Operations',
            subcategory: 'Administration & Support',
            keywords: ['virtual assistant', 'admin', 'support', 'customer service', 'help desk'],
            tools: ['Microsoft Office', 'Google Workspace', 'Slack', 'Zoom', 'CRM software'],
            demand: 'medium',
            trending: true,
            description: 'Administrative and customer support services'
          }
        ]
      }
    ]
  }
];

// High-demand skills for default display
export const HIGH_DEMAND_SKILLS: Skill[] = [
  SKILL_TAXONOMY[0].subcategories[0].skills[0], // Web Development
  SKILL_TAXONOMY[0].subcategories[2].skills[1], // Data Science
  SKILL_TAXONOMY[2].subcategories[0].skills[0], // UI/UX Design
  SKILL_TAXONOMY[1].subcategories[0].skills[0], // Digital Marketing
  SKILL_TAXONOMY[1].subcategories[1].skills[0], // Financial Analysis
  SKILL_TAXONOMY[0].subcategories[2].skills[0], // Machine Learning
  SKILL_TAXONOMY[1].subcategories[2].skills[0], // Project Management
  SKILL_TAXONOMY[2].subcategories[1].skills[0], // Content Writing
];

// Skill search and matching utilities
export const searchSkills = (query: string, allSkills: Skill[]): Skill[] => {
  if (!query.trim()) return [];
  
  const lowercaseQuery = query.toLowerCase();
  const queryWords = lowercaseQuery.split(' ').filter(word => word.length > 0);
  
  return allSkills.filter(skill => {
    // Exact name match
    if (skill.name.toLowerCase().includes(lowercaseQuery)) {
      return true;
    }
    
    // Keyword matching
    const hasKeywordMatch = skill.keywords.some(keyword => 
      keyword.toLowerCase().includes(lowercaseQuery) || 
      lowercaseQuery.includes(keyword.toLowerCase())
    );
    
    if (hasKeywordMatch) return true;
    
    // Tool matching
    const hasToolMatch = skill.tools.some(tool => 
      tool.toLowerCase().includes(lowercaseQuery) || 
      lowercaseQuery.includes(tool.toLowerCase())
    );
    
    if (hasToolMatch) return true;
    
    // Partial word matching for multi-word queries
    if (queryWords.length > 1) {
      const matchesAllWords = queryWords.every(word => 
        skill.name.toLowerCase().includes(word) ||
        skill.keywords.some(keyword => keyword.toLowerCase().includes(word)) ||
        skill.tools.some(tool => tool.toLowerCase().includes(word))
      );
      if (matchesAllWords) return true;
    }
    
    return false;
  }).sort((a, b) => {
    // Prioritize exact matches and trending skills
    const aExact = a.name.toLowerCase() === lowercaseQuery;
    const bExact = b.name.toLowerCase() === lowercaseQuery;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    if (a.trending && !b.trending) return -1;
    if (!a.trending && b.trending) return 1;
    
    if (a.demand === 'high' && b.demand !== 'high') return -1;
    if (a.demand !== 'high' && b.demand === 'high') return 1;
    
    return a.name.localeCompare(b.name);
  });
};

// Get all skills as flat array
export const getAllSkills = (): Skill[] => {
  return SKILL_TAXONOMY.flatMap(category =>
    category.subcategories.flatMap(subcategory => subcategory.skills)
  );
};

// Get skills by category
export const getSkillsByCategory = (categoryId: string): Skill[] => {
  const category = SKILL_TAXONOMY.find(cat => cat.id === categoryId);
  if (!category) return [];
  
  return category.subcategories.flatMap(subcategory => subcategory.skills);
};

// Get related skills
export const getRelatedSkills = (skillId: string, limit: number = 5): Skill[] => {
  const allSkills = getAllSkills();
  const targetSkill = allSkills.find(skill => skill.id === skillId);
  
  if (!targetSkill) return [];
  
  return allSkills
    .filter(skill => {
      if (skill.id === skillId) return false;
      
      // Same category or subcategory
      if (skill.category === targetSkill.category || skill.subcategory === targetSkill.subcategory) {
        return true;
      }
      
      // Shared keywords or tools
      const sharedKeywords = skill.keywords.some(keyword => 
        targetSkill.keywords.includes(keyword)
      );
      const sharedTools = skill.tools.some(tool => 
        targetSkill.tools.includes(tool)
      );
      
      return sharedKeywords || sharedTools;
    })
    .sort((a, b) => {
      // Prioritize same subcategory
      if (a.subcategory === targetSkill.subcategory && b.subcategory !== targetSkill.subcategory) return -1;
      if (a.subcategory !== targetSkill.subcategory && b.subcategory === targetSkill.subcategory) return 1;
      
      // Then by demand and trending
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      
      return 0;
    })
    .slice(0, limit);
};
