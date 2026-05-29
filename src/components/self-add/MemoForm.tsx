"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./SelfAdd.module.css"; 

type Topic = { detail: string };
type Assignment = { user_id: string; role_or_name: string; topics: Topic[] };

export default function MemoForm() {
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "งานติดตามคีย์ด้วยมือ",
    memo_no: "123/2567",
    memo_date: "2026-05-26",
    due_date: "2026-06-01T10:00",
    main_text: "รายละเอียดงานที่เพิ่มเข้ามาด้วยตนเอง...",
    is_urgent: true,
  });

  const [assignments, setAssignments] = useState<Assignment[]>([
    { user_id: "", role_or_name: "", topics: [{ detail: "" }] }
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
        const res = await fetch(`${backendUrl}/api/v1/users`);
        if (res.ok) {
          const result = await res.json();
          setUsers(result.data || []); 
        }
      } catch (err) {
        console.error("Failed to fetch users");
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? isChecked : value,
    }));
  };

  const addAssignment = () => {
    setAssignments([...assignments, { user_id: "", role_or_name: "", topics: [{ detail: "" }] }]);
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const addTopic = (assignIndex: number) => {
    const newAssignments = [...assignments];
    newAssignments[assignIndex].topics.push({ detail: "" });
    setAssignments(newAssignments);
  };

  const removeTopic = (assignIndex: number, topicIndex: number) => {
    const newAssignments = [...assignments];
    newAssignments[assignIndex].topics = newAssignments[assignIndex].topics.filter((_, i) => i !== topicIndex);
    setAssignments(newAssignments);
  };

  const handleTopicChange = (assignIndex: number, topicIndex: number, value: string) => {
    const newAssignments = [...assignments];
    newAssignments[assignIndex].topics[topicIndex].detail = value;
    setAssignments(newAssignments);
  };

  const handleUserChange = (index: number, value: string) => {
    const newAssignments = [...assignments];
    if (value === "ทุกหน่วยงาน") {
      newAssignments[index].user_id = "";
      newAssignments[index].role_or_name = "ทุกหน่วยงาน";
    } else {
      newAssignments[index].user_id = value;
      newAssignments[index].role_or_name = "";
    }
    setAssignments(newAssignments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedAssignments = assignments.map((assign) => {
      const validTopics = assign.topics.map((t) => t.detail.trim()).filter((t) => t !== "");
      return {
        user_id: assign.user_id ? Number(assign.user_id) : null,
        role_or_name: assign.role_or_name || null,
        topics: validTopics
      };
    }).filter(a => (a.user_id || a.role_or_name) && a.topics.length > 0);

    const payload = {
      ...formData,
      document_id: null,
      due_date: formData.due_date.length === 16 ? `${formData.due_date}:00` : formData.due_date,
      assignments: formattedAssignments,
    };

    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5003";
        const response = await fetch(`${backendUrl}/api/v1/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (response.ok && result.success) {
            alert("บันทึกข้อมูลสำเร็จ!");
        } else {
            alert("เกิดข้อผิดพลาด: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ (Network Error)");
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-6 min-h-75">
      <h1 className={styles.Header}>เพิ่มงานติดตามด้วยตนเอง</h1>
      
      <div className={styles.ContentWrapper}>
        <div className={styles.ContentContainer}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ข้อมูลหลักของฟอร์ม */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "var(--header)" }}>หัวข้องาน (Title)</label>
                <input type="text" name="title" value={formData.title} onChange={handleMainChange} required className="mt-1 block w-full rounded-md p-2.5 outline-none"
style={{ border: "1px solid var(--wrapper)", backgroundColor: "var(--button)", color: "var(--foreground)" }}/>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "var(--header)" }}>เลขที่ Memo</label>
                  <input type="text" name="memo_no" value={formData.memo_no} onChange={handleMainChange} required className="mt-1 block w-full rounded-md p-2.5 outline-none"
style={{ border: "1px solid var(--wrapper)", backgroundColor: "var(--button)", color: "var(--foreground)" }}/>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "var(--header)" }}>วันที่ Memo</label>
                  <input type="date" name="memo_date" value={formData.memo_date} onChange={handleMainChange} required className="mt-1 block w-full rounded-md p-2.5 outline-none"
style={{ border: "1px solid var(--wrapper)", backgroundColor: "var(--button)", color: "var(--foreground)" }}/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "var(--header)" }}>วันครบกำหนด (Due Date)</label>
                <input type="datetime-local" name="due_date" value={formData.due_date} onChange={handleMainChange} required className="mt-1 block w-full rounded-md p-2.5 outline-none"
style={{ border: "1px solid var(--wrapper)", backgroundColor: "var(--button)", color: "var(--foreground)" }}/>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: "var(--header)" }}>รายละเอียด (Main Text)</label>
                <textarea name="main_text" value={formData.main_text} onChange={handleMainChange} rows={4} className="mt-1 block w-full rounded-md p-2.5 outline-none"
style={{ border: "1px solid var(--wrapper)", backgroundColor: "var(--button)", color: "var(--foreground)" }}/>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="is_urgent" checked={formData.is_urgent} onChange={handleMainChange} id="is_urgent" style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'var(--redText)' }} />
                <label htmlFor="is_urgent" className="block text-sm font-bold cursor-pointer" style={{ color: "var(--redText)" }}>🔥 กำหนดเป็นงานเร่งด่วน (Urgent)</label>
              </div>
            </div>

            <hr className={styles.Line} style={{ borderColor: "var(--wrapper)", margin: "1.5rem 0" }} />

            {/* ส่วนจัดสรรผู้รับผิดชอบ */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h2 className="text-lg font-bold" style={{ color: "var(--header)" }}>ผู้รับผิดชอบและการมอบหมายงาน</h2>
                <button type="button" onClick={addAssignment} className="px-3 py-1.5 rounded-md text-sm font-bold transition-colors" style={{ backgroundColor: "var(--button)", color: "var(--header)", border: "1px solid var(--wrapper)" }}>
                  + เพิ่มผู้รับผิดชอบ
                </button>
              </div>

              {assignments.map((assign, index) => (
                <div key={index} className="p-4 rounded-xl mb-4" style={{ border: "1px solid var(--wrapper)", backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-bold text-sm" style={{ color: "var(--header)" }}>บุคคล / หน่วยงานที่รับผิดชอบ ลำดับที่ {index + 1}</label>
                    {assignments.length > 1 && (
                      <button type="button" onClick={() => removeAssignment(index)} className="text-sm font-bold hover:underline" style={{ color: "var(--redText)" }}>
                        ลบออก
                      </button>
                    )}
                  </div>

                  <select 
                    value={assign.user_id || assign.role_or_name || ""} 
                    onChange={(e) => handleUserChange(index, e.target.value)}
                    className="mb-4 block w-full rounded-md p-2.5 outline-none cursor-pointer"
                    style={{ border: "1px solid var(--wrapper)", backgroundColor: "var(--button)", color: "var(--header)" }}
                    required
                  >
                    <option value="" disabled>-- เลือกรายชื่อผู้รับผิดชอบ --</option>
                    <option value="ทุกหน่วยงาน" style={{ fontWeight: 'bold', color: "var(--blueText)" }}>ทุกหน่วยงาน (ส่วนกลาง)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} style={{ color: "var(--header)" }}>{u.name}</option>
                    ))}
                  </select>

                  <div className="pl-4" style={{ borderLeft: "2px solid var(--wrapper)" }}>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--header)", opacity: 0.8 }}>งานย่อยที่มอบหมาย :</label>
                    
                    {assign.topics.map((topic, tIndex) => (
                      <div key={tIndex} className="flex gap-2 items-center mb-2">
                        <span className="font-bold" style={{ color: "var(--wrapper)" }}>•</span>
                        <input 
                          type="text" 
                          className="rounded-md p-2 w-full outline-none" 
                          style={{ border: "1px solid var(--wrapper)", backgroundColor: "var(--button)" }}
                          placeholder="ระบุรายละเอียดงานย่อย..."
                          value={topic.detail} 
                          onChange={(e) => handleTopicChange(index, tIndex, e.target.value)}
                          required
                        />
                        {assign.topics.length > 1 && (
                          <button type="button" className="font-bold px-2 transition-colors" style={{ color: "var(--wrapper)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--redText)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--wrapper)"} onClick={() => removeTopic(index, tIndex)}>✕</button>
                        )}
                      </div>
                    ))}
                    
                    <button type="button" className="text-xs font-bold mt-1 hover:underline inline-block" style={{ color: "var(--blueText)" }} onClick={() => addTopic(index)}>
                      + เพิ่มงานย่อย
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full pt-4" style={{ borderTop: '1px solid var(--wrapper)' }}>
              <Link href={'/'} className="w-full sm:w-1/3">
                <button type="button" className="w-full py-2.5 px-4 rounded-xl font-bold text-center transition-colors" style={{ backgroundColor: "var(--button)", color: "var(--header)", border: "1px solid var(--wrapper)" }}>
                  กลับหน้าหลัก
                </button>
              </Link>
              <button type="submit" className="flex-1 py-2.5 px-4 rounded-xl font-bold text-lg shadow-sm transition-colors hover:opacity-90" style={{ backgroundColor: "var(--greenBG)", color: "var(--greenText)", border: "2px solid var(--greenBorder)" }}>
                บันทึกและส่งข้อมูลการติดตาม
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}