import { RateConfig } from "../../models/ConfigRatePrice.js";

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
      // Convert legacy rateMultiplier to new percentage system
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

  let percentage = rateConfig.percentage || 0;
  let fixedAmount = rateConfig.fixedAmount || 0;

  const finalPrice = originalPrice * (1 + percentage / 100) + fixedAmount;
  return Math.round(finalPrice * 100) / 100;
};