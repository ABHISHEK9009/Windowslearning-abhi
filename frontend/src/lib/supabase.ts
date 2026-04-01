import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'LEARNER' | 'MENTOR' | 'ADMIN'
  phone: string | null
  bio: string | null
  location: string | null
  timezone: string
  is_verified: boolean
  is_active: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type MentorProfile = Profile & {
  headline: string | null
  expertise: string[]
  skills: string[]
  hourly_rate: number | null
  currency: string
  experience_years: number | null
  languages: string[]
  verification_status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'
  total_sessions: number
  total_earnings: number
  rating_average: number
  rating_count: number
}

export type Session = {
  id: string
  learner_id: string
  mentor_id: string
  title: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduled_at: string
  duration_minutes: number
  rate_per_hour: number
  total_amount: number
  meeting_link: string | null
  created_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  content_type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO'
  is_read: boolean
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  created_at: string
}

// Realtime subscriptions helper
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Helper functions for common operations
export const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as Profile
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}

export const fetchMentors = async (filters?: { category?: string; minRating?: number }) => {
  let query = supabase
    .from('mentor_profiles')
    .select('*, profiles(*)')
    .eq('verification_status', 'VERIFIED')
  
  if (filters?.minRating) {
    query = query.gte('rating_average', filters.minRating)
  }
  
  const { data, error } = await query.order('rating_average', { ascending: false })
  
  if (error) throw error
  return data
}

export const createSession = async (sessionData: Omit<Session, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([sessionData])
    .select()
    .single()
  
  if (error) throw error
  return data as Session
}

export const sendMessage = async (messageData: Omit<Message, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select()
    .single()
  
  if (error) throw error
  return data as Message
}

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .select()
    .single()
  
  if (error) throw error
  return data as Notification
}

