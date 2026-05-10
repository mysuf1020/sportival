export type Role = 'super_admin' | 'admin' | 'sekretariat' | 'bendahara' | 'ketua_juri' | 'juri'

export type EventStatus = 'draft' | 'registration_open' | 'registration_closed' | 'ongoing' | 'finished'
export type Gender = 'male' | 'female' | 'mixed'
export type CompetitionType = 'single_elimination' | 'double_elimination' | 'round_robin'
export type RegistrationStatus = 'pending' | 'verified' | 'rejected' | 'disqualified'
export type MatchStatus = 'pending' | 'ongoing' | 'finished' | 'walkover' | 'bye'
export type BracketStatus = 'pending' | 'ongoing' | 'finished'

export interface AuthUser {
  id: number
  name: string
  username: string
  role: Role
  event_id: number | null
  event?: { id: number; name: string; slug: string } | null
}

export interface Event {
  id: number
  name: string
  slug: string
  sport_type: string
  description: string | null
  logo: string | null
  banner: string | null
  location: string
  city: string
  province: string
  registration_start: string
  registration_end: string
  event_start: string
  event_end: string
  status: EventStatus
  settings: Record<string, unknown> | null
  created_at: string
}

export type ScoringType = 'points' | 'time_asc' | 'rounds_won'

export interface Category {
  id: number
  event_id: number
  name: string
  slug: string
  gender: Gender
  age_min: number | null
  age_max: number | null
  weight_min: number | null
  weight_max: number | null
  competition_type: CompetitionType
  scoring_type: ScoringType
  sport_discipline: string | null
  max_participants: number | null
  is_active: boolean
  registrations_count?: number
}

export interface EventStats {
  total_registrations: number
  by_status: { pending: number; verified: number; rejected: number; disqualified: number }
  by_category: Array<{ id: number; name: string; gender: Gender; total: number; verified: number; pending: number }>
  by_gender: { male: number; female: number; mixed: number }
  total_matches: number
  match_progress: { pending: number; ongoing: number; finished: number }
}

export interface Contingent {
  id: number
  event_id: number
  name: string
  region: string | null
  province: string | null
  contact_person: string
  phone: string
  email: string | null
  logo: string | null
  status: 'active' | 'disqualified'
}

export interface Athlete {
  id: number
  contingent_id: number
  name: string
  gender: 'male' | 'female'
  birth_date: string | null
  weight: number | null
  height: number | null
  photo: string | null
  status: 'active' | 'disqualified'
  contingent?: Contingent
}

export interface Registration {
  id: number
  athlete_id: number
  category_id: number
  registration_number: string
  status: RegistrationStatus
  verified_at: string | null
  notes: string | null
  seeding: number | null
  athlete?: Athlete
  category?: Category
}

export interface Match {
  id: number
  bracket_id: number
  category_id: number
  round: number
  match_number: number
  registration1_id: number | null
  registration2_id: number | null
  winner_registration_id: number | null
  court: string | null
  scheduled_at: string | null
  status: MatchStatus
  athlete1?: Registration
  athlete2?: Registration
  winner?: Registration
  category?: Pick<Category, 'id' | 'name' | 'event_id'>
}

export interface Bracket {
  id: number
  category_id: number
  format: CompetitionType
  status: BracketStatus
  bracket_data: unknown
  matches?: Match[]
}

export interface MatchScore {
  id: number
  match_id: number
  judge_id: number
  registration_id: number
  round_number: number
  score: number
  penalties: number
  score_data: Record<string, unknown> | null
}

export interface MedalStanding {
  id: number
  event_id: number
  contingent_id: number
  gold: number
  silver: number
  bronze: number
  total_medals: number
  rank: number | null
  contingent?: Contingent
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}
