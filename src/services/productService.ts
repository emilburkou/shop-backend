import type { IProductRepository } from '../repositories/IProductRepository';
import type { Product, ProductFilters, PaginatedResult, CreateProductDto } from '../types/product';

export class ProductService {
  constructor(private readonly repo: IProductRepository) {}

  async getProducts(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    const sanitized: ProductFilters = {
      ...filters,
      page: Math.max(1, Number(filters.page) || 1),
      limit: Math.min(96, Math.max(1, Number(filters.limit) || 24)),
      minPrice: filters.minPrice !== undefined ? Math.max(0, Number(filters.minPrice)) : undefined,
      maxPrice: filters.maxPrice !== undefined ? Math.max(0, Number(filters.maxPrice)) : undefined,
      minRating: filters.minRating !== undefined ? Math.min(5, Math.max(0, Number(filters.minRating))) : undefined,
    };
    return this.repo.findAll(sanitized);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.repo.findById(id);
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    return this.repo.create(dto);
  }

  async getCategories(): Promise<{ category: string; subcategories: string[] }[]> {
    return this.repo.getCategories();
  }

  async getBrands(): Promise<string[]> {
    return this.repo.getBrands();
  }
}
