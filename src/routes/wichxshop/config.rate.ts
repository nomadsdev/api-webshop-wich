import { connectDB } from "../../lib/mongodb.js";
import mongoose from "mongoose";

// Rate configuration schema
const RateConfigSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    sparse: true, // Allow null for global rate
  },
  rateMultiplier: {
    type: Number,
    required: false, // Made optional for backward compatibility
    default: null, // Deprecated - use percentage + fixedAmount instead
    min: 0.1, // Minimum 10% of original price
    max: 5.0, // Maximum 500% of original price
  },
  customPrice: {
    type: Number,
    default: null, // If set, use this price instead of calculated rate
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    default: "",
  },
  isGlobal: {
    type: Boolean,
    default: false, // Global rate applies to all products
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  percentage: {
    type: Number,
    default: 0, // % markup (e.g., 20 means 20% increase, -20 means 20% discount)
    min: -100, // Allow discounts up to 100%
    max: 1000, // Maximum 1000% markup
  },
  fixedAmount: {
    type: Number,
    default: 0, // Fixed amount in currency
    min: 0, // No negative fixed amounts
  },
});

// Create compound index for productId and isGlobal
RateConfigSchema.index(
  { productId: 1, isGlobal: 1 },
  { unique: true, sparse: true },
);

// Update timestamp on save
RateConfigSchema.pre("save", function (this: any, next: any) {
  this.updatedAt = new Date();
  next();
});

export const RateConfig =
  mongoose.models.RateConfig || mongoose.model("RateConfig", RateConfigSchema);

// Get rate configuration for a product (with global rate support)
export const getProductRate = async (productId: string) => {
  try {
    await connectDB();

    // First try to get specific product rate
    const specificConfig = await RateConfig.findOne({
      productId,
      isActive: true,
      isGlobal: false,
    });
    if (specificConfig) {
      return specificConfig;
    }

    // If no specific rate, get global rate
    const globalConfig = await RateConfig.findOne({
      isGlobal: true,
      isActive: true,
    });
    return globalConfig;
  } catch (error) {
    console.error("Error getting product rate:", error);
    return null;
  }
};

export const calculateProductPrice = async (originalPrice: number, productId: string) => {
  try {
    await connectDB();

    const specificConfig = await RateConfig.findOne({ productId, isActive: true, isGlobal: false });
    const globalConfig = await RateConfig.findOne({ isGlobal: true, isActive: true });

    const config = specificConfig || globalConfig;

    if (!config) return originalPrice;

    // ✅ customPrice has highest priority
    if (config.customPrice && config.customPrice > 0) {
      return config.customPrice;
    }

    // ✅ Backward compatibility: convert rateMultiplier to percentage if needed
    let percentage = config.percentage || 0;
    let fixedAmount = config.fixedAmount || 0;
    
    // If we have old rateMultiplier data and no percentage/fixedAmount set
    if (config.rateMultiplier !== null && config.rateMultiplier !== undefined && 
        percentage === 0 && fixedAmount === 0) {
      percentage = (config.rateMultiplier - 1) * 100;
      fixedAmount = 0;
      
      // Optionally update the document to use new fields
      await RateConfig.findByIdAndUpdate(config._id, {
        percentage,
        fixedAmount,
        rateMultiplier: null // Clear deprecated field
      });
    }

    // ✅ New hybrid pricing formula: finalPrice = originalPrice * (1 + percentage / 100) + fixedAmount
    const finalPrice = originalPrice * (1 + percentage / 100) + fixedAmount;

    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating product price:', error);
    return originalPrice;
  }
};

// Legacy function for backward compatibility
export const calculateProductPriceLegacy = (
  originalPrice: number,
  rateConfig: any,
) => {
  if (!rateConfig || !rateConfig.isActive) {
    return originalPrice;
  }

  // If custom price is set, use it
  if (rateConfig.customPrice && rateConfig.customPrice > 0) {
    return rateConfig.customPrice;
  }

  // Otherwise use rate multiplier
  return Math.round(originalPrice * rateConfig.rateMultiplier * 100) / 100; // Round to 2 decimal places
};

// Default rate configurations for common products
export const DEFAULT_RATES = {
  // Example: VIP products have higher rates
  vip_monthly: { percentage: 20, fixedAmount: 0, description: "VIP Monthly - 20% markup" },
  vip_yearly: { percentage: 10, fixedAmount: 0, description: "VIP Yearly - 10% markup" },

  // Example: Special products have lower rates
  special_promo: {
    percentage: -20, // 20% discount
    fixedAmount: 0,
    description: "Special Promotion - 20% discount",
  },

  // Example: Gaming products with hybrid pricing
  roblox_robux: {
    percentage: 15,
    fixedAmount: 5, // Additional 5 currency units
    description: "Roblox Robux - 15% + 5 fixed markup",
  },
  fortnite_vbucks: {
    percentage: 10,
    fixedAmount: 0,
    description: "Fortnite V-Bucks - 10% markup",
  },
};

// Initialize default rate configurations
export const initializeDefaultRates = async () => {
  try {
    await connectDB();

    for (const [productId, config] of Object.entries(DEFAULT_RATES)) {
      await RateConfig.findOneAndUpdate(
        { productId },
        {
          ...config,
          isActive: true,
        },
        { upsert: true, new: true },
      );
    }

    console.log("Default rate configurations initialized");
  } catch (error) {
    console.error("Error initializing default rates:", error);
  }
};
