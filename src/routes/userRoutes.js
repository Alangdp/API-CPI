import { Router } from 'express';

import userController from '../controllers/userController.js';
import Islogged from '../middleware/loginMiddleware.js';

const router = new Router();

router.get('/', Islogged, userController.show);
router.post('/', userController.store);
router.patch('/:id', Islogged, userController.patch);
router.delete('/:id', Islogged, userController.delete);

export default router;
