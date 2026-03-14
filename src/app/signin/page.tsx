"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { PublicRoute } from "@/components/ProtectedRoute";
import { Turnstile } from "@/components/ui/turnstile";

export default function page() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    if (!turnstileToken) {
      toast.error("กรุณายืนยันว่าคุณไม่ใช่บอท");
      return;
    }

    try {
      await login(formData.username, formData.password, turnstileToken);
    } catch (error) {
      // Error is already handled in AuthContext with toast
      console.error("Login error caught in signin page:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleError = useCallback(() => {
    toast.error("การยืนยันตัวตนล้มเหลว กรุณาลองใหม่");
    setTurnstileToken("");
  }, []);

  const handleExpire = useCallback(() => {
    setTurnstileToken("");
  }, []);

  return (
    <PublicRoute>
      <main className="min-h-screen flex justify-center items-center p-3">
        <section className="w-full max-w-sm border bg-background p-3 rounded-lg">
          <div className="text-center">
            <h1>เข้าสู่ระบบ</h1>
            <p className="text-xs text-muted-foreground">
              เข้าสู่ระบบเพื่อใช้งานเว็บไซต์บริการ OTP
            </p>
          </div>
          <div className="mt-5">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="gap-1">
                <Label className="text-xs font-normal">ชื่อผู้ใช้งาน</Label>
                <Input
                  placeholder="ชื่อผู้ใช้งาน"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="gap-1">
                <Label className="text-xs font-normal">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    placeholder="รหัสผ่าน"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onVerify={handleVerify}
                  onError={handleError}
                  onExpire={handleExpire}
                />
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={isLoading || !turnstileToken}
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      กำลังเข้าสู่ระบบ
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </div>
            </form>
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                หากคุณยังไม่มีบัญชี คลิก{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-center text-muted-foreground">
                เพิ่มใส่ข้อมูลครบแล้ว สามารถกดปุ่ม <Kbd>Enter</Kbd>{" "}
                เพื่อเข้าสู่ระบบ
              </p>
            </div>
          </div>
        </section>
      </main>
    </PublicRoute>
  );
}
