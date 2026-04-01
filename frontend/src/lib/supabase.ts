import { createClient } from '@supabase/supabase-js'

// Environment variables - Vite only (no process.env mixing)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

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

export type MentorProfile = {
  id: string
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
  rating_sum: number
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

// Composite type for relational queries
export type MentorWithProfile = MentorProfile & {
  profiles: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url' | 'role' | 'bio'>
}

// Pagination type
export type PaginatedResult<T> = {
  data: T[]
  count: number | null
  hasMore: boolean
  nextPage: number | null
}

// Error handler (production-safe)
export const handleError = (error: any): never => {
  console.error('Supabase Error:', error)
  
  // Sanitize error for UI (never expose raw DB errors)
  const message = error?.message || 'An unexpected error occurred'
  
  // Map common errors to user-friendly messages
  if (message.includes('duplicate key')) {
    throw new Error('This record already exists')
  }
  if (message.includes('foreign key constraint')) {
    throw new Error('Related record not found')
  }
  if (message.includes('permission denied')) {
    throw new Error('You do not have permission to perform this action')
  }
  if (message.includes('timeout')) {
    throw new Error('Request timed out. Please try again.')
  }
  
  throw new Error(message)
}

// Auth guard - get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Unauthorized. Please sign in.')
  }
  return user
}

// Helper functions with auth guard, explicit columns, and pagination

export const fetchCurrentProfile = async (): Promise<Profile> => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, phone, bio, location, timezone, is_verified, is_active, onboarding_completed, created_at, updated_at')
    .eq('id', user.id)
    .single()
  
  if (error) handleError(error)
  if (!data) throw new Error('Profile not found')
  
  return data as Profile
}

export const updateCurrentProfile = async (updates: Partial<Profile>): Promise<Profile> => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, full_name, avatar_url, role, phone, bio, location, timezone, is_verified, is_active, onboarding_completed, created_at, updated_at')
    .single()
  
  if (error) handleError(error)
  if (!data) throw new Error('Failed to update profile')
  
  return data as Profile
}

export const fetchMentors = async (
  filters?: { category?: string; minRating?: number },
  page: number = 0,
  pageSize: number = 20
): Promise<PaginatedResult<MentorWithProfile>> => {
  const from = page * pageSize
  const to = from + pageSize - 1
  
  let query = supabase
    .from('mentor_profiles')
    .select(
      'id, headline, expertise, skills, hourly_rate, currency, experience_years, languages, verification_status, total_sessions, total_earnings, rating_average, rating_count, rating_sum, is_featured, created_at, updated_at, profiles!inner(id, email, full_name, avatar_url, role, bio)',
      { count: 'exact' }
    )
    .eq('verification_status', 'VERIFIED')
    .eq('profiles.is_active', true)
  
  if (filters?.minRating) {
    query = query.gte('rating_average', filters.minRating)
  }
  
  const { data, error, count } = await query
    .order('rating_average', { ascending: false })
    .range(from, to)
  
  if (error) handleError(error)
  
  return {
    data: (data || []) as MentorWithProfile[],
    count,
    hasMore: count ? from + pageSize < count : false,
    nextPage: count && from + pageSize < count ? page + 1 : null,
  }
}

export const createSession = async (sessionData: Omit<Session, 'id' | 'created_at'>): Promise<Session> => {
  const user = await getCurrentUser()
  
  // Security: ensure user is creating session for themselves
  if (sessionData.learner_id !== user.id) {
    throw new Error('Unauthorized: Can only create sessions for yourself')
  }
  
  const { data, error } = await supabase
    .from('sessions')
    .insert([sessionData])
    .select('id, learner_id, mentor_id, title, status, scheduled_at, duration_minutes, rate_per_hour, total_amount, meeting_link, created_at')
    .single()
  
  if (error) handleError(error)
  if (!data) throw new Error('Failed to create session')
  
  return data as Session
}

export const sendMessage = async (
  conversationId: string,
  content: string,
  contentType: Message['content_type'] = 'TEXT'
): Promise<Message> => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      content_type: contentType,
      is_read: false,
    }])
    .select('id, conversation_id, sender_id, content, content_type, is_read, created_at')
    .single()
  
  if (error) handleError(error)
  if (!data) throw new Error('Failed to send message')
  
  return data as Message
}

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id) // Security: ensure user owns this notification
    .select('id, user_id, type, title, message, is_read, priority, created_at')
    .single()
  
  if (error) handleError(error)
  if (!data) throw new Error('Notification not found or unauthorized')
  
  return data as Notification
}

// Specific realtime subscriptions (not generic '*')
export const subscribeToNewMessages = (
  conversationId: string,
  callback: (message: Message) => void
) => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export const subscribeToMyNotifications = (
  callback: (notification: Notification) => void
) => {
  return subscribeToUserScoped('notifications', callback, 'INSERT')
}

export const subscribeToMySessionUpdates = (
  callback: (session: Session) => void
) => {
  return subscribeToUserScoped('sessions', callback, 'UPDATE')
}

// Generic user-scoped subscription helper
const subscribeToUserScoped = <T>(
  table: string,
  callback: (item: T) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' = 'INSERT'
) => {
  let channel: any = null
  let userId: string | null = null
  
  const init = async () => {
    try {
      const user = await getCurrentUser()
      userId = user.id
      
      channel = supabase
        .channel(`${table}:${userId}`)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table: table,
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callback(payload.new as T)
          }
        )
        .subscribe()
    } catch {
      // User not logged in
    }
  }
  
  init()
  
  return () => {
    if (channel) supabase.removeChannel(channel)
  }
}

