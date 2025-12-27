const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema(
  {
    gymUuid: {
      type: String,
      required: [true, 'Gym UUID is required'],
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    specializations: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    availability: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active',
    },
    profileImage: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalClients: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

trainerSchema.index({ gymUuid: 1, email: 1 }, { unique: true });
trainerSchema.index({ gymUuid: 1, status: 1 });
trainerSchema.index({ gymUuid: 1, specializations: 1 });

module.exports = mongoose.model('Trainer', trainerSchema);
