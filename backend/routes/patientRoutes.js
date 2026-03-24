import express from 'express';
import { getProfile, getHealthData, createHealthData } from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('patient'));

router.get('/profile', getProfile);
router.get('/health', getHealthData);
router.post('/health', createHealthData);

export default router;
