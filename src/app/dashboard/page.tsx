"use client";

import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import AdminCouponsPage from "@/components/admin/coupons";
import AdminUsersPage from "@/components/admin/users";
import AdminTopupHistoryPage from "@/components/admin/topup-history";
import AdminOrderHistoryPage from "@/components/admin/order-history";

export default function page() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-[calc(100vh-0px)] bg-background">
      <div className="mx-auto w-full max-w-6xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-medium">
              จัดการหลังบ้าน PROLEAK
            </div>
            <p className="text-xs text-muted-foreground gg">
              {user ? `${user.username} (${user.email})` : ""}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <aside>
            <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="justify-start md:w-full cursor-pointer"
                onClick={() => setActiveTab("overview")}
              >
                หน้าหลัก
              </Button>
              <Button
                variant={activeTab === "coupons" ? "default" : "ghost"}
                className="justify-start md:w-full cursor-pointer"
                onClick={() => setActiveTab("coupons")}
              >
                จัดการคูปอง
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="justify-start md:w-full cursor-pointer"
                onClick={() => setActiveTab("users")}
              >
                จัดการผู้ใช้
              </Button>
              <Button
                variant={activeTab === "topup-history" ? "default" : "ghost"}
                className="justify-start md:w-full cursor-pointer"
                onClick={() => setActiveTab("topup-history")}
              >
                ประวัติเติมเงิน
              </Button>
              <Button
                variant={activeTab === "order-history" ? "default" : "ghost"}
                className="justify-start md:w-full cursor-pointer"
                onClick={() => setActiveTab("order-history")}
              >
                ประวัติสั่งซื้อ
              </Button>

              {/* <div className="hidden md:block">
                <div className="my-2 h-px w-full bg-border" />
              </div> */}
            </div>
          </aside>

          <main className="px-4">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">ภาพรวม</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">รูปภาพ 1</span>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">รูปภาพ 2</span>
                    </div>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">รูปภาพ 3</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">ข้อมูลสถิติ</h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">1,234</div>
                      <div className="text-sm text-muted-foreground">ผู้ใช้งานทั้งหมด</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">5,678</div>
                      <div className="text-sm text-muted-foreground">รายการทั้งหมด</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">9,012</div>
                      <div className="text-sm text-muted-foreground">ยอดเข้าชม</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "coupons" && (
              <AdminCouponsPage />
            )}

            {activeTab === "users" && (
              <AdminUsersPage />
            )}

            {activeTab === "topup-history" && (
              <AdminTopupHistoryPage />
            )}

            {activeTab === "order-history" && (
              <AdminOrderHistoryPage />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
