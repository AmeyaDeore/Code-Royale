import express from 'express';
import { getPatients, getAnalytics, createPrescription } from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('doctor'));

router.get('/patients', getPatients);
router.get('/analytics', getAnalytics);
router.post('/prescriptions', createPrescription);

export default router;
