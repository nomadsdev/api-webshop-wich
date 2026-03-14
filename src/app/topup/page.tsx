"use client";

import React, { useState } from "react";
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
import { Upload, QrCode, Banknote, Gift } from "lucide-react";
import { toast } from "sonner";
import QrScanner from "qr-scanner";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export default function page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTrueMoneyDialogOpen, setIsTrueMoneyDialogOpen] = useState(false);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [giftLink, setGiftLink] = useState("");
  const [isVerifyingGift, setIsVerifyingGift] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isRedeemingCoupon, setIsRedeemingCoupon] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const phoneNumber = "0987654321";

  const handleGenerateQR = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }
    setQrCodeUrl(`https://promptpay.io/${phoneNumber}/${amount}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`เลือกไฟล์ ${file.name} แล้ว`);
    }
  };

  const handleSubmitSlip = async () => {
    if (!selectedFile) {
      toast.error("กรุณาอัพโหลดสลิปการโอนเงิน");
      return;
    }
    if (!amount) {
      toast.error("กรุณากรอกจำนวนเงิน");
      return;
    }
    if (!isAuthenticated || !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    setIsVerifying(true);
    try {
      // Convert image to base64 for QR code reading
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;

        try {
          // Read QR code from image
          const qrCodeData = await readQRCode(imageData);

          if (!qrCodeData) {
            toast.error("ไม่สามารถอ่าน QR Code จากรูปภาพได้");
            setIsVerifying(false);
            return;
          }

          // Send QR code to server for verification
          const response = await api.post("/topup/verifyslip/verify-slip", {
            qrcode: qrCodeData,
          });

          const result = response.data;

          if (result.status === "success") {
            toast.success(`ตรวจสอบสลิปสำเร็จ! เติมเงิน ${amount} บาท`);
            // Reset form on success
            setAmount("");
            setQrCodeUrl("");
            setSelectedFile(null);
            setIsDialogOpen(false);
          } else {
            // Show specific server error message
            const errorMessage = result.message || result.msg || "ตรวจสอบสลิปไม่สำเร็จ";
            toast.error(errorMessage);
            
            // Log error code for debugging
            if (result.error_code) {
              console.error("Slip verification error code:", result.error_code);
            }
          }
        } catch (error: any) {
          console.error("Error processing slip:", error);
          
          // Show specific error message from server if available
          if (error.response?.data) {
            const errorData = error.response.data;
            const errorMessage = errorData.message || errorData.msg || "เกิดข้อผิดพลาดในการตรวจสอบสลิป";
            toast.error(errorMessage);
            
            // Log error code for debugging
            if (errorData.error_code) {
              console.error("Slip verification error code:", errorData.error_code);
            }
          } else {
            toast.error("เกิดข้อผิดพลาดในการตรวจสอบสลิป");
          }
        } finally {
          setIsVerifying(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error submitting slip:", error);
      toast.error("เกิดข้อผิดพลาดในการส่งสลิป");
      setIsVerifying(false);
    }
  };

  const handleSubmitCoupon = async () => {
    if (!couponCode) {
      toast.error("กรุณาระบุโค้ดคูปอง");
      return;
    }
    if (!isAuthenticated || !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    setIsRedeemingCoupon(true);
    try {
      const response = await api.post("/topup/coupon/redeem", {
        code: couponCode.trim(),
      });

      const result = response.data;

      if (result.status === "success") {
        toast.success(result.message || "ใช้คูปองสำเร็จ!");
        setCouponCode("");
        setIsCouponDialogOpen(false);
      } else {
        const errorMessage = result.message || "ใช้คูปองไม่สำเร็จ";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error redeeming coupon:", error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || "เกิดข้อผิดพลาดในการใช้คูปอง";
        toast.error(errorMessage);
      } else {
        toast.error("เกิดข้อผิดพลาดในการใช้คูปอง");
      }
    } finally {
      setIsRedeemingCoupon(false);
    }
  };

  const handleSubmitTrueMoneyGift = async () => {
    if (!giftLink) {
      toast.error("กรุณาวางลิงก์ซองของขวัญ");
      return;
    }
    if (!isAuthenticated || !token) {
      toast.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    setIsVerifyingGift(true);
    try {
      const response = await api.post("/topup/truemoney/verify-gift", {
        gift_link: giftLink.trim(),
      });

      const result = response.data;

      if (result.status === "success") {
        toast.success(result.message || "รับซองของขวัญสำเร็จ!");
        setGiftLink("");
        setIsTrueMoneyDialogOpen(false);
      } else {
        // Show specific server error message
        const errorMessage = result.message || "รับซองของขวัญไม่สำเร็จ";
        toast.error(errorMessage);
        
        // Log error code for debugging
        if (result.error_code) {
          console.error("TrueMoney gift error code:", result.error_code);
        }
      }
    } catch (error: any) {
      console.error("Error verifying TrueMoney gift:", error);
      
      // Show specific error message from server if available
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || "เกิดข้อผิดพลาดในการรับซองของขวัญ";
        toast.error(errorMessage);
        
        // Log error code for debugging
        if (errorData.error_code) {
          console.error("TrueMoney gift error code:", errorData.error_code);
        }
      } else {
        toast.error("เกิดข้อผิดพลาดในการรับซองของขวัญ");
      }
    } finally {
      setIsVerifyingGift(false);
    }
  };

  // Function to read QR code from image
  const readQRCode = async (imageData: string): Promise<string | null> => {
    try {
      // Convert data URL to File object
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], selectedFile?.name || "slip.jpg", {
        type: "image/jpeg",
      });

      // Scan QR code from the image file
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });

      return result.data;
    } catch (error) {
      console.error("QR Scanner error:", error);
      // If QR scanning fails, return the base64 data as fallback
      // This allows the server to process the image directly
      return imageData.split(",")[1];
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen">
        <section className="flex justify-center px-3 py-5">
          <div className="w-full max-w-sm">
            <div className="text-center">
              <h1 className="text-xl">เลือกช่องทางในการเติมเงิน</h1>
              <p className="text-muted-foreground text-sm">
                เติมเงินเพื่อใช้บริการภายในเว็บไซต์
              </p>
            </div>
            <div className="space-y-3 pt-5">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <div className="border rounded-lg overflow-hidden relative group p-3 dark:bg-zinc-900/50 h-[100px] bg-zinc-50 cursor-pointer hover:scale-95 transition-all">
                    <div>
                      <h3 className="text-lg">โอนผ่านธนาคาร</h3>
                      <p className="text-xs text-muted-foreground">
                        Transfer via Bank
                      </p>
                    </div>
                    <div className="absolute -bottom-1 -right-1 group-hover:scale-105 group-hover:-rotate-6 transition-all">
                      <img
                        src="/icon-promptpay.png"
                        alt="icon truemnoey gift"
                        className="w-[60px]"
                      />
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 text-xs left-2"
                    >
                      ยอดนิยม
                    </Badge>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>เติมเงินผ่านธนาคาร</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!qrCodeUrl ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="กรอกจำนวนเงิน"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={handleGenerateQR}
                          className="w-full cursor-pointer"
                          disabled={!amount}
                        >
                          <QrCode className="w-4 h-4" />
                          สร้าง QR Code
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            สแกน QR Code เพื่อโอนเงิน
                          </p>
                          <div className="flex justify-center">
                            <img
                              src={qrCodeUrl}
                              alt="PromptPay QR Code"
                              className="w-48 h-48 border rounded-lg"
                            />
                          </div>
                          <p className="text-lg font-medium">
                            จำนวน{" "}
                            <span className="font-semibold gg">{amount}</span>{" "}
                            บาท
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="slip">อัพโหลดสลิปการโอนเงิน</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="slip"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="flex-1"
                            />
                            <Upload className="w-4 h-4 text-muted-foreground" />
                          </div>
                          {selectedFile && (
                            <p className="text-xs text-green-600">
                              ไฟล์ที่เลือก: {selectedFile.name}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setQrCodeUrl("");
                              setSelectedFile(null);
                            }}
                            className="flex-1"
                          >
                            ย้อนกลับ
                          </Button>
                          <Button
                            onClick={handleSubmitSlip}
                            className="flex-1"
                            disabled={!selectedFile || isVerifying}
                          >
                            {isVerifying ? (
                              <>
                                <Spinner />
                                กำลังตรวจสอบ...
                              </>
                            ) : (
                              "ส่งสลิป"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isTrueMoneyDialogOpen}
                onOpenChange={setIsTrueMoneyDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="border relative group overflow-hidden rounded-lg p-3 dark:bg-zinc-900/50 h-[100px] bg-zinc-50 cursor-pointer hover:scale-95 transition-all">
                    <div>
                      <h3 className="text-lg">อั่งเปาทรูมันนี่</h3>
                      <p className="text-xs text-muted-foreground">
                        Transfer via TrueMoney
                      </p>
                    </div>
                    <div className="absolute -bottom-5 -right-5 group-hover:scale-105 group-hover:-rotate-6 transition-all">
                      <img
                        src="/icon-trm-gift.png"
                        alt="icon truemnoey gift"
                        className="w-[100px]"
                      />
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 text-xs left-2"
                    >
                      ยอดนิยม
                    </Badge>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>รับซองของขวัญทรูมันนี่</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gift_link">ลิงก์ซองของขวัญ</Label>
                      <Input
                        id="gift_link"
                        type="text"
                        placeholder="วางลิงก์ซองของขวัญทรูมันนี่"
                        value={giftLink}
                        onChange={(e) => setGiftLink(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        ตัวอย่าง: https://gift.truemoney.com/...
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGiftLink("");
                        }}
                        className="flex-1"
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        onClick={handleSubmitTrueMoneyGift}
                        className="flex-1"
                        disabled={!giftLink || isVerifyingGift}
                      >
                        {isVerifyingGift ? (
                          <>
                            <Spinner />
                            กำลังตรวจสอบ...
                          </>
                        ) : (
                          "รับซองของขวัญ"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isCouponDialogOpen}
                onOpenChange={setIsCouponDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="border relative group overflow-hidden rounded-lg p-3 dark:bg-zinc-900/50 h-[100px] bg-zinc-50 cursor-pointer hover:scale-95 transition-all">
                    <div>
                      <h3 className="text-lg">คูปองเติมเงิน</h3>
                      <p className="text-xs text-muted-foreground">
                        Top-up Coupon
                      </p>
                    </div>
                    <div className="absolute -bottom-5 -right-5 group-hover:scale-105 group-hover:-rotate-6 transition-all">
                      <Gift className="w-[80px] h-[80px] text-muted-foreground" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute bottom-2 text-xs left-2"
                    >
                      พิเศษ
                    </Badge>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>ใช้คูปองเติมเงิน</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coupon_code">โค้ดคูปอง</Label>
                      <Input
                        id="coupon_code"
                        type="text"
                        placeholder="กรอกโค้ดคูปอง"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        กรอกโค้ดคูปองที่คุณได้รับ
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCouponCode("");
                        }}
                        className="flex-1"
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        onClick={handleSubmitCoupon}
                        className="flex-1"
                        disabled={!couponCode || isRedeemingCoupon}
                      >
                        {isRedeemingCoupon ? (
                          <>
                            <Spinner />
                            กำลังใช้คูปอง...
                          </>
                        ) : (
                          "ใช้คูปอง"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
