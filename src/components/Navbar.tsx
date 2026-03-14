"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import {
  Home,
  Package,
  User,
  LogOut,
  Wallet,
  Settings,
  HelpCircle,
  UserPlus,
  LogIn,
  Menu,
  Settings2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const NavLinks = () => (
    <>
      <li className="list-none">
        <Link href="/">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            หน้าหลัก
          </Button>
        </Link>
      </li>

      <li className="list-none">
        <Link href="/store">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            เลือกซื้อสินค้า
          </Button>
        </Link>
      </li>

      <li className="list-none">
        <Link href="/topup">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            เติมเงิน
          </Button>
        </Link>
      </li>

      <li className="list-none">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              ติดต่อเรา
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div>
              <h4>ติดต่อเรา</h4>
              <p className="text-xs text-muted-foreground">
                ติดต่อ สอบถาม/แจ้งปัญหา
              </p>
            </div>
            <Link href={"https://discord.gg"}>
              <div className="border p-3 rounded-md flex items-center space-x-3">
                <div>
                  <img src="/logo-discord.png" className="w-[40px]" alt="" />
                </div>
                <div>
                  <h4>Discord Server</h4>
                  <p className="text-xs text-muted-foreground">
                    ติดต่อ สอบถาม/แจ้งปัญหา
                  </p>
                </div>
              </div>
            </Link>
          </DialogContent>
        </Dialog>
      </li>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Nexus
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="space-y-1">
                      <p>{user?.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                      <Badge className="w-full mt-2">
                        <Wallet className="w-3 h-3 mr-1" />
                        {user?.points} เครดิต
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="w-full flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          จัดการเว็บไซต์
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      ข้อมูลส่วนตัว
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile/history/orders"
                      className="w-full flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      ประวัติการสั่งซื้อ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile/history/topup"
                      className="w-full flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      ประวัติการเติมเงิน
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/signup">
                  <Button variant="secondary">
                    <UserPlus className="w-4 h-4" />
                    สมัครสมาชิก
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button>
                    <LogIn className="w-4 h-4" />
                    เข้าสู่ระบบ
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex flex-col justify-between"
              >
                <div>
                  <SheetHeader>
                    <SheetTitle>เมนูทำรายการ</SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      เลือกการกระทำที่ต้องการ
                    </p>
                  </SheetHeader>

                  {isAuthenticated && (
                    <div className="mt-6 space-y-3 px-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {user?.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <Badge className="w-full">
                        <Wallet className="w-3 h-3 mr-1" />
                        {user?.points} เครดิต
                      </Badge>
                    </div>
                  )}

                  <div className="mt-6 space-y-1 px-3">
                    <NavLinks />
                  </div>

                  {isAuthenticated && (
                    <div className="mt-6 space-y-1 px-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        บัญชีของฉัน
                      </div>
                      {isAdmin && (
                        <Link href="/dashboard">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                            จัดการเว็บไซต์
                          </Button>
                        </Link>
                      )}
                      <Link href="/profile">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 cursor-pointer"
                        >
                          <User className="w-4 h-4" />
                          ข้อมูลส่วนตัว
                        </Button>
                      </Link>
                      <Link href="/">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 cursor-pointer"
                        >
                          <Package className="w-4 h-4" />
                          ประวัติการสั่งซื้อ
                        </Button>
                      </Link>
                      <Link href="/profile/history/topup">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2 cursor-pointer"
                        >
                          <Wallet className="w-4 h-4" />
                          ประวัติการเติมเงิน
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                <SheetFooter className="flex flex-col gap-2 ">
                  {isAuthenticated ? (
                    <Button variant="destructive" onClick={logout}>
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </Button>
                  ) : (
                    <>
                      <Link href="/signup">
                        <Button variant="secondary" className="w-full">
                          <UserPlus className="w-4 h-4" />
                          สมัครสมาชิก
                        </Button>
                      </Link>
                      <Link href="/signin">
                        <Button className="w-full">
                          <LogIn className="w-4 h-4" />
                          เข้าสู่ระบบ
                        </Button>
                      </Link>
                    </>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
