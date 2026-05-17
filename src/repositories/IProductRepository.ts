import type { Product, ProductFilters, PaginatedResult, CreateProductDto } from '../types/product';

export interface IProductRepository {
  findAll(filters: ProductFilters): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<Product | null>;
  create(dto: CreateProductDto): Promise<Product>;
  getCategories(): Promise<{ category: string; subcategories: string[] }[]>;
  getBrands(): Promise<string[]>;
}
