export interface Promotion {
  promotionId: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  applicationType: 'all' | 'category' | 'product';
  applicableCategories?: string[];
  applicableProductIds?: number[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromoValidationResult {
  valid: boolean;
  promotion?: {
    id: number;
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
  };
  discountAmount?: number;
  applicableItems?: number;
  message: string;
} 