import { Router } from 'express';

import stocksController from '../controllers/stocksController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import loginMiddleware from '../middleware/loginMiddleware.js';

const router = new Router();

router.post('/', adminMiddleware, stocksController.store);
router.get('/:ticker', adminMiddleware, stocksController.show);
router.post('/userChart/', loginMiddleware, stocksController.storeChart);
router.patch('/userChart/', adminMiddleware, stocksController.updateCharts);

router.post('/chartHistory', adminMiddleware, stocksController.updateHistory);

export default router;
