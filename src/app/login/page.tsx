"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import Swal from 'sweetalert2'; // 💡 นำเข้า SweetAlert2

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5003';

        try {
            const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict; Secure`;
                
                // 💡 บันทึกข้อมูลลง LocalStorage เพื่อให้หน้าอื่นๆ (เช่น Uploaded.tsx) ดึงไปใช้ได้
                localStorage.setItem("user_id", data.user.id);
                localStorage.setItem("token", data.token); // เซฟ token ไว้เผื่อแนบไปกับ axios ตอนอัพโหลดไฟล์

                // 💡 เพิ่มการแจ้งเตือนเมื่อเข้าสู่ระบบสำเร็จ
                await Swal.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ!',
                    showConfirmButton: false,
                    timer: 1500
                });

                // ใช้ window.location.href เพื่อบังคับโหลดหน้าใหม่ทั้งหมด
                window.location.href = '/';
            } else {
                // 💡 เปลี่ยนจาก alert เป็น Swal
                Swal.fire({
                    icon: 'error',
                    title: 'เข้าสู่ระบบไม่สำเร็จ',
                    text: data.msg || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
                });
                setLoading(false); // ปิดโหลดเมื่อล้มเหลว
            }
        } catch (error) {
            console.error('Error logging in:', error);
            // 💡 เปลี่ยนจาก alert เป็น Swal
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
            });
            setLoading(false); // ปิดโหลดเมื่อมี Error
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center bg-background overflow-hidden p-4">
            
            {/* Card Container */}
            <div className="w-full max-w-md bg-(--container) p-8 rounded-2xl flex flex-col gap-2 border-2 border-(--shadow) transition-all">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-(--header) mb-2">ยินดีต้อนรับ</h1>
                    <p className="text-foreground opacity-70">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <User size={16} /> ชื่อผู้ใช้งาน
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-(--button) border border-(--shadow) text-foreground focus:ring-2 focus:ring-(--header-bg) outline-none transition-all"
                            placeholder="กรอกชื่อผู้ใช้งาน"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Lock size={16} /> รหัสผ่าน
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-(--button) border border-(--shadow) text-foreground focus:ring-2 focus:ring-(--header-bg) outline-none transition-all"
                                placeholder="กรอกรหัสผ่าน"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground opacity-50 hover:opacity-100 transition-opacity"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-(--greenText) transition-all hover:scale-[1.02] active:scale-[0.98]
                            ${loading ? 'bg-(--greyBG) cursor-not-allowed' : 'bg-(--greenBG) border-2 border-(--greenBorder)'}`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-spin"></div>
                                กำลังเข้าสู่ระบบ...
                            </div>
                        ) : (
                            "เข้าสู่ระบบ"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;