const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    gymUuid: {
      type: String,
      required: [true, 'Gym UUID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['workshop', 'competition', 'seminar', 'camp', 'other'],
      default: 'workshop',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    location: {
      type: String,
      trim: true,
    },
    maxParticipants: {
      type: Number,
      default: 20,
      min: 1,
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trainer',
    },
    image: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ gymUuid: 1, startDate: 1 });
eventSchema.index({ gymUuid: 1, status: 1 });
eventSchema.index({ gymUuid: 1, type: 1 });

module.exports = mongoose.model('Event', eventSchema);
