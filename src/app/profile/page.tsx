"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  User,
  Coins,
  History,
  Settings,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "history" && token) {
      fetchTransactionHistory();
    }
  }, [activeTab, token]);

  const fetchTransactionHistory = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await api.get("/topup/verifyslip/history");
      setTransactionHistory(response.data.data?.history || []);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      toast.error("ดึงข้อมูลประวัติไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token) return;

    try {
      const response = await api.put("/auth/profile", editForm);

      if (response.data.success) {
        toast.success("อัปเดตข้อมูลสำเร็จ");
        setIsEditing(false);
      } else {
        toast.error(response.data.message || "อัปเดตข้อมูลไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <div className="border rounded-lg p-3 space-y-4">
                <div className="text-center space-y-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{user.username}</h2>
                    <p className="text-sm text-muted-foreground">
                      สมาชิกผู้ใช้งาน
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Badge variant="secondary" className="text-xs px-3 py-1">
                    <span className="font-medium">คะแนน</span>
                    {user.points}
                  </Badge>
                </div>

                <div className="h-px bg-border my-4"></div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {user.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      สมัครเมื่อ{" "}
                      {new Date(user.createdAt).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {user.role === 1 ? "ผู้ดูแลระบบ" : "ผู้ใช้งานทั่วไป"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border my-4"></div>

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Settings className="h-4 w-4" />
                    {isEditing ? "ยกเลิกแก้ไข" : "แก้ไขข้อมูล"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    ออกจากระบบ
                  </Button>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">

                <div>
                  <img src="https://placehold.co/1200x400" className="rounded-md" alt="" />
                </div>
                <div>
                  <img src="https://placehold.co/1200x400" className="rounded-md" alt="" />
                </div>

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
