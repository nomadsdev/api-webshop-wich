"use client";

export default function TermsOfService() {
  return (
    <main className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-xl">เงื่อนไขการใช้บริการ</h1>
            <p className="text-muted-foreground text-sm">
              ปรับปรุงล่าสุด 10 มีนาคม 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-sm">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. การยอมรับเงื่อนไข</h2>
              <p className="text-muted-foreground">
                การเข้าใช้บริการบัญชีพรีเมียมและแอปสตรีมมิ่งของเราถือว่าคุณได้อ่าน เข้าใจ และยอมรับเงื่อนไขการใช้บริการเหล่านี้
                หากคุณไม่ยอมรับเงื่อนไขเหล่านี้ กรุณาหยุดการใช้บริการของเราทันที
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. คำอธิบายบริการ</h2>
              <p className="text-muted-foreground">
                บริการบัญชีพรีเมียมและแอปสตรีมมิ่งของเราเป็นบริการจำหน่ายบัญชีดิจิทัลที่ถูกกฎหมาย
                ซึ่งออกแบบมาเพื่อ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>จัดหาบัญชีพรีเมียมในราคาที่เข้าถึงได้</li>
                <li>ให้บริการบัญชี Netflix, YouTube, Discord และอื่นๆ</li>
                <li>รับประกันคุณภาพและความปลอดภัยของบัญชี</li>
                <li>บริการลูกค้าที่รวดเร็วและมีประสิทธิภาพ</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. การสมัครและบัญชีผู้ใช้</h2>
              <p className="text-muted-foreground">
                การสั่งซื้อบริการของเรา คุณต้อง:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>มีอายุอย่างน้อย 18 ปีบริบูรณ์</li>
                <li>ให้ข้อมูลที่ถูกต้องและเป็นปัจจุบัน</li>
                <li>มีช่องทางการชำระเงินที่ถูกต้อง</li>
                <li>รับผิดชอบต่อการใช้งานบัญชีที่ซื้อ</li>
                <li>ไม่นำบัญชีไปใช้ในทางที่ผิดกฎหมาย</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. ค่าธรรมเนียมและการชำระเงิน</h2>
              <p className="text-muted-foreground">
                บริการบัญชีพรีเมียมของเรามีโครงสร้างราคาดังนี้:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>ราคาบัญชีตามที่กำหนดในหน้าสินค้า</li>
                <li>แพ็กเกจรวมสำหรับลูกค้าที่ซื้อหลายบัญชี</li>
                <li>การชำระเงินผ่านช่องทางที่เรากำหนด</li>
                <li>คืนเงินภายใน 7 วันหากบัญชีใช้ไม่ได้</li>
                <li>ราคาอาจมีการเปลี่ยนแปลงโดยแจ้งล่วงหน้า 7 วัน</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. พฤติกรรมที่ไม่ได้รับอนุญาต</h2>
              <p className="text-muted-foreground">
                คุณตกลงไม่จะ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>ใช้บัญชีเพื่อกิจกรรมที่ผิดกฎหมาย</li>
                <li>แชร์ข้อมูลบัญชีให้กับผู้อื่นโดยไม่ได้รับอนุญาต</li>
                <li>พยายามแฮกก์ รบกวน หรือทำลายระบบ</li>
                <li>ใช้บัญชีในทางที่เป็นอันตรายหรือทุจริต</li>
                <li>สร้างบัญชีปลอมหรือใช้ข้อมูลปลอมในการสั่งซื้อ</li>
                <li>จำหน่ายหรือโอนสิทธิ์บัญชีที่ซื้อไปโดยไม่ได้รับอนุญาต</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. ความปลอดภัยและความเป็นส่วนตัว</h2>
              <p className="text-muted-foreground">
                เรามุ่งมั่นในการรักษาความปลอดภัยและความเป็นส่วนตัวของข้อมูลคุณ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>ใช้เทคโนโลยีการเข้ารหัสขั้นสูง</li>
                <li>ไม่เก็บข้อมูลบัญชีหลังจากส่งให้ลูกค้าแล้ว</li>
                <li>จำกัดการเข้าถึงข้อมูลเฉพาะผู้ที่ได้รับอนุญาต</li>
                <li>ปฏิบัติตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล</li>
                <li>ตรวจสอบความปลอดภัยของบัญชีอย่างสม่ำเสมอ</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. ข้อจำกัดความรับผิดชอบ</h2>
              <p className="text-muted-foreground">
                ในกรณีที่กฎหมายอนุญาต เราไม่รับผิดชอบต่อ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>ความเสียหายทางตรงหรือทางอ้อม</li>
                <li>การสูญเสียข้อมูลหรือรายได้</li>
                <li>การหยุดชะงักของบริการบัญชี</li>
                <li>การโจมตีทางไซเบอร์จากบุคคลที่สาม</li>
                <li>ความล่าช้าในการส่งบัญชีเนื่องจากปัญหาเครือข่าย</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">8. การยกเลิกบริการ</h2>
              <p className="text-muted-foreground">
                เราหรือคุณสามารถยกเลิกบริการได้ในกรณี:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>คุณสามารถยกเลิกการสั่งซื้อได้ทุกเมื่อ</li>
                <li>เราอาจระงับบัญชีหากพบการละเมิดเงื่อนไข</li>
                <li>เราจะแจ้งให้คุณทราบก่อนระงับบริการ (ยกเว้นกรณีฉุกเฉิน)</li>
                <li>เงินที่ชำระไปจะไม่คืนหลังได้รับบัญชีแล้ว</li>
                <li>ข้อมูลจะถูกลบภายใน 30 วันหลังยกเลิก</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">9. การเปลี่ยนแปลงเงื่อนไข</h2>
              <p className="text-muted-foreground">
                เราสงวนสิทธิในการเปลี่ยนแปลงเงื่อนไขการใช้บริการ:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>การเปลี่ยนแปลงจะมีผลบังคับใช้ตั้งแต่วันที่กำหนด</li>
                <li>จะแจ้งให้คุณทราบล่วงหน้าอย่างน้อย 30 วัน</li>
                <li>การใช้งานต่อเนื่องถือเป็นการยอมรับเงื่อนไขใหม่</li>
                <li>คุณสามารถยกเลิกบริการหากไม่ยอมรับเงื่อนไขใหม่</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">10. กฎหมายที่ใช้บังคับ</h2>
              <p className="text-muted-foreground">
                เงื่อนไขการใช้บริการนี้อยู่ภายใต้กฎหมายของประเทศไทย
                ข้อพิพาทใดๆ จะได้รับการแก้ไขโดยศาลในประเทศไทยเท่านั้น
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">11. การสื่อสาร</h2>
              <p className="text-muted-foreground">
                การสื่อสารทางการทั้งหมดจะดำเนินการผ่าน:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>อีเมลที่ลงทะเบียนไว้ในระบบ</li>
                <li>ประกาศบนเว็บไซต์</li>
                <li>การแจ้งเตือนในระบบ</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
