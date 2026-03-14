"use client";

import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, Coins, Loader2, TrendingUp, User } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface TopupHistory {
  transactionId: string;
  amount: number;
  sender: string;
  receiver: string;
  transactionDate: string;
  pointsAdded: number;
  status: "success" | "failed" | "pending";
  type: "bank_slip" | "truemoney_gift";
  createdAt: string;
}

interface HistoryResponse {
  success: boolean;
  message: string;
  data: {
    current_points: number;
    total_transactions: number;
    history: TopupHistory[];
  };
}

export default function TopupHistoryPage() {
  const [history, setHistory] = useState<TopupHistory[]>([]);
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchTopupHistory();
  }, []);

  const fetchTopupHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/topup/verifyslip/history");
      const data: HistoryResponse = response.data;

      if (data.success) {
        setHistory(data.data.history);
        setCurrentPoints(data.data.current_points);
        setTotalTransactions(data.data.total_transactions);
      } else {
        toast.error(data.message || "ไม่สามารถดึงประวัติการเติมเงินได้");
      }
    } catch (error: any) {
      console.error("Error fetching topup history:", error);
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "bank_slip":
        return <Badge variant="outline">โอนผ่านธนาคาร</Badge>;
      case "truemoney_gift":
        return <Badge variant="outline">ซองของขวัญทรูมันนี่</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex justify-center items-center">
          <Spinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-3">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="text-center mb-5">
            <h1 className="text-xl">ประวัติการเติมเงิน</h1>
            <p className="text-muted-foreground text-sm">
              ดูประวัติการเติมเงินทั้งหมดของคุณ
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border p-3 rounded-lg">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm text-muted-foreground">
                  ยอดเงินคงเหลือ
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  <span className="gg font-semibold text-white text-2xl">
                    {user?.points?.toLocaleString() || "0"}
                  </span>{" "}
                  คะแนน
                </div>
              </div>
            </div>
            <div className="border p-3 rounded-lg">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm text-muted-foreground">
                  จำนวนรายการทั้งหมด
                </div>
                <div className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  <span className="gg font-semibold text-white text-2xl">
                    {totalTransactions}
                  </span>{" "}
                  รายการ
                </div>
              </div>
            </div>
            <div className="border p-3 rounded-lg">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm text-muted-foreground">
                  รายการล่าสุด
                </div>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-white text-xl">
                    {history.length > 0
                      ? formatDate(history[0].createdAt)
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <h3>รายการการเติมเงิน</h3>
            </div>
            <div>
              {history.length === 0 ? (
                <div className="text-center py-5">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Coins />
                      </EmptyMedia>
                      <EmptyTitle>
                        ยังไม่มีประวัติการเติมเงิน
                      </EmptyTitle>
                      <EmptyDescription>ยังไม่มีประวัติการเติมเงิน</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Link href="/topup">
                        <Button className="cursor-pointer">
                            เติมเงิน <ArrowDownRight />
                        </Button>
                      </Link>
                    </EmptyContent>
                  </Empty>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>รหัสธุรกรรม</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>จำนวนเงิน</TableHead>
                        <TableHead>คะแนนที่ได้</TableHead>
                        <TableHead>ผู้ส่ง</TableHead>
                        <TableHead>ผู้รับ</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead>วันที่</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((record) => (
                        <TableRow key={record.transactionId}>
                          <TableCell className="font-mono text-xs">
                            {record.transactionId.slice(0, 8)}...
                          </TableCell>
                          <TableCell>{getTypeBadge(record.type)}</TableCell>
                          <TableCell className="font-medium">
                            {formatAmount(record.amount)}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">
                            +{record.pointsAdded.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {record.sender.slice(0, 6)}...
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {record.receiver.slice(0, 6)}...
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
