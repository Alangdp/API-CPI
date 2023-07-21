import { Router } from 'express';

import stocksController from '../controllers/stocksController.js';

const router = new Router();

router.post('/', stocksController.store);
router.post('/:ticker', stocksController.show);

export default router;
