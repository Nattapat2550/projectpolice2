import React from 'react';
// อย่าลืมแก้ไข path import ให้ตรงกับโครงสร้างโฟลเดอร์ของคุณ
import LoginForm from '@/components/login/LoginForm'; 

export const metadata = {
    title: 'เข้าสู่ระบบ | My Application',
    description: 'หน้าเข้าสู่ระบบ',
};

export default function LoginPage() {
    return (
        <div className="h-full w-full min-h-screen flex items-center justify-center bg-background overflow-hidden p-4">
            <LoginForm />
        </div>
    );
}