"use client";

import { useState, useEffect } from "react";
import TaskDisplayer from "./TaskDisplayer";
import styles from "./TaskDisplayer.module.css";

type TaskStatus = "following" | "problem" | "completed";

export default function UrgentTask() {
    const initialTaskData = [
        { id: "0", name: "ชื่องานด่วนมาก", personInCharge: "นี้เป็นขอมูลทดสอบ", date: "2026-05-21", status: "following" },
    ];

    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("all");
    const [personFilter, setPersonFilter] = useState("all");

    useEffect(() => {
        const fetchUrgentTasks = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
                const response = await fetch(`${backendUrl}/api/v1/tasks/urgent`);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) setTasks(data);
                    else setTasks(initialTaskData);
                } else {
                    setTasks(initialTaskData);
                }
            } catch (error) {
                setTasks(initialTaskData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUrgentTasks();
    }, []);

    const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
            const response = await fetch(`${backendUrl}/api/v1/tasks/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error("Failed to update status in database");

            setTasks((prevTasks) =>
                prevTasks.map((task) => task.id === id ? { ...task, status: newStatus } : task)
            );
        } catch (error) {
            console.error("Failed to update task", error);
            alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตสถานะได้");
        }
    };

    // 💡 แก้ไข 1: แยกชื่อที่ติดกันด้วยลูกน้ำออก เพื่อให้ Dropdown แสดงเป็นรายบุคคล
    const allPersons = tasks.flatMap(t => {
        if (!t.personInCharge) return [];
        return t.personInCharge.split(',').map((s: string) => s.trim()).filter(Boolean);
    });
    const uniquePersons = Array.from(new Set(allPersons));

    const filteredTasks = tasks.filter((task) => {
        if (task.status === "completed") return false; // กรองงานที่ completed ออกก่อน
        const matchStatus = statusFilter === "all" || task.status === statusFilter;
        
        // 💡 แก้ไข 3: ถ้างานนี้มอบหมายให้ "ทุกหน่วยงาน" ทุกคนจะต้องมองเห็นแม้อยู่ใน Filter ตัวเอง
        const matchPerson =
            personFilter === "all" ||
            (task.personInCharge && task.personInCharge.includes("ทุกหน่วยงาน")) ||
            (task.personInCharge && task.personInCharge.split(',').map((s: string) => s.trim()).includes(personFilter));

        return matchStatus && matchPerson;
    }).sort((a, b) => {
        // 💡 แก้ไข 2: จัดเรียงงานที่ completed ไปไว้ท้ายสุด และเรียงตามวันที่ใกล้กำหนดส่ง
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
    });

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-75">
            <h1 className={styles.Header}>งานติดตามเร่งด่วน</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        {/* Group 1: สถานะ */}
                        <div className={styles.FilterGroup}>
                            <strong>สถานะ:</strong>
                            <select 
                                className={styles.Dropdown}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label="ตัวกรองสถานะงาน"
                                style={{ minHeight: '44px' }}
                            >
                                <option value="all">ทั้งหมด</option>
                                <option value="following">กำลังติดตาม</option>
                                <option value="problem">เกิดปัญหา</option>
                                <option value="completed">เสร็จสิ้น</option>
                            </select>
                        </div>

                        {/* Group 2: สำหรับ */}
                        <div className={styles.FilterGroup}>
                            <strong>สำหรับ:</strong>
                            <select 
                                className={styles.Dropdown}
                                value={personFilter}
                                onChange={(e) => setPersonFilter(e.target.value)}
                                aria-label="ตัวกรองผู้รับผิดชอบ"
                                style={{ minHeight: '44px' }}
                            >
                                <option value="all">ทุกคน</option>
                                {uniquePersons.map((person: any, idx) => (
                                    <option key={idx} value={person}>{person}</option>
                                ))}
                            </select>
                        </div>
                    
                    </div>
                    <hr className={styles.Line}></hr>
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full text-gray-500 font-bold" style={{ minHeight: '500px' }}>
                            กำลังโหลดข้อมูล...
                        </div>
                    ) : (
                        <TaskDisplayer tasks={filteredTasks} onStatusChange={handleStatusChange} />
                    )}
                </div>
            </div>
        </div>
    );
}