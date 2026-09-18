export type Difficulty = 'mudah' | 'menengah' | 'sulit'
export type TripType = 'public' | 'private'
export type TripStatus = 'open' | 'full' | 'closed' | 'cancelled'
export type ParticipantStatus = 'pending' | 'approved' | 'rejected' | 'waitlist'
export type UserRole = 'admin' | 'participant'
export type TripRequestStatus = 'pending' | 'approved' | 'rejected'

export interface Curug {
  id: string
  name: string
  alt_name: string | null
  slug: string
  short_description: string | null
  long_description: string | null
  village: string | null
  district: string | null
  latitude: number | null
  longitude: number | null
  google_maps_url: string | null
  difficulty: Difficulty | null
  trek_duration_minutes: number | null
  distance_from_city_km: number | null
  ticket_price: number
  parking_price: number
  best_time_to_visit: string | null
  facilities: string[]
  access_notes: string | null
  tags: string[]
  cover_image_url: string | null
  gallery: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  title: string
  slug: string
  description: string | null
  itinerary: string | null
  trip_type: TripType
  trip_date: string
  meeting_point: string | null
  meeting_time: string | null
  price_per_person: number
  max_participants: number
  status: TripStatus
  terms_and_conditions: string | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

// Trip + relasi trip_curugs + kuota terhitung, dipakai getTrips() / getTripBySlug()
export interface TripWithCurugs extends Trip {
  curugs: Pick<Curug, 'id' | 'name' | 'slug'>[]
  approved_count: number
  remaining_slots: number
}

export interface Participant {
  id: string
  trip_id: string
  user_id: string | null
  contact_name: string
  contact_phone: string
  contact_email: string | null
  total_people: number
  member_names: string[]
  is_guest: boolean
  status: ParticipantStatus
  private_trip_access_confirmed: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

// Artikel/blog CMS (Fase 4 — halaman publik; form create/edit CMS menyusul di Fase 5)
export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_html: string | null
  cover_image_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedArticles {
  articles: Article[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// Bentuk return standar semua Server Action, sesuai instruksi prompt 3.1.
export interface ActionResult<T = undefined> {
  success: boolean
  error?: string
  data?: T
}


export interface TripRequest {
  id: string
  user_id: string | null
  contact_name: string
  contact_phone: string
  contact_email: string | null
  trip_date: string
  total_people: number
  member_names: string[]
  notes: string | null
  status: TripRequestStatus
  admin_notes: string | null
  approved_trip_id: string | null
  created_at: string
  updated_at: string
}

export interface TripRequestWithCurugs extends TripRequest {
  curugs: Pick<Curug, 'id' | 'name' | 'slug'>[]
}
