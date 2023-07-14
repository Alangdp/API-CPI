import { Router } from 'express';

import userControllers from '../controllers/userControllers.js';

const router = new Router();

router.get('/', userControllers.show);
router.post('/', userControllers.store);
router.patch('/:id', userControllers.patch);
router.delete('/:id', userControllers.delete);

export default router;
