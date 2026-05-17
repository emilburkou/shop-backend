import { Router, Request, Response } from 'express';
import type { ProductService } from '../services/productService';

export function createCategoryRouter(service: ProductService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const categories = await service.getCategories();
    res.json(categories);
  });

  router.get('/brands', async (_req: Request, res: Response) => {
    const brands = await service.getBrands();
    res.json(brands);
  });

  return router;
}
