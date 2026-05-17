import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import type { IProductRepository } from './IProductRepository';
import type { Product, ProductFilters, PaginatedResult, CreateProductDto } from '../types/product';

interface DbRow {
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
  inStock: number;
  stockCount: number;
  imageUrl: string;
  attributes: string;
  tags: string;
  createdAt: string;
}

function toProduct(row: DbRow): Product {
  return {
    ...row,
    inStock: row.inStock === 1,
    attributes: JSON.parse(row.attributes) as Record<string, string>,
    tags: JSON.parse(row.tags) as string[],
  };
}

export class SqliteProductRepository implements IProductRepository {
  async findAll(filters: ProductFilters): Promise<PaginatedResult<Product>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 24;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.q) {
      conditions.push(`(title LIKE @q OR description LIKE @q OR sku LIKE @q OR brand LIKE @q)`);
      params.q = `%${filters.q}%`;
    }
    if (filters.brand) {
      conditions.push(`brand = @brand`);
      params.brand = filters.brand;
    }
    if (filters.category) {
      conditions.push(`category = @category`);
      params.category = filters.category;
    }
    if (filters.subcategory) {
      conditions.push(`subcategory = @subcategory`);
      params.subcategory = filters.subcategory;
    }
    if (filters.minPrice !== undefined) {
      conditions.push(`price >= @minPrice`);
      params.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(`price <= @maxPrice`);
      params.maxPrice = filters.maxPrice;
    }
    if (filters.minRating !== undefined) {
      conditions.push(`rating >= @minRating`);
      params.minRating = filters.minRating;
    }
    if (filters.inStock !== undefined) {
      conditions.push(`inStock = @inStock`);
      params.inStock = filters.inStock ? 1 : 0;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderMap: Record<string, string> = {
      price_asc: 'price ASC',
      price_desc: 'price DESC',
      rating: 'rating DESC',
      newest: 'createdAt DESC',
      popularity: 'reviewCount DESC',
    };
    const orderBy = `ORDER BY ${orderMap[filters.sortBy ?? 'newest'] ?? 'createdAt DESC'}`;

    const countRow = db
      .prepare(`SELECT COUNT(*) as total FROM products ${where}`)
      .get(params) as { total: number };

    const rows = db
      .prepare(`SELECT * FROM products ${where} ${orderBy} LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset }) as DbRow[];

    return {
      data: rows.map(toProduct),
      total: countRow.total,
      page,
      limit,
      totalPages: Math.ceil(countRow.total / limit),
    };
  }

  async findById(id: string): Promise<Product | null> {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as DbRow | undefined;
    return row ? toProduct(row) : null;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = {
      id: uuidv4(),
      title: dto.title,
      description: dto.description,
      sku: dto.sku,
      brand: dto.brand,
      category: dto.category,
      subcategory: dto.subcategory,
      price: dto.price,
      originalPrice: dto.originalPrice ?? null,
      rating: dto.rating ?? 0,
      reviewCount: dto.reviewCount ?? 0,
      inStock: dto.inStock ?? true,
      stockCount: dto.stockCount ?? 0,
      imageUrl: dto.imageUrl ?? '',
      attributes: JSON.stringify(dto.attributes ?? {}),
      tags: JSON.stringify(dto.tags ?? []),
      createdAt: new Date().toISOString(),
    };

    db.prepare(`
      INSERT INTO products (
        id, title, description, sku, brand, category, subcategory,
        price, originalPrice, rating, reviewCount, inStock, stockCount,
        imageUrl, attributes, tags, createdAt
      ) VALUES (
        @id, @title, @description, @sku, @brand, @category, @subcategory,
        @price, @originalPrice, @rating, @reviewCount, @inStock, @stockCount,
        @imageUrl, @attributes, @tags, @createdAt
      )
    `).run({ ...product, inStock: product.inStock ? 1 : 0 });

    return this.findById(product.id) as Promise<Product>;
  }

  async getCategories(): Promise<{ category: string; subcategories: string[] }[]> {
    const rows = db
      .prepare('SELECT DISTINCT category, subcategory FROM products ORDER BY category, subcategory')
      .all() as { category: string; subcategory: string }[];

    const map = new Map<string, string[]>();
    for (const row of rows) {
      if (!map.has(row.category)) map.set(row.category, []);
      map.get(row.category)!.push(row.subcategory);
    }

    return Array.from(map.entries()).map(([category, subcategories]) => ({
      category,
      subcategories,
    }));
  }

  async getBrands(): Promise<string[]> {
    const rows = db.prepare('SELECT DISTINCT brand FROM products ORDER BY brand').all() as {
      brand: string;
    }[];
    return rows.map((r) => r.brand);
  }
}
