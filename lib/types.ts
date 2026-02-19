export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  image_url: string | null
  category_id: string | null
  is_promotion: boolean
  promotion_text: string | null
  promotion_start: string | null
  promotion_end: string | null
  seasonal_promotion_id?: string | null
  price: number | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  categories?: Category
  seasonal_promotions?: SeasonalPromotion
}

export interface SeasonalPromotion {
  id: string
  name: string
  slug: string
  description: string | null
  banner_image_url: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  id: string
  key: string
  value: string | null
  updated_at: string
}

export type UserRole = 'superadmin' | 'admin' | 'editor'
