"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { PublicRoute } from "@/components/ProtectedRoute";
import { Turnstile } from "@/components/ui/turnstile";
import { useCallback } from "react";

function PasswordStrengthChecker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "อย่างน้อย 8 ตัวอักษร" },
      { regex: /[0-9]/, text: "อย่างน้อย 1 ตัวเลข" },
      { regex: /[a-z]/, text: "อย่างน้อย 1 ตัวพิมพ์เล็ก" },
      { regex: /[A-Z]/, text: "อย่างน้อย 1 ตัวพิมพ์ใหญ่" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(value);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "กรุณากรอกรหัสผ่าน";
    if (score <= 2) return "รหัสผ่านอ่อน";
    if (score === 3) return "รหัสผ่านปานกลาง";
    return "รหัสผ่านแข็งแรง";
  };

  return (
    <div>
      <div className="*:not-first:mt-2">
        <Label htmlFor={id}>รหัสผ่าน</Label>
        <div className="relative">
          <Input
            aria-describedby={`${id}-description`}
            className="pe-9"
            id={id}
            onChange={(e) => onChange(e.target.value)}
            placeholder="รหัสผ่าน"
            type={isVisible ? "text" : "password"}
            value={value}
            disabled={disabled}
          />
          <button
            aria-controls="password"
            aria-label={isVisible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={isVisible}
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            onClick={toggleVisibility}
            type="button"
          >
            {isVisible ? (
              <EyeOffIcon aria-hidden="true" size={16} />
            ) : (
              <EyeIcon aria-hidden="true" size={16} />
            )}
          </button>
        </div>
      </div>

      <div
        aria-label="Password strength"
        aria-valuemax={4}
        aria-valuemin={0}
        aria-valuenow={strengthScore}
        className="mt-3 mb-4 h-1 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        tabIndex={-1}
      >
        <div
          className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
          style={{ width: `${(strengthScore / 4) * 100}%` }}
        />
      </div>

      <p
        className="mb-2 font-medium text-foreground text-sm"
        id={`${id}-description`}
      >
        {getStrengthText(strengthScore)}. ต้องมี:
      </p>

      <ul aria-label="Password requirements" className="space-y-1.5">
        {strength.map((req, _index) => (
          <li className="flex items-center gap-2" key={req.text}>
            {req.met ? (
              <CheckIcon
                aria-hidden="true"
                className="text-emerald-500"
                size={16}
              />
            ) : (
              <XIcon
                aria-hidden="true"
                className="text-muted-foreground/80"
                size={16}
              />
            )}
            <span
              className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
            >
              {req.text}
              <span className="sr-only">
                {req.met ? " - ครบตามเงื่อนไข" : " - ไม่ครบตามเงื่อนไข"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function page() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!turnstileToken) {
      toast.error("กรุณายืนยันว่าคุณไม่ใช่บอท");
      return;
    }

    await register({ ...formData, turnstileToken });
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
            <h1>สมัครสมาชิก</h1>
            <p className="text-xs text-muted-foreground">
              สมัครสมาชิกเพื่อใช้งานเว็บไซต์บริการ OTP
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
                <Label className="text-xs font-normal">อีเมล</Label>
                <Input
                  placeholder="อีเมล"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <PasswordStrengthChecker
                value={formData.password}
                onChange={(password) =>
                  setFormData((prev) => ({ ...prev, password }))
                }
                disabled={isLoading}
              />
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
                  {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
                </Button>
              </div>
            </form>
            <div className="mt-3 text-center">
              <p className="text-xs text-muted-foreground">
                หากคุณมีบัญชีแล้ว คลิก{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </PublicRoute>
  );
}
