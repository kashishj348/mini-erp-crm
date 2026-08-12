import { Router } from 'express';
import { createCustomerController, createFollowUpController, deleteCustomerController, getCustomerController, listCustomersController, listFollowUpsController, updateCustomerController } from '../controllers/customer.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import { customerCreateDto, customerQueryDto, customerUpdateDto, followUpCreateDto } from '../dto/customer.dto';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), validateQuery(customerQueryDto), listCustomersController);
router.post('/', authenticate, requireRole('ADMIN', 'SALES'), validate(customerCreateDto), createCustomerController);
router.get('/:id', authenticate, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), getCustomerController);
router.patch('/:id', authenticate, requireRole('ADMIN', 'SALES'), validate(customerUpdateDto), updateCustomerController);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCustomerController);
router.post('/:id/follow-ups', authenticate, requireRole('ADMIN', 'SALES'), validate(followUpCreateDto), createFollowUpController);
router.get('/:id/follow-ups', authenticate, requireRole('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), listFollowUpsController);

export default router;
