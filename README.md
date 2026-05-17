# Shop Backend

REST API for the E-Commerce Product Catalog.
Built with **Node.js 22**, **TypeScript 5**, **Express 5**, and **SQLite** (via `better-sqlite3`).

---

## Prerequisites

- [Node.js 22 LTS](https://nodejs.org/) or later (`node --version` to check)
- No Docker, no database server — SQLite is a single file

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config (optional — defaults work out of the box)
cp .env.example .env

# 3. Start the dev server (database and seed data are created automatically)
npm run dev
```

Open **http://localhost:3000** — you'll see the interactive API docs page.

The database file is created at `data/products.db` on first run and seeded with **60 products**
across Electronics, Clothing, Footwear, Home & Garden, and Sports.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload (uses `tsx watch`) |
| `npm run build` | Compile TypeScript → JavaScript into `dist/` |
| `npm start` | Run the compiled production build |
| `npm run seed` | Re-seed the database (skips if products already exist) |

---

## API Reference

Full interactive documentation: **http://localhost:3000**

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/products` | Paginated product list with filters |
| `GET` | `/api/products/search?q=sneakers` | Text search across name, description, SKU, brand |
| `GET` | `/api/products/:id` | Single product by ID |
| `POST` | `/api/products` | Create a product (for seeding / admin use) |
| `GET` | `/api/categories` | All categories with subcategories |
| `GET` | `/api/categories/brands` | All brand names |

### Query Parameters for `GET /api/products`

| Parameter | Type | Example | Description |
|---|---|---|---|
| `q` | string | `sneakers` | Search in title, description, SKU, brand |
| `brand` | string | `Apple` | Exact brand match |
| `category` | string | `Electronics` | Filter by category |
| `subcategory` | string | `Smartphones` | Filter by subcategory |
| `minPrice` | number | `100` | Minimum price |
| `maxPrice` | number | `500` | Maximum price |
| `minRating` | number | `4` | Minimum rating (0–5) |
| `inStock` | boolean | `true` | Only in-stock products |
| `sortBy` | string | `price_asc` | One of: `price_asc`, `price_desc`, `rating`, `newest`, `popularity` |
| `page` | number | `1` | Page number (default: 1) |
| `limit` | number | `24` | Items per page: 24, 48, or 96 (default: 24) |

### Example Requests

```bash
# Get Electronics sorted by rating, page 1
curl "http://localhost:3000/api/products?category=Electronics&sortBy=rating"

# Apple products in stock, cheapest first
curl "http://localhost:3000/api/products?brand=Apple&inStock=true&sortBy=price_asc"

# Search for sneakers
curl "http://localhost:3000/api/products/search?q=sneakers"

# Price range $50–$200
curl "http://localhost:3000/api/products?minPrice=50&maxPrice=200&page=1&limit=48"

# All categories
curl "http://localhost:3000/api/categories"
```

---

## Project Structure

```
shop-backend/
├── src/
│   ├── index.ts                         Entry point: wires everything together
│   │
│   ├── types/
│   │   └── product.ts                   TypeScript interfaces (Product, ProductFilters, etc.)
│   │
│   ├── db/
│   │   ├── database.ts                  SQLite connection singleton
│   │   ├── schema.ts                    CREATE TABLE + indexes (runs on startup)
│   │   └── seed.ts                      60 sample products (skips if DB already populated)
│   │
│   ├── repositories/
│   │   ├── IProductRepository.ts        Interface — the contract for any DB implementation
│   │   └── SqliteProductRepository.ts   Concrete implementation using SQLite
│   │
│   ├── services/
│   │   └── productService.ts            Business logic: input sanitization, orchestration
│   │
│   └── routes/
│       ├── products.ts                  /api/products route handlers
│       └── categories.ts               /api/categories route handlers
│
├── data/                                SQLite database file lives here (gitignored)
├── .env.example                         Environment variable template
├── package.json
└── tsconfig.json
```

---

## Architecture

This project uses the **Repository Pattern** — the same design pattern described by Martin Fowler,
and the one your EPAM mentors recommended.

```
HTTP Request
    │
    ▼
Express Router (routes/products.ts)
    │  Parses query params, calls service
    ▼
ProductService (services/productService.ts)
    │  Business logic: validates input, clamps values, orchestrates
    ▼
IProductRepository (repositories/IProductRepository.ts)
    │  Interface — business logic never depends on a concrete DB
    ▼
SqliteProductRepository (repositories/SqliteProductRepository.ts)
    │  Only this class knows about SQL and SQLite
    ▼
SQLite Database (data/products.db)
```

**Why this matters:** If you want to switch to PostgreSQL later, you:
1. Create `PostgresProductRepository implements IProductRepository`
2. Change **one line** in `src/index.ts`: `new SqliteProductRepository()` → `new PostgresProductRepository()`
3. Delete nothing else

---

## How to Extend

### Add a new filter (e.g. filter by tag)

1. Add `tags?: string` to `ProductFilters` in `src/types/product.ts`
2. Add the SQL condition in `SqliteProductRepository.findAll()`:
   ```typescript
   if (filters.tags) {
     conditions.push(`tags LIKE @tags`);
     params.tags = `%"${filters.tags}"%`;
   }
   ```
3. Parse the query param in `src/routes/products.ts`:
   ```typescript
   tags: req.query.tags as string | undefined,
   ```

### Add a new endpoint (e.g. GET /api/products/:id/related)

1. Add `findRelated(id: string): Promise<Product[]>` to `IProductRepository`
2. Implement it in `SqliteProductRepository`
3. Add `getRelated(id: string)` to `ProductService`
4. Add the route in `src/routes/products.ts`

### Switch to PostgreSQL

1. `npm install pg` and `npm install -D @types/pg`
2. Create `src/repositories/PostgresProductRepository.ts` implementing `IProductRepository`
3. In `src/index.ts`, swap one line: `new PostgresProductRepository()`

---

## Evolution Path

| Stage | What to add | How |
|---|---|---|
| Current | SQLite + filter/sort in SQL | ✅ Done |
| Stage 2 | PostgreSQL | Implement `PostgresProductRepository` |
| Stage 3 | Redis caching | Wrap any repository with `CachedProductRepository` decorator |
| Stage 4 | Full-text search | `pg_trgm` extension in Postgres, or Elasticsearch |
| Stage 5 | Deployment | AWS Lambda (Serverless Framework) or a Node.js host like Railway/Render |

---

## Troubleshooting

**`Cannot find module 'better-sqlite3'`** — Run `npm install` first.

**`SQLITE_CANTOPEN`** — The `data/` directory doesn't exist. Run `npm run dev` (it creates it automatically via `database.ts`).

**Port 3000 already in use** — Either stop the other process, or set `PORT=3001` in your `.env` file.

**Seed skips** — If you want to re-seed from scratch, delete `data/products.db` and run `npm run dev` again.

---

## Learning Notes

If you're new to Node.js/TypeScript and coming from Java/AEM, here's how concepts map:

| AEM / Java | This project |
|---|---|
| `@Component` OSGi service | A TypeScript `class` exported from a module |
| OSGi service interface | `IProductRepository` interface |
| `@Reference` field injection | Constructor parameter injection (`new ProductService(repo)`) |
| Maven `pom.xml` | `package.json` |
| `mvn clean install` | `npm install && npm run build` |
| JVM running `.class` files | Node.js running `.js` files (or `.ts` via `tsx`) |
| `application.properties` | `.env` file read by `dotenv` |
