"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, authApi } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    phone?: string;
    password: string;
    turnstileToken?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        localStorage.removeItem("token");
        setToken(null);
      }
    } catch (error: any) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");
      setToken(null);
      // Don't show toast on initial load, only on subsequent failures
      if (error.response?.status === 401) {
        // Token is invalid, just clear it silently
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string,
    turnstileToken?: string,
  ) => {
    try {
      setIsLoading(true);

      const response = await authApi.login(username, password, turnstileToken);

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("token", response.token);
        toast.success("เข้าสู่ระบบสำเร็จ");
        router.push("/");
      } else {
        toast.error(response.message || "เข้าสู่ระบบล้มเหลว");
      }
    } catch (error: any) {
      console.error(error);
      // Handle different error types
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else if (error.response?.status === 429) {
        toast.error("กรุณาลองใหม่ภายหลัง");
      } else {
        toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    phone?: string;
    password: string;
    turnstileToken?: string;
  }) => {
    try {
      const response = await authApi.register(userData);

      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem("token", response.token);
        toast.success("สมัครสมาชิกสำเร็จ");
        router.push("/");
      } else {
        toast.error(response.message || "สมัครสมาชิกล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    toast.success("ออกจากระบบแล้ว");
    router.push("/signin");
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 1;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
