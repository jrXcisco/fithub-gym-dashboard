const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
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
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    membershipType: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'vip', 'monthly', 'quarterly', 'half-yearly', 'yearly', 'custom'],
      default: 'basic',
    },
    customPlanMonths: {
      type: Number,
    },
    customPlanAmountPerMonth: {
      type: Number,
    },
    membershipStartDate: {
      type: Date,
      default: Date.now,
    },
    membershipEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'suspended', 'pending'],
      default: 'active',
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
    },
    healthInfo: {
      height: Number,
      weight: Number,
      bloodGroup: String,
      medicalConditions: [String],
    },
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank-transfer', 'cash+upi', 'cash+card', 'upi+card'],
        default: 'cash',
      },
      methodAmounts: {
        cash: Number,
        card: Number,
        upi: Number,
      },
      amount: Number,
      paidAmount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['pending', 'partial', 'paid'],
        default: 'pending',
      },
      dueDate: Date,
      nextDueDate: Date,
      lastPaymentDate: Date,
      discount: { type: Number, default: 0 },
      applyTaxes: { type: Boolean, default: false },
      taxRate: { type: String, default: '18' },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      totalTax: { type: Number, default: 0 },
    },
    paymentHistory: [{
      amount: { type: Number, required: true },
      method: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank-transfer', 'cash+upi', 'cash+card', 'upi+card'],
        required: true,
      },
      date: { type: Date, default: Date.now },
      notes: String,
      receiptNumber: String,
    }],
    workoutProgram: {
      goal: {
        type: String,
        enum: ['weight-loss', 'weight-gain', 'muscle-building', 'general-fitness', 'cardio', 'flexibility'],
      },
      startDate: Date,
      trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
      },
      notes: String,
    },
    specialRequirements: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

memberSchema.index({ gymUuid: 1, email: 1 }, { unique: true });
memberSchema.index({ gymUuid: 1, status: 1 });
memberSchema.index({ gymUuid: 1, membershipType: 1 });

module.exports = mongoose.model('Member', memberSchema);
