"use client";

import { useState, useEffect } from "react";
import TaskDisplayer from "./TaskDisplayer";
import styles from "./TaskDisplayer.module.css";
import PersonMultiSelect from "./PersonMultiSelect";
import StatusMultiSelect from "./StatusMultiSelect"; // 👈 Imported the multi-select component

type TaskStatus = "following" | "problem" | "completed";

export default function UrgentTask() {
    const initialTaskData = [
        { 
            id: "0", 
            name: "ชื่องานด่วนมาก", 
            personInCharge: "ผู้ดูแลระบบ", 
            date: "2026-05-21", 
            status: "following",
            createdAt: new Date().toISOString(),
            assigneesData: [{ name: "ผู้ดูแลระบบ", color: "#fca5a5" }] 
        },
    ];

    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 💡 Changed from string "all" to string[] to support multi-select status filtering
    const [statusFilter, setStatusFilter] = useState<string[]>([]); 
    const [personFilter, setPersonFilter] = useState<string[]>([]); 

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

    useEffect(() => {
        const handleTaskSync = (event: Event) => {
            const customEvent = event as CustomEvent<{ id: string; status: string }>;
            const { id, status } = customEvent.detail;
            setTasks((prevTasks) =>
                prevTasks.map((task) => task.id === id ? { ...task, status } : task)
            );
        };

        window.addEventListener("taskStatusSync", handleTaskSync);
        return () => window.removeEventListener("taskStatusSync", handleTaskSync);
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

            window.dispatchEvent(
                new CustomEvent("taskStatusSync", {
                    detail: { id, status: newStatus },
                })
            );
        } catch (error) {
            console.error("Failed to update task", error);
            alert("เกิดข้อผิดพลาด ไม่สามารถอัปเดตสถานะได้");
        }
    };

    const allPersons = tasks.flatMap(t => {
        if (!t.personInCharge) return [];
        return t.personInCharge.split(',').map((s: string) => s.trim()).filter(Boolean);
    });
    const uniquePersons = Array.from(new Set(allPersons));

    const filteredTasks = tasks.filter((task) => {
        // 💡 Updated to evaluate whether the task's status exists within the filter array
        const matchStatus = statusFilter.length === 0 || statusFilter.includes(task.status);
        
        const taskPersons = task.personInCharge 
            ? task.personInCharge.split(',').map((s: string) => s.trim()) 
            : [];

        const matchPerson =
            personFilter.length === 0 || 
            taskPersons.includes("ทุกหน่วยงาน") ||
            taskPersons.some((p: string) => personFilter.includes(p)); 

        return matchStatus && matchPerson;
    }).sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        
        const parseTaskDate = (dateStr: string) => {
            if (!dateStr) return 0;
            const parts = dateStr.split('-');
            let year = parseInt(parts[0], 10);
            
            if (year > 2400) {
                year = year - 543;
            }
            
            const normalizedDateStr = `${year}-${parts[1]}-${parts[2]}`;
            const time = new Date(normalizedDateStr).getTime();
            return isNaN(time) ? 0 : time;
        };

        const dateA = parseTaskDate(a.date);
        const dateB = parseTaskDate(b.date);
        return dateA - dateB;
    });

    return (
        <div className="flex flex-col w-full h-full gap-6 min-h-[75vh]">
            <h1 className={styles.Header}>งานติดตามเร่งด่วน</h1>
            <div className={styles.ContentWrapper}>
                <div className={styles.ContentContainer}>
                    <div className={styles.ContentHeader}>
                        
                        {/* 💡 Replaced legacy dropdown with custom multi-select selector */}
                        <StatusMultiSelect 
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                        />

                        <PersonMultiSelect 
                            uniquePersons={uniquePersons}
                            personFilter={personFilter}
                            setPersonFilter={setPersonFilter}
                        />
                    </div>
                    <hr className={styles.Line}></hr>
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center w-full text-(--foreground)/60 font-bold" style={{ minHeight: '500px' }}>
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