"use client";

import DetailsDisplayer from "@/components/Details/DetailsDisplayer";
import DetailsPanel from "@/components/Details/DetailsPanel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TaskStatus = "following" | "problem" | "completed";

export default function TaskPage() {
    const { id } = useParams();
    const router = useRouter();
    const [taskData, setTaskData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";

    const fetchTask = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            if (data.success) {
                setTaskData(data.data);
            }
        } catch (error) {
            console.error("Error fetching task:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchTask();
    }, [id]);

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await fetch(`${backendUrl}/api/v1/tasks/${taskId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            setTaskData((prev: any) => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleUpdateTask = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: taskData.name,
                    date: taskData.date,
                    notes: taskData.notes,
                    assignments: taskData.assignments,
                    isUrgent: taskData.isUrgent // เพิ่มการส่งค่าความเร่งด่วนไปยัง Backend
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert("แก้ไขข้อมูลสำเร็จ");
                setIsEditing(false);
                fetchTask(); // ดึงข้อมูลล่าสุดมาอัปเดตหน้าจออีกครั้ง
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDeleteTask = async () => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?")) return;
        try {
            const res = await fetch(`${backendUrl}/api/v1/tasks/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                alert("ลบงานสำเร็จ");
                router.push("/"); 
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    if (loading) return <div className="p-16 text-center text-xl" style={{color:"var(--header)"}}>กำลังโหลดข้อมูล...</div>;
    if (!taskData) return <div className="p-16 text-center text-xl text-red-500">ไม่พบข้อมูลงาน</div>;

    return (
        <div className="flex flex-col w-full min-h-screen p-6 md:p-16 pt-8 gap-12 overflow-x-hidden">
            <h1
                style={{
                    color: "var(--header)",
                    fontWeight: "bold",
                    fontSize: "2.5rem",
                }}
            >
                รายละเอียดการติดตาม
            </h1>
            
            <div className="flex flex-col xl:flex-row justify-between gap-12 items-stretch">
                <div className="flex flex-1 w-full">
                    <DetailsDisplayer 
                        taskData={taskData} 
                        setTaskData={setTaskData} 
                        isEditing={isEditing} 
                    />
                </div>
                    
                <div className="flex flex-1 w-full">
                    <DetailsPanel 
                        taskData={taskData}
                        setTaskData={setTaskData}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        onStatusChange={handleStatusChange}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                    />
                </div>
            </div>
        </div>
    );
}