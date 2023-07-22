import { Router } from 'express';

import stocksController from '../controllers/stocksController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = new Router();

router.post('/', adminMiddleware, stocksController.store);
router.post('/:ticker', adminMiddleware, stocksController.show);

export default router;
