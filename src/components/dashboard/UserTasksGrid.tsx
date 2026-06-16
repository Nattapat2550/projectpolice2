import React from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { TaskDetail } from './Types';

interface UserTasksGridProps {
    userName: string;
    tasks: TaskDetail[];
}

export default function UserTasksGrid({ userName, tasks }: UserTasksGridProps) {
    // ระบบจัดเรียงงานย่อย (เรียงเสร็จ/ไม่เสร็จ -> เรียงตามวันเสร็จก่อน)
    const sortedTasks = React.useMemo(() => {
        return [...tasks].sort((a, b) => {
            const aIsDone = a.status === 'completed';
            const bIsDone = b.status === 'completed';
            
            if (aIsDone !== bIsDone) return aIsDone ? 1 : -1;

            const getTime = (dateStr: string) => {
                if (!dateStr) return Infinity; 
                const time = new Date(dateStr).getTime();
                return isNaN(time) ? Infinity : time;
            };

            return getTime(a.dueDate) - getTime(b.dueDate);
        });
    }, [tasks]);

    return (
        <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm text-(--header) uppercase tracking-wider border-b border-(--shadow) pb-2 mb-1">
                รายการมอบหมายงานของ: {userName}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTasks.map((task, idx) => {
                    const isDone = task.status === 'completed';
                    return (
                        <Link 
                            href={`/tasks/${task.taskId}`} 
                            key={idx} 
                            className={`p-4 rounded-xl border-l-4 transition-transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer shadow-sm ${isDone ? 'border-(--greenBorder) bg-(--greenBG)' : 'border-(--yellowBorder) bg-(--yellowBG)'} flex flex-col justify-between gap-4`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <strong className={`text-sm font-bold line-clamp-2 ${isDone ? 'text-(--greenText)' : 'text-(--yellowText)'}`}>
                                        {task.taskName}
                                    </strong>
                                    {task.isUrgent && (
                                        <span className="bg-(--redBG) text-(--redText) border border-(--redBorder) text-[10px] uppercase font-black px-2 py-0.5 rounded-md whitespace-nowrap">
                                            ด่วนที่สุด
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs pt-3 border-t border-black/5 opacity-80 font-medium">
                                <div className="flex items-center gap-1">
                                    <Clock size={13} />
                                    {task.dueDate ? `ส่ง: ${task.dueDate}` : 'ไม่มีกำหนด'}
                                </div>
                                <div className="flex items-center gap-1 font-bold">
                                    {isDone ? (
                                        <><CheckCircle size={14} className="text-(--greenText)"/> <span className="text-(--greenText)">เสร็จสิ้น</span></>
                                    ) : (
                                        <><AlertCircle size={14} className="text-(--yellowText)"/> <span className="text-(--yellowText)">กำลังทำ</span></>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}