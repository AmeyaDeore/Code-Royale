import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import errorMiddleware from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Weather mock endpoint
app.get('/api/weather', (req, res) => {
  const mockWeather = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      temp: Math.floor(Math.random() * (35 - 15 + 1)) + 15,
      humidity: Math.floor(Math.random() * (90 - 40 + 1)) + 40,
      aqi: Math.floor(Math.random() * (150 - 20 + 1)) + 20,
    };
  });
  
  res.json({
    status: 'success',
    data: mockWeather
  });
});

// Handle undefined routes
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`,
    errorCode: 'ROUTE_NOT_FOUND'
  });
});

// Global Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or set a different PORT in your .env file.`);
    process.exit(1);
  }

  throw error;
});
