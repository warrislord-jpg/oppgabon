// src/types/index.ts
// Types TypeScript partagés — frontend OppGabon

export type ListingType = 'EMPLOI' | 'STAGE' | 'LOGEMENT'
export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'DELETED'
export type ApplicationStatus = 'PENDING' | 'VIEWED' | 'ACCEPTED' | 'REFUSED'
export type UserRole = 'CANDIDAT' | 'EMPLOYEUR' | 'ADMIN'
export type UserPlan = 'FREE' | 'PRO'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  plan: UserPlan
  avatarUrl?: string
  city?: string
  bio?: string
  isVerified: boolean
  createdAt: string
}

export interface Listing {
  id: string
  userId: string
  user: Pick<User, 'id' | 'fullName' | 'avatarUrl' | 'isVerified'>
  type: ListingType
  title: string
  description: string
  city: string
  quartier?: string
  price?: number
  status: ListingStatus
  tags: string[]
  images: string[]
  viewCount: number
  boostedUntil?: string
  createdAt: string
  updatedAt: string
  // Emploi / Stage
  contractType?: string
  sector?: string
  experience?: string
  education?: string
  salaryMin?: number
  salaryMax?: number
  deadline?: string
  // Logement
  roomType?: string
  surface?: number
  furnished?: boolean
  amenities?: string[]
  availableFrom?: string
  _count?: { applications: number }
}

export interface Application {
  id: string
  listingId: string
  listing?: Listing
  applicantId: string
  applicant?: Pick<User, 'id' | 'fullName' | 'avatarUrl' | 'city'>
  coverLetter?: string
  cvUrl?: string
  status: ApplicationStatus
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  sender: Pick<User, 'id' | 'fullName' | 'avatarUrl'>
  content: string
  attachmentUrl?: string
  readAt?: string
  createdAt: string
}

export interface Conversation {
  id: string
  listingId: string
  listing: Pick<Listing, 'id' | 'title' | 'type'>
  userAId: string
  userA: Pick<User, 'id' | 'fullName' | 'avatarUrl'>
  userBId: string
  userB: Pick<User, 'id' | 'fullName' | 'avatarUrl'>
  messages: Message[]
  createdAt: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ListingsResponse {
  listings: Listing[]
  pagination: Pagination
}

// Utilitaires
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  EMPLOI: 'Emploi',
  STAGE: 'Stage',
  LOGEMENT: 'Logement',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'En attente',
  VIEWED: 'Profil consulté',
  ACCEPTED: 'Entretien planifié',
  REFUSED: 'Non retenu',
}

export const formatPrice = (price?: number): string => {
  if (!price) return 'À négocier'
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
}

export const formatDate = (date: string): string => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 1) return "À l'instant"
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}
