import Link from "next/link";
import { Separator } from "./ui/separator";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold gg">Nexus</h3>
            <p className="text-xs text-muted-foreground">
              ขายแอพพรีเมี่ยม Netflix Rockstar Gtav Fivem รับปลดแบน Fivem Spoofer ราคาถูก
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">บริการของเรา</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/store" className="text-xs text-muted-foreground hover:text-foreground">
                  สินค้าของเรา
                </Link>
              </li>
              <li>
                <Link href="/topup" className="text-xs text-muted-foreground hover:text-foreground">
                  เติมเงิน
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">ฝ่ายสนับสนุน</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-xs text-muted-foreground hover:text-foreground">
                  คำถามที่พบบ่อย
                </Link>
              </li>
              <li>
                <Link href="https://discord.com/" className="text-xs text-muted-foreground hover:text-foreground">
                  ติดต่อเรา
                </Link>
              </li>
              <li>
                <Link href="https://discord.com/" className="text-xs text-muted-foreground hover:text-foreground">
                  แจ้งปัญหา
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">ติดต่อเรา</h4>
            <div className="space-y-2">
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <img src="/logo-discord.png" alt="Discord" className="h-5 w-5" />
                <span>Discord</span>
              </a>
              <p className="text-xs text-muted-foreground">
                ตอบเร็วภายใน 24 ชั่วโมง
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 Nexus All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">
              เงื่อนไขการใช้บริการ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
