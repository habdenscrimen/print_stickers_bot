export interface Question {
  id: string
  user_id: number

  question: string
  answer?: string

  // timestamps
  created_at: string
  answered_at: string | null
}
