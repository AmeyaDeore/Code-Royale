import mongoose from 'mongoose';

const googleFitTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    tokenExpiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GoogleFitToken = mongoose.model('GoogleFitToken', googleFitTokenSchema);
export default GoogleFitToken;