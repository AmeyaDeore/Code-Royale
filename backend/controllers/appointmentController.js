import Appointment from '../models/Appointment.js';
import AppError from '../utils/appError.js';

export const getAppointments = async (req, res, next) => {
  try {
    const filter = req.user.role === 'patient' 
      ? { patientId: req.user._id } 
      : { doctorId: req.user._id };

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ date: 1 });

    res.json({
      status: 'success',
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, notes } = req.body;
    
    // Automatically generate a mock meeting link for telemedicine
    const meetingLink = `https://meet.healthsphere.com/${Math.random().toString(36).substring(7)}`;

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date,
      timeSlot,
      notes,
      meetingLink,
    });

    res.status(201).json({
      status: 'success',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
