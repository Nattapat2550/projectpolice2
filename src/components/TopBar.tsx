"use client";

import Link from 'next/link';
import Image from 'next/image';
import DarkModeBtn from './DarkModeBtn';

export default function TopBar() {
    return (
       <div 
        id="main-topbar" 
        className="flex justify-between items-center w-full px-6 py-4 shadow-md z-50 relative"
        style={{ backgroundColor: 'var(--header-bg)' }}
        >
            <Link href="/" aria-label="กลับหน้าหลัก ระบบติดตามงานมอบหมาย">
                <div className="flex items-center gap-4 group">
                    <Image 
                        src="/police.png" 
                        alt="โลโก้ระบบติดตามงานมอบหมาย" 
                        width={40} 
                        height={40} 
                        className="transition-transform group-hover:scale-110" 
                        priority
                        style={{ width: '40px', height: '40px' }}
                    />
                    <strong style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                        ระบบติดตามงานมอบหมาย
                    </strong>
                </div>
            </Link>

            {/* ฝั่งขวา: Dark Mode + ช่วยเหลือ */}
            <div className="flex items-center gap-2">
                <DarkModeBtn />


                <Link href="/help" aria-label="ไปหน้าช่วยเหลือการใช้งาน">
                    <button className="flex items-center gap-2 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors" style={{ minHeight: '44px' }}>
                        <Image 
                            src="/window.svg" 
                            alt="ไอคอนช่วยเหลือ" 
                            width={24} 
                            height={24}
                            priority
                            style={{ width: '24px', height: '24px' }}
                        />
                        <span className="font-medium">ช่วยเหลือ</span>
                    </button>
                </Link>
                </div>
        </div>
    );
}