import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Mentors
export const useMentors = (filters: any = {}) => {
  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: async () => {
      const response = await api.get('/mentors', { params: filters });
      return response.data.data;
    },
  });
};

export const useMentor = (id: string) => {
  return useQuery({
    queryKey: ['mentor', id],
    queryFn: async () => {
      const response = await api.get(`/mentors/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useMentorByUserId = (userId: string) => {
  return useQuery({
    queryKey: ['mentor-by-user-id', userId],
    queryFn: async () => {
      const response = await api.get('/mentors');
      const mentors = response.data.data;
      return mentors.find((mentor: any) => mentor.userId === userId);
    },
    enabled: !!userId,
  });
};

// Sessions
export const useLearnerSessions = () => {
  return useQuery({
    queryKey: ['sessions', 'learner'],
    queryFn: async () => {
      const response = await api.get('/sessions/learner');
      return response.data.data;
    },
  });
};

export const useMentorSessions = () => {
  return useQuery({
    queryKey: ['sessions', 'mentor'],
    queryFn: async () => {
      const response = await api.get('/sessions/mentor');
      return response.data.data;
    },
  });
};

export const useBookSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/sessions', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

// Wallet
export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await api.get('/wallet');
      return response.data.data;
    },
  });
};

export const useDeposit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const response = await api.post('/wallet/deposit', { amount });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

// Requirements
export const useRequirements = () => {
  return useQuery({
    queryKey: ['requirements'],
    queryFn: async () => {
      const response = await api.get('/requirements');
      return response.data.data;
    },
  });
};

export const useRequirement = (id: string) => {
  return useQuery({
    queryKey: ['requirement', id],
    queryFn: async () => {
      const response = await api.get(`/requirements/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const usePostRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/requirements', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
};

// Proposals
export const useMentorProposals = () => {
  return useQuery({
    queryKey: ['proposals', 'mentor'],
    queryFn: async () => {
      const response = await api.get('/proposals/mentor');
      return response.data.data;
    },
  });
};

// Analytics
export const useLearnerAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'learner'],
    queryFn: async () => {
      const response = await api.get('/analytics/learner');
      return response.data.data;
    },
  });
};

export const useMentorAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'mentor'],
    queryFn: async () => {
      const response = await api.get('/analytics/mentor');
      return response.data.data;
    },
  });
};

// User Profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch('/users/profile', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Also update local storage user if needed
    },
  });
};

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data.data;
    },
  });
};

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      // Get all skills from mentors and deduplicate
      const mentorsResponse = await api.get('/mentors');
      const mentors = mentorsResponse.data.data;
      const allSkills = new Set<string>();
      
      mentors.forEach((mentor: any) => {
        if (mentor.skills && Array.isArray(mentor.skills)) {
          mentor.skills.forEach((skillItem: any) => {
            if (skillItem.skill && skillItem.skill.name) {
              allSkills.add(skillItem.skill.name);
            }
          });
        }
      });
      
      // Return skills as array of objects
      return Array.from(allSkills).map(skill => ({
        id: skill.toLowerCase().replace(/\s+/g, '-'),
        name: skill,
        category: 'general' // Default category, can be enhanced later
      }));
    },
  });
};

export const useSkillsByCategory = () => {
  return useQuery({
    queryKey: ['skills-by-category'],
    queryFn: async () => {
      const mentorsResponse = await api.get('/mentors');
      const mentors = mentorsResponse.data.data;
      const skillsByCategory: Record<string, string[]> = {};
      
      // Define some common skill categories
      const categories = {
        'Programming': ['javascript', 'python', 'react', 'node.js', 'typescript', 'java', 'cpp', 'html', 'css', 'vue', 'angular', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
        'Design': ['ui design', 'ux design', 'graphic design', 'web design', 'mobile design', 'figma', 'sketch', 'adobe photoshop', 'illustrator', 'xd'],
        'Business': ['marketing', 'sales', 'business strategy', 'entrepreneurship', 'finance', 'accounting', 'project management', 'leadership'],
        'Data Science': ['data analysis', 'machine learning', 'data science', 'statistics', 'sql', 'tableau', 'power bi', 'python', 'r'],
        'Marketing': ['digital marketing', 'seo', 'sem', 'content marketing', 'social media marketing', 'email marketing', 'branding'],
        'Writing': ['content writing', 'copywriting', 'technical writing', 'creative writing', 'blogging', 'editing'],
        'Languages': ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'hindi', 'arabic'],
        'Other': []
      };
      
      // Initialize categories
      Object.keys(categories).forEach(cat => {
        skillsByCategory[cat] = [];
      });
      
      // Categorize skills from mentors
      mentors.forEach((mentor: any) => {
        if (mentor.skills && Array.isArray(mentor.skills)) {
          mentor.skills.forEach((skillItem: any) => {
            if (skillItem.skill && skillItem.skill.name) {
              const skillName = skillItem.skill.name.toLowerCase();
              let categorized = false;
              
              // Try to categorize the skill
              for (const [category, keywords] of Object.entries(categories)) {
                if (category === 'Other') continue;
                
                if (keywords.some(keyword => skillName.includes(keyword))) {
                  if (!skillsByCategory[category].includes(skillItem.skill.name)) {
                    skillsByCategory[category].push(skillItem.skill.name);
                  }
                  categorized = true;
                  break;
                }
              }
              
              // If not categorized, add to Other
              if (!categorized && !skillsByCategory['Other'].includes(skillItem.skill.name)) {
                skillsByCategory['Other'].push(skillItem.skill.name);
              }
            }
          });
        }
      });
      
      return skillsByCategory;
    },
  });
};

// Messages
export const useMessages = (userId: string) => {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      const response = await api.get(`/chat/${userId}`);
      return response.data.data;
    },
    enabled: !!userId,
  });
};

export const useChatConversations = () => {
  return useQuery({
    queryKey: ['chat_conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversations');
      return response.data.data;
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/chat', data);
      return response.data.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['chat_conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', data.receiverId] });
    },
  });
};

