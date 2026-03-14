"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Search, ShoppingBag, TrendingUp, Users, Calendar, ArrowUpDown } from "lucide-react";

interface AdminOrderHistory {
  orderId: string;
  product: string;
  location: string;
  pointsUsed: number;
  status: "success" | "failed" | "pending";
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
  userId?: {
    username: string;
    email: string;
  };
}

interface HistoryResponse {
  success: boolean;
  message: string;
  data: {
    total_orders: number;
    history: AdminOrderHistory[];
  };
}

export default function AdminOrderHistoryPage() {
  const [history, setHistory] = useState<AdminOrderHistory[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/otp/admin/orders/history");
      const data: HistoryResponse = response.data;

      if (data.success) {
        setHistory(data.data.history);
        setTotalOrders(data.data.total_orders);
      } else {
        toast.error(data.message || "ไม่สามารถดึงประวัติการสั่งซื้อได้");
      }
    } catch (error: any) {
      console.error("Error fetching order history:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลประวัติ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">สำเร็จ</Badge>;
      case "failed":
        return <Badge variant="destructive">ล้มเหลว</Badge>;
      case "pending":
        return <Badge variant="secondary">รอดำเนินการ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const filteredHistory = history.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.orderId.toLowerCase().includes(searchLower) ||
      record.product.toLowerCase().includes(searchLower) ||
      record.location.toLowerCase().includes(searchLower) ||
      record.userId?.username.toLowerCase().includes(searchLower) ||
      record.userId?.email.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">ประวัติการสั่งซื้อทั้งหมด</h2>
          <p className="text-sm text-muted-foreground">
            ดูประวัติการสั่งซื้อ OTP ของผู้ใช้ทั้งหมดในระบบ
          </p>
        </div>
        <Button onClick={fetchOrderHistory} variant="outline">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              รายการทั้งหมด
            </div>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-xs text-muted-foreground">รายการ</div>
          </div>
        </div>
        <div className="border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              รายการสำเร็จ
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">
              {history.filter(h => h.status === "success").length}
            </div>
            <div className="text-xs text-muted-foreground">รายการ</div>
          </div>
        </div>
        <div className="border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              รายการล่าสุด
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-medium">
              {history.length > 0 ? formatDate(history[0].createdAt) : "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag />
                </EmptyMedia>
                <EmptyTitle>
                  {searchTerm ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีประวัติการสั่งซื้อ"}
                </EmptyTitle>
                <EmptyDescription>
                  {searchTerm ? "ลองค้นหาด้วยคำอื่น" : "ยังไม่มีประวัติการสั่งซื้อในระบบ"}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสคำสั่งซื้อ</TableHead>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>สถานที่</TableHead>
                  <TableHead>คะแนนที่ใช้</TableHead>
                  <TableHead>จำนวนเงิน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow key={record.orderId}>
                    <TableCell className="font-mono text-xs">
                      {record.orderId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.userId?.username || "-"}</div>
                        <div className="text-xs text-muted-foreground">{record.userId?.email || "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.product}
                    </TableCell>
                    <TableCell>{record.location}</TableCell>
                    <TableCell className="font-medium text-red-600">
                      -{record.pointsUsed.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(record.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(record.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
