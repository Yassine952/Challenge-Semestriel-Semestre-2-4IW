import mongoose from 'mongoose';

const PromotionSchema = new mongoose.Schema({
  promotionId: { type: Number, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    required: true,
    default: 'percentage'
  },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimit: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  applicationType: { 
    type: String, 
    enum: ['all', 'category', 'product'], 
    required: true,
    default: 'all'
  },
  applicableCategories: [String],
  applicableProductIds: [Number],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});
PromotionSchema.index({ code: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });
PromotionSchema.index({ isActive: 1 });
PromotionSchema.index({ applicationType: 1 });

const PromotionMongo = mongoose.model('Promotion', PromotionSchema);

export default PromotionMongo; 