const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema(
  {
    gymUuid: {
      type: String,
      required: [true, 'Gym UUID is required'],
      index: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: [true, 'Member is required'],
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
    },
    type: {
      type: String,
      enum: ['membership_renewal', 'health_checkup', 'progress_review', 'payment_reminder', 'general', 'feedback'],
      default: 'general',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    completedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    notes: {
      type: String,
      trim: true,
    },
    outcome: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

followupSchema.index({ gymUuid: 1, status: 1 });
followupSchema.index({ gymUuid: 1, scheduledDate: 1 });
followupSchema.index({ gymUuid: 1, member: 1 });
followupSchema.index({ gymUuid: 1, type: 1 });
followupSchema.index({ gymUuid: 1, priority: 1 });

module.exports = mongoose.model('Followup', followupSchema);
