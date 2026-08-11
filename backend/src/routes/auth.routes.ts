import { Router } from 'express';
import { loginController, getMeController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginDto } from '../dto/auth.dto';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/login', validate(loginDto), loginController);
router.get('/me', authenticate, getMeController);

export default router;
