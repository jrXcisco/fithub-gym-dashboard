const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    gymUuid: {
      type: String,
      required: [true, 'Gym UUID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['equipment', 'facility', 'consumable', 'other'],
      default: 'equipment',
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'in_use', 'maintenance', 'out_of_order', 'retired'],
      default: 'available',
    },
    location: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
    maintenanceSchedule: {
      lastMaintenance: Date,
      nextMaintenance: Date,
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      },
    },
    specifications: {
      brand: String,
      model: String,
      serialNumber: String,
      warranty: {
        expiryDate: Date,
        provider: String,
      },
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

resourceSchema.index({ gymUuid: 1, name: 1 });
resourceSchema.index({ gymUuid: 1, category: 1 });
resourceSchema.index({ gymUuid: 1, status: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
