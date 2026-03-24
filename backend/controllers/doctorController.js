import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import AppError from '../utils/appError.js';

export const getPatients = async (req, res, next) => {
  try {
    // A doctor's patients could be determined by past appointments
    const appointments = await Appointment.find({ doctorId: req.user._id }).populate('patientId', 'name email');
    
    // Extract unique patients
    const patientsMap = new Map();
    appointments.forEach((app) => {
      if (app.patientId) {
        patientsMap.set(app.patientId._id.toString(), app.patientId);
      }
    });

    const patients = Array.from(patientsMap.values());

    res.json({
      status: 'success',
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    // Return aggregate statistics for Recharts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAppointments = await Appointment.countDocuments({
      doctorId: req.user._id,
      date: { $gte: today },
    });

    const totalPatients = (await Appointment.find({ doctorId: req.user._id }).distinct('patientId')).length;
    
    const prescriptionsIssued = await Prescription.countDocuments({ doctorId: req.user._id });

    res.json({
      status: 'success',
      data: {
        todayAppointments,
        totalPatients,
        prescriptionsIssued,
        // Mock weekly data for Recharts
        weeklyData: [
          { name: 'Mon', patients: 12 },
          { name: 'Tue', patients: 19 },
          { name: 'Wed', patients: 15 },
          { name: 'Thu', patients: 22 },
          { name: 'Fri', patients: 18 },
          { name: 'Sat', patients: 5 },
          { name: 'Sun', patients: 2 },
        ]
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (req, res, next) => {
  try {
    const { patientId, medications, instructions } = req.body;

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      medications,
      instructions,
    });

    res.status(201).json({
      status: 'success',
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};
