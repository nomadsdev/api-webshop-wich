import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { productApi, type Product } from "@/api/product";
import CardProduct from "@/components/product/CardProduct";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Box, Package } from "lucide-react";
import Link from "next/link";

export default function ProductR() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productApi.getProducts();
      // แสดงแค่ 8 สินค้าแรก
      setProducts(productsData.slice(0, 8));
    } catch (error: any) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  const handleBuyClick = (product: Product) => {
    // นำทางไปยังหน้า store พร้อมสถานะการซื้อ
    window.location.href = `/store?product=${product.id}`;
  };

  const handleViewAllProducts = () => {
    window.location.href = "/store";
  };

  return (
    <section className="flex justify-center px-3 py-3">
      <div className="w-full max-w-5xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm">สินค้าแนะนำ</h2>
              <p className="text-xs text-muted-foreground">
                Product Recommendation
              </p>
            </div>
            <Link href="/store">
              <Button variant="secondary" size="sm" className="cursor-pointer">
                <Package />
                ดูทั้งหมด
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-full flex flex-col p-3 gap-3 border rounded-lg"
                >
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Box />
                </EmptyMedia>
                <EmptyTitle>ไม่พบสินค้า</EmptyTitle>
                <EmptyDescription>ไม่พบสินค้าในขณะนี้</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product) => (
                  <CardProduct
                    key={product.id}
                    product={product}
                    onBuyClick={handleBuyClick}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
