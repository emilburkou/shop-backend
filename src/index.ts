import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initSchema } from './db/schema';
import { seedProducts } from './db/seed';
import { SqliteProductRepository } from './repositories/SqliteProductRepository';
import { ProductService } from './services/productService';
import { createProductRouter } from './routes/products';
import { createCategoryRouter } from './routes/categories';

initSchema();
seedProducts();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

const repo = new SqliteProductRepository();
const service = new ProductService(repo);

app.use('/api/products', createProductRouter(service));
app.use('/api/categories', createCategoryRouter(service));

app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shop API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { color: #1a1a2e; }
    h2 { color: #16213e; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; }
    .endpoint { background: #f8f9fa; border-left: 4px solid #0ea5e9; padding: 12px 16px; margin: 12px 0; border-radius: 4px; }
    .method { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85em; margin-right: 8px; }
    .get { background: #dcfce7; color: #166534; }
    .post { background: #fef9c3; color: #854d0e; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
    .params { margin-top: 8px; font-size: 0.9em; color: #555; }
    .param { margin: 4px 0; }
  </style>
</head>
<body>
  <h1>Shop API</h1>
  <p>E-Commerce Product Catalog REST API — running on port ${PORT}</p>

  <h2>Products</h2>

  <div class="endpoint">
    <span class="method get">GET</span><code>/api/products</code>
    <p>Get paginated product list with optional filters.</p>
    <div class="params">
      <strong>Query parameters:</strong>
      <div class="param"><code>q</code> — Search in title, description, SKU, brand</div>
      <div class="param"><code>brand</code> — Filter by brand name</div>
      <div class="param"><code>category</code> — Filter by category (e.g. Electronics)</div>
      <div class="param"><code>subcategory</code> — Filter by subcategory (e.g. Smartphones)</div>
      <div class="param"><code>minPrice</code> / <code>maxPrice</code> — Price range filter</div>
      <div class="param"><code>minRating</code> — Minimum rating (0-5)</div>
      <div class="param"><code>inStock</code> — Filter by availability (true/false)</div>
      <div class="param"><code>sortBy</code> — Sort order: <code>price_asc</code>, <code>price_desc</code>, <code>rating</code>, <code>newest</code>, <code>popularity</code></div>
      <div class="param"><code>page</code> — Page number (default: 1)</div>
      <div class="param"><code>limit</code> — Items per page: 24, 48, or 96 (default: 24)</div>
    </div>
  </div>

  <div class="endpoint">
    <span class="method get">GET</span><code>/api/products/search?q=sneakers</code>
    <p>Quick search endpoint. Required: <code>q</code> parameter.</p>
  </div>

  <div class="endpoint">
    <span class="method get">GET</span><code>/api/products/:id</code>
    <p>Get a single product by ID.</p>
  </div>

  <div class="endpoint">
    <span class="method post">POST</span><code>/api/products</code>
    <p>Create a new product. Body: <code>{ title, description, sku, brand, category, subcategory, price, ... }</code></p>
  </div>

  <h2>Categories &amp; Brands</h2>

  <div class="endpoint">
    <span class="method get">GET</span><code>/api/categories</code>
    <p>Get all categories with their subcategories.</p>
  </div>

  <div class="endpoint">
    <span class="method get">GET</span><code>/api/categories/brands</code>
    <p>Get list of all available brands.</p>
  </div>

  <h2>Example Requests</h2>
  <pre style="background:#1a1a2e;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto">
GET /api/products?category=Electronics&amp;minPrice=100&amp;maxPrice=500&amp;sortBy=rating&amp;page=1&amp;limit=24
GET /api/products?brand=Apple&amp;inStock=true&amp;sortBy=price_asc
GET /api/products/search?q=sneakers
GET /api/products/:id
GET /api/categories</pre>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Shop API running at http://localhost:${PORT}`);
  console.log(`  -> API docs: http://localhost:${PORT}`);
  console.log(`  -> Products: http://localhost:${PORT}/api/products`);
});
