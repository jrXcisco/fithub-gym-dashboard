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
    role: {
      type: String,
      enum: ['trainer', 'cleaning-staff', 'receptionist', 'manager', 'maintenance', 'security', 'other'],
      default: 'trainer',
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
    salary: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
    },
    availability: {
      days: {
        type: [String],
        default: [],
      },
      startTime: {
        type: String,
        default: '09:00',
      },
      endTime: {
        type: String,
        default: '18:00',
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    profileImage: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
  },
  {
    timestamps: true,
  }
);

trainerSchema.index({ gymUuid: 1, email: 1 }, { unique: true });
trainerSchema.index({ gymUuid: 1, status: 1 });
trainerSchema.index({ gymUuid: 1, role: 1 });
trainerSchema.index({ gymUuid: 1, specializations: 1 });

module.exports = mongoose.model('Trainer', trainerSchema);
