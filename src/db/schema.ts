import db from './database';

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      description  TEXT NOT NULL,
      sku          TEXT NOT NULL UNIQUE,
      brand        TEXT NOT NULL,
      category     TEXT NOT NULL,
      subcategory  TEXT NOT NULL,
      price        REAL NOT NULL,
      originalPrice REAL,
      rating       REAL NOT NULL DEFAULT 0,
      reviewCount  INTEGER NOT NULL DEFAULT 0,
      inStock      INTEGER NOT NULL DEFAULT 1,
      stockCount   INTEGER NOT NULL DEFAULT 0,
      imageUrl     TEXT NOT NULL DEFAULT '',
      attributes   TEXT NOT NULL DEFAULT '{}',
      tags         TEXT NOT NULL DEFAULT '[]',
      createdAt    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_brand    ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_price    ON products(price);
    CREATE INDEX IF NOT EXISTS idx_products_rating   ON products(rating);
    CREATE INDEX IF NOT EXISTS idx_products_inStock  ON products(inStock);
  `);
}
