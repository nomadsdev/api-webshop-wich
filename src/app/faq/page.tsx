"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <main className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-xl">คำถามที่พบบ่อย</h1>
            <p className="text-muted-foreground text-sm">
              คำตอบสำหรับคำถามที่ลูกค้าสอบถามบ่อยเกี่ยวกับร้านค้าบัญชีพรีเมียมและแอปสตรีมมิ่งของเรา
            </p>
          </div>

          {/* FAQ Content */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {/* General Questions */}
              <AccordionItem value="item-1">
                <AccordionTrigger>ร้านค้าขายอะไรบ้าง?</AccordionTrigger>
                <AccordionContent>
                  เราเป็นร้านค้าดิจิทัลที่จำหน่ายบัญชีพรีเมียมและแอปพลิเคชันสตรีมมิ่ง:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>Netflix Premium</li>
                    <li>YouTube Premium</li>
                    <li>Disney+ Hotstar</li>
                    <li>Spotify Premium</li>
                    <li>บัญชี Discord Nitro</li>
                    <li>บัญชี Rockstar Games</li>
                    <li>บัญชี Gmail พรีเมียม</li>
                    <li>และแอปพรีเมียมอื่นๆ อีกมากมาย</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>บัญชีที่ขายคืออะไร?</AccordionTrigger>
                <AccordionContent>
                  บัญชีที่เราจำหน่ายคือบัญชีพรีเมียมแท้ที่มีคุณสมบัติครบถ้วน:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>บัญชี Netflix รับชม 4K พร้อมดาวน์โหลด</li>
                    <li>YouTube Premium ไม่มีโฆษณา พร้อมเล่นพื้นหลัง</li>
                    <li>Discord Nitro พร้อมอีโมจิพรีเมียมและการสตรีม HD</li>
                    <li>Rockstar Games พร้อมเกม GTA V, Red Dead 2</li>
                    <li>Gmail พรีเมียมพื้นที่เก็บข้อมูล 100GB+</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>ทำไมต้องซื้อจากร้านเรา?</AccordionTrigger>
                <AccordionContent>
                  เราคือตัวเลือกที่ดีที่สุดสำหรับบัญชีพรีเมียม:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>ราคาถูกกว่าบอกรับสมาชิกปกติถึง 80%</li>
                    <li>บัญชีแท้ 100% ไม่ใช่บัญชีทดลอง</li>
                    <li>รับประกันความพึงพอใจ 7 วัน</li>
                    <li>อัปเดตบัญชีฟรีตลอดชีพ</li>
                    <li>บริการลูกค้า 24/7</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Account Questions */}
              <AccordionItem value="item-4">
                <AccordionTrigger>จะสั่งซื้อได้อย่างไร?</AccordionTrigger>
                <AccordionContent>
                  การสั่งซื้อง่ายมากเพียงไม่กี่ขั้นตอน:
                  <ol className="list-decimal list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>เลือกแพ็กเกจที่ต้องการ</li>
                    <li>กรอกข้อมูลการติดต่อ (ชื่อ, อีเมล, LINE ID)</li>
                    <li>เลือกช่องทางการชำระเงิน</li>
                    <li>ชำระเงินตามจำนวนที่แสดง</li>
                    <li>รับข้อมูลบัญชีทันทีหลังชำระเงิน</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>ราคาเท่าไหร่?</AccordionTrigger>
                <AccordionContent>
                  เรามีราคาที่ยุติธรรมและคุ้มค่า:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>Netflix Premium: เริ่มต้นที่ 99 บาท/เดือน (ปกติ 419 บาท)</li>
                    <li>YouTube Premium: เริ่มต้นที่ 59 บาท/เดือน (ปกติ 129 บาท)</li>
                    <li>Discord Nitro: เริ่มต้นที่ 89 บาท/เดือน (ปกติ 199 บาท)</li>
                    <li>Spotify Premium: เริ่มต้นที่ 69 บาท/เดือน (ปกติ 135 บาท)</li>
                    <li>แพ็กเกจรวม: ลดเพิ่ม 20% เมื่อซื้อ 3 บัญชีขึ้นไป</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>ชำระเงินอย่างไร?</AccordionTrigger>
                <AccordionContent>
                  รองรับช่องทางชำระเงินที่สะดวกที่สุด:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>โอนเงินผ่านธนาคาร (QR PromptPay)</li>
                    <li>บัตรเครดิต/เดบิตทุกประเภท</li>
                    <li>พร้อมเพย์</li>
                    <li>TrueMoney Wallet</li>
                    <li>กระเป๋าเงินอื่นๆ (ShopeePay, GrabPay)</li>
                  </ul>
                  รับบัญชีทันทีหลังการชำระเงินสำเร็จ
                </AccordionContent>
              </AccordionItem>

              {/* Technical Questions */}
              <AccordionItem value="item-7">
                <AccordionTrigger>บัญชีใช้ได้นานแค่ไหน?</AccordionTrigger>
                <AccordionContent>
                  ระยะเวลาการใช้งานบัญชี:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>บัญชีรายเดือน: 30 วัน</li>
                    <li>บัญชีรายปี: 365 วัน (ลด 30%)</li>
                    <li>บัญชีถาวร: ใช้ได้ตลอดชีพ</li>
                    <li>สามารถต่ออายุก่อนหมดอายุได้</li>
                    <li>แจ้งเตือนก่อนหมดอายุ 3 วัน</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>ถ้าไม่ได้รับบัญชีทำอย่างไร?</AccordionTrigger>
                <AccordionContent>
                  หากไม่ได้รับข้อมูลบัญชีภายใน 5 นาที:
                  <ol className="list-decimal list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>ตรวจสอบอีเมลในโฟลเดอร์ Inbox/Spam</li>
                    <li>ตรวจสอบว่าชำระเงินสำเร็จแล้ว</li>
                    <li>ตรวจสอบว่าอีเมลที่ให้ถูกต้อง</li>
                    <li>ติดต่อแอดมินผ่าน LINE/Discord</li>
                    <li>แจ้งหมายเลขการสั่งซื้อเพื่อตรวจสอบ</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger>บัญชีใช้ได้กี่อุปกรณ์?</AccordionTrigger>
                <AccordionContent>
                  จำนวนอุปกรณ์ที่สามารถใช้งานได้:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>Netflix: 4 อุปกรณ์พร้อมกัน (รับชม 4K)</li>
                    <li>YouTube Premium: ไม่จำกัดอุปกรณ์</li>
                    <li>Discord Nitro: ไม่จำกัดอุปกรณ์</li>
                    <li>Spotify: 1 อุปกรณ์ (Premium)</li>
                    <li>Gmail: ไม่จำกัดอุปกรณ์</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Security Questions */}
              <AccordionItem value="item-10">
                <AccordionTrigger>บัญชีปลอดภัยหรือไม่?</AccordionTrigger>
                <AccordionContent>
                  ใช่ เราให้ความสำคัญกับความปลอดภัยสูงสุด:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>บัญชีแท้ 100% ไม่ใช่บัญชีล็อค</li>
                    <li>รับประกันไม่โดนแบน 7 วัน</li>
                    <li>มีระบบสำรองบัญชีสำหรับกรณีฉุกเฉิน</li>
                    <li>ทีมงานดูแล 24/7</li>
                    <li>อัปเดตบัญชีฟรีตลอดชีพ</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11">
                <AccordionTrigger>ข้อมูลส่วนตัวปลอดภัยหรือไม่?</AccordionTrigger>
                <AccordionContent>
                  ใช่ เราปกป้องข้อมูลคุณอย่างเข้มงวด:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>ไม่เปิดเผยข้อมูลให้บุคคลที่สาม</li>
                    <li>ใช้ระบบเข้ารหัส SSL</li>
                    <li>ปฏิบัติตาม PDPA</li>
                    <li>ลบข้อมูลอัตโนมัติหลัง 1 ปี</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13">
                <AccordionTrigger>มีบริการทดลองใช้ไหม?</AccordionTrigger>
                <AccordionContent>
                  ใช่ เรามีบริการทดลองใช้:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>ทดลองใช้ฟรี 3 วันสำหรับลูกค้าใหม่</li>
                    <li>ไม่ต้องใช้บัตรเครดิต</li>
                    <li>ทดลองได้ทุกฟีเจอร์ของบัญชี</li>
                    <li>สั่งซื้อแพ็กเกจจริงหลังทดลองได้ทันที</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-14">
                <AccordionTrigger>สามารถคืนเงินได้ไหม?</AccordionTrigger>
                <AccordionContent>
                  ได้ เรามีนโยบายคืนเงินที่ยุติธรรม:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>คืนเงินเต็มจำนวนภายใน 7 วัน</li>
                    <li>กรณีบัญชีใช้ไม่ได้หรือมีปัญหา</li>
                    <li>ไม่มีค่าธรรมเนียมในการคืนเงิน</li>
                    <li>ดำเนินการภายใน 24 ชั่วโมง</li>
                    <li>ต้องมีหลักฐานการชำระเงิน</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-15">
                <AccordionTrigger>มีโปรโมชั่นอะไรบ้าง?</AccordionTrigger>
                <AccordionContent>
                  เรามีโปรโมชั่นและส่วนลดตลอดเวลา:
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1 text-sm">
                    <li>ลด 20% เมื่อซื้อ 3 บัญชีขึ้นไป</li>
                    <li>ลด 30% สำหรับแพ็กเกจรายปี</li>
                    <li>สมาชิกใหม่รับส่วนลด 50% ครั้งแรก</li>
                    <li>โปรแนะนำเพื่อนรับ 10% ทั้งสองฝ่าย</li>
                    <li>Flash Sale ทุกเสาร์-อาทิตย์</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact Section */}
          <div className="text-center space-y-1 pt-5">
            <h2 className="text-base">ยังมีคำถามอีกไหม?</h2>
            <p className="text-muted-foreground text-sm">
              หากคุณยังมีคำถามหรือต้องการคำแนะนำเพิ่มเติม
              อย่าลังเลที่จะติดต่อแอดมินของเรา
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
