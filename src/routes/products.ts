import { Router, Request, Response } from 'express';
import type { ProductService } from '../services/productService';
import type { ProductFilters } from '../types/product';

export function createProductRouter(service: ProductService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const filters: ProductFilters = {
      q: req.query.q as string | undefined,
      brand: req.query.brand as string | undefined,
      category: req.query.category as string | undefined,
      subcategory: req.query.subcategory as string | undefined,
      minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
      minRating: req.query.minRating !== undefined ? Number(req.query.minRating) : undefined,
      inStock: req.query.inStock !== undefined ? req.query.inStock === 'true' : undefined,
      sortBy: req.query.sortBy as ProductFilters['sortBy'],
      page: req.query.page !== undefined ? Number(req.query.page) : 1,
      limit: req.query.limit !== undefined ? Number(req.query.limit) : 24,
    };

    const result = await service.getProducts(filters);
    res.json(result);
  });

  router.get('/search', async (req: Request, res: Response) => {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }
    const result = await service.getProducts({ q: q.trim(), page: 1, limit: 24 });
    res.json(result);
  });

  router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
    const product = await service.getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });

  router.post('/', async (req: Request, res: Response) => {
    const product = await service.createProduct(req.body);
    res.status(201).json(product);
  });

  return router;
}
