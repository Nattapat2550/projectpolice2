"use client";

import { useState, useEffect } from "react";

export default function BackendWakeupLoader({ children }: { children: React.ReactNode }) {
    const [isAwake, setIsAwake] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        // หน่วงเวลา 800ms ก่อนโชว์หน้า Load เพื่อป้องกันหน้ากระพริบหากเซิร์ฟเวอร์พร้อมอยู่แล้ว
        const timer = setTimeout(() => {
            if (isMounted) setShowLoader(true);
        }, 800);

        const pingBackend = async () => {
            if (!isMounted) return;
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
            
            try {
                // ยิง Request ไปที่ Root (/) ที่เราสร้างไว้ใน Backend
                const res = await fetch(`${backendUrl}/`, { 
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                
                if (res.ok) {
                    if (isMounted) setIsAwake(true);
                } else {
                    // ถ้าตอบกลับแปลกๆ ให้ลองปิงใหม่ในอีก 3 วินาที
                    if (isMounted) setTimeout(pingBackend, 3000);
                }
            } catch (error) {
                // ถ้า Network Error (เซิร์ฟเวอร์ยังไม่เปิด) ให้ปิงซ้ำในอีก 3 วินาที
                if (isMounted) setTimeout(pingBackend, 3000);
            }
        };

        pingBackend();

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []);

    // ถ้าเซิร์ฟเวอร์พร้อมแล้ว ให้แสดงหน้าเว็บปกติ
    if (isAwake) {
        return <>{children}</>;
    }

    // ช่วงเสี้ยววินาทีแรก (800ms) ไม่ต้องแสดงอะไร เพื่อให้เว็บดูโหลดเร็วถ้าเซิร์ฟเวอร์ไม่ได้หลับ
    if (!showLoader) {
        return null;
    }

    // หน้าจอโหลดขณะรอเซิร์ฟเวอร์ Render ตื่น
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[70vh] bg-background text-foreground">
            <div className="w-16 h-16 border-4 border-(--shadow) border-t-[#3F1818] rounded-full animate-spin mb-6"></div>
            
            <h2 className="text-2xl font-bold mb-2 text-black">กำลังเชื่อมต่อฐานข้อมูล... 🚀</h2>
            
            <p className="text-(--foreground)/60 text-center max-w-lg px-4 text-sm leading-relaxed">
                เนื่องจากระบบ Backend อยู่ในโหมดพักการทำงานเพื่อประหยัดพลังงาน <br className="hidden sm:block" />
                <strong>การเปิดระบบครั้งแรกอาจใช้เวลาประมาณ 30 - 50 วินาที </strong> <br />
                กรุณารอสักครู่ ระบบกำลังดึงข้อมูลงานล่าสุดให้คุณครับ...
            </p>
        </div>
    );
}