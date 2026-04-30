import React from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useNavigate } from 'react-router-dom';

const FlipBook = HTMLFlipBook as any;

const Page = React.forwardRef((props: any, ref) => {
  return (
    <div className="bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] h-full w-full overflow-hidden p-8 font-body relative" ref={ref as any}>
      <div className="h-full flex flex-col">
        {props.children}
      </div>
      {props.number && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-400 font-black">
          {props.number}
        </div>
      )}
    </div>
  );
});

export default function ManualEbook() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
      {/* Close Button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-50 backdrop-blur-md"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      <div className="w-full max-w-4xl aspect-[4/3] max-h-[90vh]">
        <FlipBook
          width={400}
          height={600}
          size="stretch"
          minWidth={300}
          maxWidth={500}
          minHeight={400}
          maxHeight={700}
          drawShadow={true}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="mx-auto"
        >
          {/* Page 1: Cover */}
          <Page>
            <div className="h-full bg-gradient-to-br from-primary to-blue-800 text-white p-8 flex flex-col justify-center items-center text-center -mx-8 -my-8 border-r border-slate-900/20">
              <span className="material-symbols-outlined text-7xl mb-6 opacity-80">book</span>
              <h1 className="text-3xl font-black mb-2">Wae Jer Logistic</h1>
              <h2 className="text-lg font-bold text-blue-200 uppercase tracking-widest mb-8">User Operation Manual</h2>
              <div className="w-16 h-1 bg-white/20 rounded-full mb-8"></div>
              <p className="text-sm font-bold opacity-80">คู่มือการใช้งานระบบ</p>
              <p className="text-xs font-bold opacity-60 mt-1">สำหรับ Admin และ Driver</p>
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Version 1.0.0</p>
              </div>
            </div>
          </Page>

          {/* Page 2: Introduction */}
          <Page number={1}>
            <div className="space-y-6 pt-4">
              <h2 className="text-2xl font-black text-slate-800 border-b-2 border-primary/20 pb-4 inline-block">บทนำ (Introduction)</h2>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                คู่มือนี้อธิบายวิธีการใช้งานระบบแบ่งตามบทบาทของผู้ใช้งาน ได้แก่ 
                <span className="text-primary mx-1">ผู้ดูแลระบบ (Admin)</span> 
                และ 
                <span className="text-secondary mx-1">พนักงานขับรถ/เซลส์ (Driver)</span>
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                  ส่วนของผู้ดูแลระบบ
                </h3>
                <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">
                  Web Application สำหรับจัดการและติดตามการทำงานของทีมรถขนส่ง ดูสต็อกสินค้า ติดตาม GPS และตรวจสอบยอดขาย
                </p>
                <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">local_shipping</span>
                  ส่วนของพนักงานขับรถ
                </h3>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  Mobile Web Application ออกแบบมาให้ใช้งานผ่านโทรศัพท์มือถือ เพื่อความสะดวกในการทำงานลงพื้นที่ เข้าใช้งานผ่าน LINE
                </p>
              </div>
            </div>
          </Page>

          {/* Page 3: Admin Part 1 */}
          <Page number={2}>
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                <h2 className="text-xl font-black">คู่มือแอดมิน (Admin) 1/2</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</span>
                    การเข้าสู่ระบบ (Login)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    เปิด Web Browser เข้าไปยัง URL ของระบบสำหรับผู้ดูแล กรอก Username และ Password เพื่อเข้าสู่ Dashboard หลัก
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">2</span>
                    การจัดการสต็อกสินค้า (Inventory)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed mb-2">
                    ตรวจสอบจำนวนสินค้าคงเหลือในคลังสินค้าหลัก (Master Stock)
                  </p>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    <strong className="text-slate-700">เติมของให้รถ (Van Refill):</strong> กดปุ่มทำรายการ เลือกรถเป้าหมาย ระบุจำนวนสินค้า กดยืนยัน ระบบจะทำการหักสต็อกจากคลัง และเพิ่มในรถทันที
                  </p>
                </div>
              </div>
            </div>
          </Page>

          {/* Page 4: Admin Part 2 */}
          <Page number={3}>
             <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                <h2 className="text-xl font-black">คู่มือแอดมิน (Admin) 2/2</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">3</span>
                    การติดตามรถ (Map Overview)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    แสดงแผนที่หมุดพิกัดร้านค้า ติดตามสถานะ (หมุดสีเขียว = เยี่ยมแล้ว) ดูรายละเอียดและยอดขายของร้าน รวมถึงขอดูเส้นทางนำทางได้
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">4</span>
                    ตรวจสอบการสำรวจ (Survey Audit)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    ตรวจสอบความถูกต้องของภาพถ่ายและพิกัด GPS ที่พนักงานส่งมา จากนั้นกด "อนุมัติ" หรือ "ปฏิเสธ"
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">5</span>
                    รายงานยอดขาย (Sales Reports)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    ตรวจสอบยอดขายในแต่ละวัน เปรียบเทียบยอดเงินสด/สลิปโอนเงินที่พนักงานส่งมอบตอนจบวัน เพื่อปิดยอดบัญชี
                  </p>
                </div>
              </div>
            </div>
          </Page>

          {/* Page 5: Driver Part 1 */}
          <Page number={4}>
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 text-secondary mb-6">
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
                <h2 className="text-xl font-black">คู่มือพนักงานขับรถ (Driver) 1/2</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px]">1</span>
                    การเข้าสู่ระบบผ่าน LINE
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    กดลิงก์ที่ Rich Menu ในแชท LINE ระบบจะล็อกอินอัตโนมัติ ไม่ต้องกรอกรหัสผ่าน
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px]">2</span>
                    การเช็คสต็อกบนรถ (Van Stock)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    ตรวจสอบว่ารายการสินค้าในแอป ตรงกับสินค้าจริงบนรถหรือไม่ ก่อนเริ่มงาน
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px]">3</span>
                    ดูแผนที่เดินทาง (Check-In Map)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    ดูพิกัดร้านค้าทั้งหมดที่ต้องไปในวันนี้ และใช้เป็นแผนที่นำทางได้
                  </p>
                </div>
              </div>
            </div>
          </Page>

          {/* Page 6: Driver Part 2 */}
          <Page number={5}>
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 text-secondary mb-6">
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
                <h2 className="text-xl font-black">คู่มือพนักงานขับรถ (Driver) 2/2</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px]">4</span>
                    การเช็คอิน (Check-in & Survey)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    เมื่อถึงร้าน กด "เช็คอิน" ระบบจะดึงพิกัด GPS ถ่ายภาพหน้าร้าน ระบุสถานะ และกดยืนยัน
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px]">5</span>
                    เสนอขายและสั่งซื้อ (Catalog)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    เปิด Catalog เลือกสินค้าและใส่จำนวน (สต็อกจะตัดอัตโนมัติเมื่อยืนยันการขาย)
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px]">6</span>
                    สรุปยอดและจบวัน (Close Day)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 pl-7 leading-relaxed">
                    หน้าประวัติการเยี่ยมร้าน ดูสรุปยอดขาย กด "สรุปยอดขาย (Close Day)" และนำเงินสด/สลิปส่งแอดมิน
                  </p>
                </div>
              </div>
            </div>
          </Page>

          {/* Page 7: Back Cover */}
          <Page>
            <div className="h-full bg-slate-900 text-white p-8 flex flex-col justify-center items-center text-center -mx-8 -my-8 border-l border-slate-700">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <h2 className="text-xl font-black mb-2">Wae Jer Logistic</h2>
              <p className="text-xs font-bold opacity-60 max-w-[200px]">
                Powered by Cashvan Management System
              </p>
            </div>
          </Page>

        </FlipBook>
      </div>
    </div>
  );
}
