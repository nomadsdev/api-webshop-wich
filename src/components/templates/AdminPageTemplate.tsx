import React, { useState, useEffect } from "react";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Plus, Gift } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/axios";

interface FormData {
  code: string;
  amount: string;
  usageType: "single" | "multi" | "unlimited";
  maxUsage: string;
  expiresAt: string;
}

interface AdminPageTemplateProps {
  title: string;
  description: string;
  createButtonText: string;
  createDialogTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  tableHeaders: string[];
  fetchData: () => Promise<any>;
  createData: (data: FormData) => Promise<any>;
  updateStatus: (id: string, status: string) => Promise<any>;
  renderTableRow: (item: any, updateStatus: (id: string, status: string) => void) => React.ReactNode;
  renderCreateForm: (formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>, isCreating: boolean) => React.ReactNode;
}

export function AdminPageTemplate({
  title,
  description,
  createButtonText,
  createDialogTitle,
  emptyTitle,
  emptyDescription,
  tableHeaders,
  fetchData,
  createData,
  updateStatus,
  renderTableRow,
  renderCreateForm,
}: AdminPageTemplateProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    code: "",
    amount: "",
    usageType: "single",
    maxUsage: "",
    expiresAt: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchDataHandler = async () => {
    try {
      const response = await fetchData();
      if (response.data.status === "success") {
        setData(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDataHandler();
    }
  }, [isAuthenticated, token]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const response = await createData(formData);

      if (response.data.status === "success") {
        toast.success("สร้างข้อมูลสำเร็จ");
        setFormData({
          code: "",
          amount: "",
          usageType: "single",
          maxUsage: "",
          expiresAt: "",
        });
        setIsCreateDialogOpen(false);
        fetchDataHandler();
      }
    } catch (error: any) {
      console.error("Error creating data:", error);
      if (error.response?.data) {
        toast.error(
          error.response.data.message || "เกิดข้อผิดพลาดในการสร้างข้อมูล",
        );
      } else {
        toast.error("เกิดข้อผิดพลาดในการสร้างข้อมูล");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await updateStatus(id, status);

      if (response.data.status === "success") {
        toast.success("อัปเดตสถานะสำเร็จ");
        fetchDataHandler();
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
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
      <main className="min-h-screen">
        <section className="flex justify-center px-3 py-5">
          <div className="w-full max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <div className="text-start">
                <h1 className="text-xl">{title}</h1>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="cursor-pointer">
                    <Plus className="w-4 h-4" />
                    {createButtonText}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{createDialogTitle}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {renderCreateForm(formData, setFormData, isCreating)}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="flex-1"
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        onClick={handleCreate}
                        className="flex-1"
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <>
                            <Spinner />
                            กำลังสร้าง...
                          </>
                        ) : (
                          createButtonText
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
                    {tableHeaders.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => renderTableRow(item, handleUpdateStatus))}
                </TableBody>
              </Table>
              {data.length === 0 && (
                <div>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Gift />
                      </EmptyMedia>
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      <EmptyDescription>{emptyDescription}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button className="cursor-pointer" onClick={() => setIsCreateDialogOpen(true)}>
                        {createButtonText}
                      </Button>
                    </EmptyContent>
                  </Empty>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
