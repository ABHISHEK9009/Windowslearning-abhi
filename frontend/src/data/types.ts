export interface Mentor {
  id: string;
  userId: string;
  user?: {
    name: string;
    avatar?: string;
  };
  skills?: Array<{
    skill: {
      name: string;
    id: string;
    };
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    learner: {
      user: {
        name: string;
      };
    };
    createdAt: string;
  }>;
  title?: string;
  bio?: string;
  location?: string;
  languages?: string[];
  hourlyRate?: number;
  isVerified?: boolean;
  // Legacy properties for backward compatibility
  name?: string;
  expertise?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
  mentorCount: number;
}

export interface Session {
  id: string;
  mentorId: string;
  learnerId: string;
  date: string;
  duration: number; // hours
  status: 'upcoming' | 'completed' | 'cancelled';
  totalPrice: number;
}

export interface Review {
  id: string;
  mentorId: string;
  learnerName: string;
  learnerAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'learner' | 'mentor';
  walletBalance: number;
}
