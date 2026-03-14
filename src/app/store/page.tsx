"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Check,
  X,
  Box,
  Plus,
  Minus,
  ShoppingCart,
  ShoppingCartIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { productApi, type Product } from "@/api/product";
import { Spinner } from "@/components/ui/spinner";
import CardProduct from "@/components/product/CardProduct";


export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productApi.getProducts();
      setProducts(productsData);
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!selectedProduct || !user) return;

    try {
      setBuyLoading(true);
      const response = await productApi.buyProduct({
        productId: selectedProduct.id,
        quantity,
      });

      toast.success(`ซื้อสำเร็จ! คีย์: ${response.data?.key || "-"}`);
      setBuyDialogOpen(false);
      setQuantity(1);
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการซื้อสินค้า");
    } finally {
      setBuyLoading(false);
    }
  };

  const openBuyDialog = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setBuyDialogOpen(true);
  };

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen">
        <div className="w-full max-w-5xl mx-auto px-3 py-5">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-xl">สินค้าทั้งหมดของเรา</h1>
              <p className="text-muted-foreground text-sm">
                เลือกสินค้าที่ตรงตามความต้องการของคุณ
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="ค้นหาสินค้า..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[...Array(16)].map((_, i) => (
                    <Card key={i} className="h-full flex flex-col p-3 gap-3">
                      <Skeleton className="h-40 w-full" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex justify-center items-center">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Box />
                      </EmptyMedia>
                      <EmptyTitle>ไม่พบสินค้า</EmptyTitle>
                      <EmptyDescription>
                        {search || selectedCategory !== "all"
                          ? "ไม่พบสินค้าที่ตรงกับเงื่อนไขการค้นหา"
                          : "ไม่พบสินค้าพร้อมจำหน่ายในขณะนี้"}
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button
                        onClick={() => {
                          setSearch("");
                          setSelectedCategory("all");
                        }}
                      >
                        ล้างตัวกรอง
                      </Button>
                    </EmptyContent>
                  </Empty>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <CardProduct
                      key={product.id}
                      product={product}
                      onBuyClick={openBuyDialog}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ยืนยันการซื้อสินค้า</DialogTitle>
              <DialogDescription>
                คุณต้องการซื้อ {selectedProduct?.name || "สินค้าไม่มีชื่อ"}{" "}
                หรือไม่?
              </DialogDescription>
            </DialogHeader>
            <div>
              <img
                src={
                  selectedProduct?.name?.toLowerCase().includes("discord") &&
                  !selectedProduct?.name?.toLowerCase().includes("verify-dc")
                    ? "/discord-logo.jpg"
                    : selectedProduct?.image || ""
                }
                className="rounded-md w-full h-auto"
                alt={selectedProduct?.name || "สินค้า"}
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3>{selectedProduct?.name || "สินค้าไม่มีชื่อ"}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedProduct?.name || "สินค้าไม่มีชื่อ"}
                </p>
              </div>
              <div className="flex justify-between bg-neutral-900 p-2 rounded-md">
                <span className="text-sm">ราคาต่อชิ้น</span>
                <span className="gg font-semibold">
                  {selectedProduct
                    ? formatPrice(selectedProduct.price || 0)
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center gg font-semibold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={
                    !selectedProduct || quantity >= (selectedProduct.stock || 0)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center -mt-3">
                จำนวนต่อชิ้น
              </p>
              <div className="flex justify-between">
                <span>รวมทั้งหมด</span>
                <span className="gg font-semibold">
                  {selectedProduct
                    ? formatPrice((selectedProduct.price || 0) * quantity)
                    : "-"}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setBuyDialogOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleBuy}
                disabled={
                  buyLoading ||
                  !selectedProduct ||
                  (user?.points || 0) < (selectedProduct?.price || 0) * quantity
                }
                className="cursor-pointer"
              >
                {buyLoading ? (
                  <>
                    <Spinner /> กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon /> ยืนยันการซื้อ
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </ProtectedRoute>
  );
}
