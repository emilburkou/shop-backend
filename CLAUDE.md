# Shop Backend — Claude Context

## What this project is
Node.js + TypeScript REST API for an e-commerce product catalog.
EPAM JS training course final project. The developer is a Java AEM developer learning Node.js.

## How to run
```bash
npm install
npm run dev       # starts on :3000, auto-creates DB and seeds 60 products
```

## How to verify it works
```bash
curl http://localhost:3000/api/products?limit=3
curl http://localhost:3000/api/categories
```

## Architecture — critical to preserve
This project uses the **Repository Pattern**. All database access goes through:
```
Route handler → ProductService → IProductRepository → SqliteProductRepository
```
- `ProductService` must never import from `better-sqlite3` directly
- Route handlers must never query the database directly
- New data operations always go: interface method → repository implementation → service method → route handler
- When adding filters: add to `ProductFilters` type, then `IProductRepository`, then `SqliteProductRepository`, then route params

## Key files
| File | Role |
|---|---|
| `src/index.ts` | App entry: wires repository → service → routes |
| `src/types/product.ts` | Shared TypeScript types — change carefully |
| `src/repositories/IProductRepository.ts` | The contract — add methods here first |
| `src/repositories/SqliteProductRepository.ts` | Only file that uses SQL/SQLite |
| `src/services/productService.ts` | Input sanitization and business logic |
| `src/routes/products.ts` | HTTP layer: parse params, call service |

## Conventions
- TypeScript strict mode is on — no `any`, no unchecked nulls
- `better-sqlite3` is synchronous (no `await` needed for DB calls) but the repository interface is async (`Promise<>`) — this is intentional so swapping to Postgres (which IS async) requires no changes to service or routes
- Environment config via `.env` and `dotenv/config` (imported at top of `index.ts`)
- The `data/` directory is gitignored — SQLite file is local only

## Suggested Claude skills to use
- `/simplify` — after adding a feature, ask Claude to review the new code for unnecessary complexity
- `/security-review` — before pushing any code that handles user input or touches the database
- `/review` — when you open a GitHub pull request

## Common tasks
- **Add a filter**: `ProductFilters` type → `IProductRepository` → `SqliteProductRepository.findAll()` → route query param
- **Add an endpoint**: route handler → service method → repository method
- **Reset the database**: delete `data/products.db`, then `npm run dev`
- **Switch to PostgreSQL**: implement `PostgresProductRepository implements IProductRepository`, change one line in `index.ts`
