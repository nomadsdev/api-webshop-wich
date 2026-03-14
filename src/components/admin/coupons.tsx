"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Gift, Calendar, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/axios";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface Coupon {
  _id: string;
  code: string;
  amount: number;
  usageType: "single" | "multi" | "unlimited";
  maxUsage?: number;
  currentUsage: number;
  usedBy: Array<{ _id: string; username: string; email: string }>;
  status: "active" | "inactive" | "expired";
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    amount: "",
    usageType: "single" as "single" | "multi" | "unlimited",
    maxUsage: "",
    expiresAt: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/topup/coupon/admin/coupons");
      if (response.data.status === "success") {
        setCoupons(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลคูปอง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCoupons();
    }
  }, [isAuthenticated, token]);

  const handleCreateCoupon = async () => {
    if (!formData.code || !formData.amount) {
      toast.error("กรุณาระบุโค้ดและจำนวนเงิน");
      return;
    }

    if (formData.usageType === "multi" && !formData.maxUsage) {
      toast.error("กรุณาระบุจำนวนครั้งที่ใช้ได้สูงสุด");
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post("/topup/coupon/admin/coupons", {
        code: formData.code,
        amount: parseFloat(formData.amount),
        usageType: formData.usageType,
        maxUsage:
          formData.usageType === "multi"
            ? parseInt(formData.maxUsage)
            : undefined,
        expiresAt: formData.expiresAt || undefined,
      });

      if (response.data.status === "success") {
        toast.success("สร้างคูปองสำเร็จ");
        setFormData({
          code: "",
          amount: "",
          usageType: "single",
          maxUsage: "",
          expiresAt: "",
        });
        setIsCreateDialogOpen(false);
        fetchCoupons();
      }
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      if (error.response?.data) {
        toast.error(
          error.response.data.message || "เกิดข้อผิดพลาดในการสร้างคูปอง",
        );
      } else {
        toast.error("เกิดข้อผิดพลาดในการสร้างคูปอง");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (couponId: string, status: string) => {
    try {
      const response = await api.put(
        `/topup/coupon/admin/coupons/${couponId}`,
        {
          status,
        },
      );

      if (response.data.status === "success") {
        toast.success("อัปเดตสถานะคูปองสำเร็จ");
        fetchCoupons();
      }
    } catch (error: any) {
      console.error("Error updating coupon status:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะคูปอง");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      expired: "destructive",
    } as const;

    const labels = {
      active: "ใช้งานได้",
      inactive: "ปิดใช้งาน",
      expired: "หมดอายุ",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getUsageTypeLabel = (type: string) => {
    const labels = {
      single: "ใช้ครั้งเดียว",
      multi: "ใช้หลายครั้ง",
      unlimited: "ใช้ไม่จำกัด",
    };
    return labels[type as keyof typeof labels];
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen flex items-center justify-center">
          <Spinner />
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="text-start">
            <h1 className="text-xl">จัดการคูปอง</h1>
            <p className="text-muted-foreground text-sm">
              สร้างและจัดการคูปองเติมเงิน
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <Plus className="w-4 h-4" />
                สร้างคูปอง
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>สร้างคูปองใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">โค้ดคูปอง</Label>
                  <Input
                    id="code"
                    placeholder="กรอกโค้ดคูปอง"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="กรอกจำนวนเงิน"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageType">ประเภทการใช้งาน</Label>
                  <Select
                    value={formData.usageType}
                    onValueChange={(value: "single" | "multi" | "unlimited") =>
                      setFormData({ ...formData, usageType: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">ใช้ครั้งเดียว</SelectItem>
                      <SelectItem value="multi">ใช้หลายครั้ง</SelectItem>
                      <SelectItem value="unlimited">ใช้ไม่จำกัด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.usageType === "multi" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxUsage">จำนวนครั้งที่ใช้ได้สูงสุด</Label>
                    <Input
                      id="maxUsage"
                      type="number"
                      placeholder="กรอกจำนวนครั้ง"
                      value={formData.maxUsage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUsage: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">
                    วันหมดอายุ (ไม่ระบุหากไม่มี)
                  </Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiresAt: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    onClick={handleCreateCoupon}
                    className="flex-1"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Spinner />
                        กำลังสร้าง...
                      </>
                    ) : (
                      "สร้างคูปอง"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โค้ด</TableHead>
                <TableHead>จำนวนเงิน</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>การใช้งาน</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันหมดอายุ</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-mono font-medium">
                    {coupon.code}
                  </TableCell>
                  <TableCell>{coupon.amount} บาท</TableCell>
                  <TableCell>{getUsageTypeLabel(coupon.usageType)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {coupon.currentUsage}
                      {coupon.maxUsage && `/${coupon.maxUsage}`} ครั้ง
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {coupon.usedBy.length} คนที่ใช้แล้ว
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(coupon.status)}</TableCell>
                  <TableCell>
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString("th-TH")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {coupon.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateStatus(coupon._id, "inactive")
                          }
                        >
                          ปิดใช้งาน
                        </Button>
                      )}
                      {coupon.status === "inactive" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(coupon._id, "active")
                          }
                        >
                          เปิดใช้งาน
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {coupons.length === 0 && (
            <div>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Gift />
                  </EmptyMedia>
                  <EmptyTitle>ยังไม่มีคูปอง</EmptyTitle>
                  <EmptyDescription>
                    คลิกปุ่ม "สร้างคูปอง" เพื่อเริ่มต้น
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    className="cursor-pointer"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    สร้างคูปอง
                  </Button>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
