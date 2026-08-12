import { Router } from 'express';
import { createChallanController, getChallanController, listChallansController, confirmChallanController, cancelChallanController } from '../controllers/challan.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import { challanCreateDto, challanQueryDto } from '../dto/challan.dto';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), validateQuery(challanQueryDto), listChallansController);
router.post('/', authenticate, requireRole('ADMIN', 'SALES'), validate(challanCreateDto), createChallanController);
router.get('/:id', authenticate, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getChallanController);
router.post('/:id/confirm', authenticate, requireRole('ADMIN', 'WAREHOUSE'), confirmChallanController);
router.post('/:id/cancel', authenticate, requireRole('ADMIN', 'SALES'), cancelChallanController);

export default router;
