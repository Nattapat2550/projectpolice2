import React from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { UserStat, SortKey } from './Types';
import UserTasksGrid from './UserTasksGrid';

interface TaskTableProps {
    stats: UserStat[];
    sortKey: SortKey;
    sortOrder: 'asc' | 'desc';
    onSort: (key: SortKey) => void;
    expandedUser: string | null;
    onToggleExpand: (userName: string) => void;
    maxTasks: number;
}

export default function TaskTable({
    stats,
    sortKey,
    sortOrder,
    onSort,
    expandedUser,
    onToggleExpand,
    maxTasks
}: TaskTableProps) {
    return (
        <div className="bg-(--container) p-6 rounded-2xl border-2 border-(--shadow) shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-(--header)">ตารางสรุปรายบุคคลเปรียบเทียบภาระงาน</h2>
                <span className="text-xs opacity-60 font-medium">* คลิกที่แถวรายชื่อในตาราง เพื่อกางดูรายละเอียดงานรายชิ้น</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-(--shadow)">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-(--wrapper) border-b border-(--shadow) text-sm">
                            <th className="p-4 font-bold cursor-pointer hover:bg-black/5 transition-colors select-none" onClick={() => onSort('userName')}>
                                <div className="flex items-center gap-1.5">ชื่อผู้รับผิดชอบ {sortKey === 'userName' && <ArrowUpDown size={14} className="text-(--blueText)"/>}</div>
                            </th>
                            <th className="p-4 font-bold cursor-pointer hover:bg-black/5 transition-colors text-center select-none" onClick={() => onSort('totalTasks')}>
                                <div className="flex items-center justify-center gap-1.5">จำนวนงาน {sortKey === 'totalTasks' && <ArrowUpDown size={14} className="text-(--blueText)"/>}</div>
                            </th>
                            <th className="p-4 font-bold cursor-pointer hover:bg-black/5 transition-colors text-center text-(--greenText) select-none" onClick={() => onSort('completedTasks')}>
                                <div className="flex items-center justify-center gap-1.5">เสร็จสิ้น {sortKey === 'completedTasks' && <ArrowUpDown size={14} className="text-(--greenText)"/>}</div>
                            </th>
                            <th className="p-4 font-bold cursor-pointer hover:bg-black/5 transition-colors text-center text-(--redText) select-none" onClick={() => onSort('incompleteTasks')}>
                                <div className="flex items-center justify-center gap-1.5">ยังไม่เสร็จ {sortKey === 'incompleteTasks' && <ArrowUpDown size={14} className="text-(--redText)"/>}</div>
                            </th>
                            <th className="p-4 font-bold text-center w-1/4">สัดส่วนความคืบหน้า</th>
                            <th className="p-4 w-12 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center opacity-50 font-medium">ไม่พบข้อมูลผู้รับผิดชอบงานในระบบ</td>
                            </tr>
                        ) : (
                            stats.map((user) => {
                                const completionRate = user.totalTasks > 0 ? Math.round((user.completedTasks / user.totalTasks) * 100) : 0;
                                const completedWidth = (user.completedTasks / maxTasks) * 100;
                                const incompleteWidth = (user.incompleteTasks / maxTasks) * 100;
                                const isExpanded = expandedUser === user.userName;

                                return (
                                    <React.Fragment key={user.userName}>
                                        <tr 
                                            onClick={() => onToggleExpand(user.userName)}
                                            className={`border-b border-(--shadow) transition-colors cursor-pointer ${isExpanded ? 'bg-(--button)' : 'hover:bg-black/5'}`}
                                        >
                                            <td className="p-4 font-semibold">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-3.5 h-3.5 rounded-full ring-2 ring-black/5 shadow-inner" style={{ backgroundColor: user.color }}></span>
                                                    {user.userName}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center font-bold text-base">{user.totalTasks}</td>
                                            <td className="p-4 text-center text-(--greenText) font-black text-base bg-(--greenBG)/10">{user.completedTasks}</td>
                                            <td className="p-4 text-center text-(--redText) font-black text-base bg-(--redBG)/10">{user.incompleteTasks}</td>
                                            
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex justify-end text-xs font-bold text-(--blueText)">
                                                        {completionRate}%
                                                    </div>
                                                    <div className="w-full h-3 bg-(--wrapper) rounded-full overflow-hidden flex shadow-inner">
                                                        <div 
                                                            className="bg-(--greenBorder) h-full transition-all duration-700 ease-out" 
                                                            style={{ width: `${completedWidth}%` }}
                                                            title={`เสร็จแล้ว ${user.completedTasks} งาน`}
                                                        ></div>
                                                        <div 
                                                            className="bg-(--redBorder) h-full transition-all duration-700 ease-out border-l border-white/20" 
                                                            style={{ width: `${incompleteWidth}%` }}
                                                            title={`ยังไม่เสร็จ ${user.incompleteTasks} งาน`}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 text-center text-foreground opacity-50">
                                                {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                            </td>
                                        </tr>
                                        
                                        {/* EXPANDED DETAILS (ACCORDION) */}
                                        {isExpanded && (
                                            <tr className="bg-(--button)/30 shadow-inner">
                                                <td colSpan={6} className="p-6 border-b border-(--shadow)">
                                                    <UserTasksGrid userName={user.userName} tasks={user.tasksDetails} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}