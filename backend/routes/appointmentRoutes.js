import express from 'express';
import { getAppointments, createAppointment } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAppointments);
router.post('/', restrictTo('patient'), createAppointment);

export default router;
