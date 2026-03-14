import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ShoppingCart,
  X,
} from "lucide-react";
import type { Product } from "@/api/product";

interface CardProductProps {
  product: Product;
  onBuyClick: (product: Product) => void;
  formatPrice: (price: number) => string;
}

export default function CardProduct({ product, onBuyClick, formatPrice }: CardProductProps) {
  const getImageSrc = () => {
    if (product.name?.toLowerCase().includes("discord") && 
        !product.name?.toLowerCase().includes("verify-dc")) {
      return "/discord-logo.jpg";
    }
    return product.image || "";
  };

  const isOutOfStock = (product.stock || 0) <= 0;

  return (
    <Card className="h-full flex flex-col p-3 gap-3">
      <div>
        <img
          src={getImageSrc()}
          alt={product.name || "สินค้า"}
          className={`w-full rounded-md object-cover ${
            isOutOfStock ? "grayscale opacity-70" : ""
          }`}
        />
      </div>
      <div>
        <h3 className="text-base line-clamp-1">
          {product.name || "สินค้าไม่มีชื่อ"}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {product.name}
        </p>
      </div>
      <div className="flex justify-between">
        <span className="gg font-semibold">
          {formatPrice(product.price || 0)}
        </span>
        <span className="text-sm">
          คงเหลือ{" "}
          <span className="gg font-semibold">
            {product.stock || 0}
          </span>{" "}
          ชิ้น
        </span>
      </div>
      <div>
        <Button
          onClick={() => onBuyClick(product)}
          disabled={isOutOfStock}
          className={`w-full ${
            !isOutOfStock ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          {!isOutOfStock ? (
            <>
              <ShoppingCart className="w-4 h-4" /> ซื้อสินค้า
            </>
          ) : (
            <>
              <X className="w-4 h-4" /> สินค้าหมด
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}