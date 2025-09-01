import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  email: string
  role: 'student' | 'instructor'
  full_name: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  user_id: string
  student_number: string
  enrollment_date: string
  status: 'active' | 'inactive'
  overall_progress: number
  streak_days: number
  last_activity: string
  created_at: string
  updated_at: string
}

export interface LearningRecord {
  id: string
  student_id: string
  topic: string
  status: 'not-started' | 'in-progress' | 'completed'
  learning_date: string
  demo_date?: string
  demo_status?: 'pending' | 'completed' | 'yes-to-do'
  quiz_score?: number
  xmp_topic?: string
  xmp_assignment?: string
  xmp_status?: 'pending' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'late'
  notes?: string
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  student_id: string
  insight_type: 'performance' | 'recommendation' | 'trend'
  content: string
  generated_at: string
  created_at: string
}