export interface Product {
  id: string;
  title: string;
  description: string;
  sku: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
  attributes: Record<string, string>;
  tags: string[];
  createdAt: string;
}

export interface ProductFilters {
  q?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductDto {
  title: string;
  description: string;
  sku: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  stockCount?: number;
  imageUrl?: string;
  attributes?: Record<string, string>;
  tags?: string[];
}
