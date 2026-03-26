import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metrics: {
      heartRate: {
        type: Number,
      },
      oxygenSaturation: {
        type: Number,
      },
      respiratoryRate: {
        type: Number,
      },
      steps: {
        type: Number,
      },
      bloodPressure: {
        systolic: { type: Number },
        diastolic: { type: Number },
      },
      sleepHours: {
        type: Number,
      },
      bloodSugar: {
        type: Number,
      },
    },
    aiHealthScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    source: {
      type: String,
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

const HealthData = mongoose.model('HealthData', healthDataSchema);
export default HealthData;
