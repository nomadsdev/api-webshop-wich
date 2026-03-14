"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Spinner } from "@/components/ui/spinner";
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
import { Search, User, Wallet, Shield, Trash2, Edit } from "lucide-react";

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: number;
  points: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    role: "",
    points: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);

      const response = await api.get(`/admin/users?${params}`);
      
      if (response.data.status === "success") {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUsers();
    }
  }, [isAuthenticated, token, search, roleFilter]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role.toString(),
      points: user.points.toString()
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    setIsUpdating(true);
    try {
      const response = await api.put(`/admin/users/${selectedUser._id}`, {
        role: parseInt(editForm.role),
        points: parseInt(editForm.points)
      });

      if (response.data.status === "success") {
        toast.success("อัปเดตข้อมูลผู้ใช้สำเร็จ");
        setEditDialog(false);
        fetchUsers(pagination.page);
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      if (error.response?.data) {
        toast.error(
          error.response.data.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้"
        );
      } else {
        toast.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ "${user.username}" ใช่หรือไม่?`)) return;

    try {
      const response = await api.delete(`/admin/users/${user._id}`);

      if (response.data.status === "success") {
        toast.success("ลบผู้ใช้สำเร็จ");
        fetchUsers(pagination.page);
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
  };

  const getRoleBadge = (role: number) => {
    const variants = {
      0: "secondary",
      1: "default",
    } as const;

    const labels = {
      0: "ผู้ใช้งาน",
      1: "แอดมิน",
    };

    return (
      <Badge variant={variants[role as keyof typeof variants]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
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
            <h1 className="text-xl">จัดการผู้ใช้</h1>
            <p className="text-muted-foreground text-sm">
              ดูและจัดการข้อมูลผู้ใช้ทั้งหมด
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาผู้ใช้..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="ตำแหน่ง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="0">ผู้ใช้งาน</SelectItem>
              <SelectItem value="1">แอดมิน</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อผู้ใช้</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>เบอร์โทร</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>เครดิต</TableHead>
                <TableHead>สร้างเมื่อ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wallet className="w-4 h-4" />
                      {user.points}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <User />
                </EmptyMedia>
                <EmptyTitle>ไม่พบผู้ใช้</EmptyTitle>
                <EmptyDescription>ไม่พบข้อมูลผู้ใช้ในขณะนี้</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}>
                  ล้างตัวกรอง
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            แสดง {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 
            จาก {pagination.total} รายการ
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลผู้ใช้: {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">ตำแหน่ง</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">ผู้ใช้งาน</SelectItem>
                  <SelectItem value="1">แอดมิน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">เครดิต</Label>
              <Input
                id="points"
                type="number"
                value={editForm.points}
                onChange={(e) => setEditForm(prev => ({ ...prev, points: e.target.value }))}
                placeholder="กรอกจำนวนเครดิต"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Spinner />
                  กำลังอัปเดต...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </ProtectedRoute>
  );
}
