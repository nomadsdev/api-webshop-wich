"use client";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-xl">นโยบายความเป็นส่วนตัว</h1>
            <p className="text-muted-foreground text-sm">
              ปรับปรุงล่าสุด: 10 มีนาคม 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. ข้อมูลที่เราเก็บรวบรวม</h2>
              <p className="text-muted-foreground">
                เราเก็บรวบรวมข้อมูลส่วนบุคคลที่จำเป็นสำหรับการให้บริการบัญชีพรีเมียมของเรา ซึ่งรวมถึง:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>ชื่อผู้ใช้งานและข้อมูลการติดต่อ (ชื่อ, อีเมล, LINE ID)</li>
                <li>ข้อมูลการชำระเงินและธุรกรรมทางการเงิน</li>
                <li>ประวัติการสั่งซื้อและการใช้งานบัญชี</li>
                <li>ข้อมูลทางเทคนิคเช่น IP Address และข้อมูลการเข้าใช้งาน</li>
                <li>ข้อมูลการสื่อสารกับทีมสนับสนุน</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. การใช้ข้อมูล</h2>
              <p className="text-muted-foreground">
                เราใช้ข้อมูลของคุณเพื่อ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>จัดหาและปรับปรุงบริการบัญชีพรีเมียม</li>
                <li>ดำเนินการตามการสั่งซื้อและการชำระเงิน</li>
                <li>สื่อสารกับคุณเกี่ยวกับบริการและการสั่งซื้อ</li>
                <li>วิเคราะห์และปรับปรุงประสิทธิภาพบริการ</li>
                <li>ปฏิบัติตามกฎหมายและข้อบังคับ</li>
                <li>รับประกันความปลอดภัยของบัญชีที่ขาย</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. การเก็บรักษาข้อมูล</h2>
              <p className="text-muted-foreground">
                เราเก็บรักษาข้อมูลของคุณตามระยะเวลาที่จำเป็นเพื่อ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>จัดหาบริการตามที่คุณร้องขอ</li>
                <li>ปฏิบัติตามข้อกำหนดทางกฎหมาย</li>
                <li>แก้ไขข้อพิพาทที่อาจเกิดขึ้น</li>
                <li>ดำเนินธุรกิจที่ถูกต้องตามกฎหมาย</li>
              </ul>
              <p className="text-muted-foreground">
                ข้อมูลลูกค้าจะถูกเก็บรักษาตราบเท่าที่ยังมีการใช้บริการอยู่
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. การแชร์ข้อมูล</h2>
              <p className="text-muted-foreground">
                เราไม่ขายหรือเช่าข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม เราจะแชร์ข้อมูลเฉพาะในกรณี:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>ได้รับความยินยอมจากคุณโดยชัดแจ้ง</li>
                <li>จำเป็นสำหรับการให้บริการ (เช่น ผู้ให้บริการโทรคมนาคม)</li>
                <li>ปฏิบัติตามกฎหมายหรือคำสั่งศาล</li>
                <li>ป้องกันการฉ้อโกงหรือความปลอดภัย</li>
                <li>การโอนธุรกิจ (พร้อมเงื่อนไขความปลอดภัย)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. ความปลอดภัยข้อมูล</h2>
              <p className="text-muted-foreground">
                เราใช้มาตรการรักษาความปลอดภัยหลายระดับเพื่อปกป้องข้อมูลของคุณ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>การเข้ารหัสข้อมูลแบบ end-to-end</li>
                <li>การควบคุมการเข้าถึงแบบ restricted access</li>
                <li>การสำรองข้อมูลอย่างสม่ำเสมอ</li>
                <li>การตรวจสอบความปลอดภัยอย่างต่อเนื่อง</li>
                <li>การฝึกอบรมพนักงานเรื่องความเป็นส่วนตัว</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. สิทธิของผู้ใช้</h2>
              <p className="text-muted-foreground">
                คุณมีสิทธิต่อไปนี้เกี่ยวกับข้อมูลของคุณ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>เข้าถึงและตรวจสอบข้อมูลส่วนบุคคล</li>
                <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                <li>ขอลบข้อมูลส่วนบุคคล</li>
                <li>จำกัดการประมวลผลข้อมูล</li>
                <li>โอนย้ายข้อมูลไปยังผู้ให้บริการอื่น</li>
                <li>ยกเลิกความยินยอม</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. คุกกี้และเทคโนโลยีการติดตาม</h2>
              <p className="text-muted-foreground">
                เราใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>จดจำการตั้งค่าและการตั้งค่า</li>
                <li>วิเคราะห์การใช้งานเว็บไซต์</li>
                <li>ปรับปรุงประสบการณ์ผู้ใช้</li>
                <li>รักษาความปลอดภัยบัญชี</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">8. การเปลี่ยนแปลงนโยบาย</h2>
              <p className="text-muted-foreground">
                เราอาจปรับปรุงนโยบายความเป็นส่วนตัวเป็นระยะๆ การเปลี่ยนแปลงที่สำคัญจะแจ้งให้คุณทราบล่วงหน้าผ่าน:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>อีเมลแจ้งเตือน</li>
                <li>ประกาศบนเว็บไซต์</li>
                <li>การแจ้งเตือนในแอปพลิเคชัน</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
