import mongoose from "mongoose";

const RateConfigSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  rateMultiplier: {
    type: Number,
    required: false,
    default: null,
    min: 0.1,
    max: 5.0,
  },
  customPrice: {
    type: Number,
    default: null,
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
    default: false,
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
    default: 0,
    min: -100,
    max: 1000,
  },
  fixedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

RateConfigSchema.index(
  { productId: 1, isGlobal: 1 },
  { unique: true, sparse: true },
);

RateConfigSchema.pre("save", function (this: any, next: any) {
  this.updatedAt = new Date();
  next();
});

export const RateConfig =
  mongoose.models.RateConfig || mongoose.model("RateConfig", RateConfigSchema);

export const getProductRate = async (productId: string) => {
  try {
    const specificConfig = await RateConfig.findOne({
      productId,
      isActive: true,
      isGlobal: false,
    });
    if (specificConfig) {
      return specificConfig;
    }

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

export const calculateProductPrice = async (
  originalPrice: number,
  productId: string,
) => {
  try {
    const specificConfig = await RateConfig.findOne({
      productId,
      isActive: true,
      isGlobal: false,
    });
    const globalConfig = await RateConfig.findOne({
      isGlobal: true,
      isActive: true,
    });

    const config = specificConfig || globalConfig;

    if (!config) return originalPrice;

    if (config.customPrice && config.customPrice > 0) {
      return config.customPrice;
    }

    let percentage = config.percentage || 0;
    let fixedAmount = config.fixedAmount || 0;

    if (
      config.rateMultiplier !== null &&
      config.rateMultiplier !== undefined &&
      percentage === 0 &&
      fixedAmount === 0
    ) {
      percentage = (config.rateMultiplier - 1) * 100;
      fixedAmount = 0;

      await RateConfig.findByIdAndUpdate(config._id, {
        percentage,
        fixedAmount,
        rateMultiplier: null,
      });
    }

    const finalPrice = originalPrice * (1 + percentage / 100) + fixedAmount;

    return Math.round(finalPrice * 100) / 100;
  } catch (error) {
    console.error("Error calculating product price:", error);
    return originalPrice;
  }
};

export const calculateProductPriceLegacy = (
  originalPrice: number,
  rateConfig: any,
) => {
  if (!rateConfig || !rateConfig.isActive) {
    return originalPrice;
  }

  
  if (rateConfig.customPrice && rateConfig.customPrice > 0) {
    return rateConfig.customPrice;
  }

  return Math.round(originalPrice * rateConfig.rateMultiplier * 100) / 100;
};

export const DEFAULT_RATES = {
  vip_monthly: {
    percentage: 20,
    fixedAmount: 0,
    description: "VIP Monthly - 20% markup",
  },
  vip_yearly: {
    percentage: 10,
    fixedAmount: 0,
    description: "VIP Yearly - 10% markup",
  },

  special_promo: {
    percentage: -20,
    fixedAmount: 0,
    description: "Special Promotion - 20% discount",
  },

  roblox_robux: {
    percentage: 15,
    fixedAmount: 5,
    description: "Roblox Robux - 15% + 5 fixed markup",
  },
  fortnite_vbucks: {
    percentage: 10,
    fixedAmount: 0,
    description: "Fortnite V-Bucks - 10% markup",
  },
};

export const initializeDefaultRates = async () => {
  try {
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
