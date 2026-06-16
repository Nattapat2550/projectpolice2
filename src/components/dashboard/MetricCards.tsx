import React from 'react';
import { Layers, CheckSquare, AlertCircle, Users } from 'lucide-react';
import { GlobalMetrics } from './Types';

interface MetricCardsProps {
    metrics: GlobalMetrics;
}

export default function MetricCards({ metrics }: MetricCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-(--container) p-5 rounded-xl border-2 border-(--shadow) flex items-center gap-4">
                <div className="p-3 bg-(--wrapper) rounded-lg text-foreground"><Layers size={24}/></div>
                <div>
                    <div className="text-sm opacity-60 font-medium">ปริมาณภาระงานรวม</div>
                    <div className="text-2xl font-bold">{metrics.total} งาน</div>
                </div>
            </div>
            <div className="bg-(--container) p-5 rounded-xl border-2 border-(--shadow) flex items-center gap-4">
                <div className="p-3 bg-(--greenBG) rounded-lg text-(--greenText)"><CheckSquare size={24}/></div>
                <div>
                    <div className="text-sm opacity-60 font-medium">ดำเนินการเสร็จสิ้น</div>
                    <div className="text-2xl font-bold text-(--greenText)">{metrics.completed} งาน</div>
                </div>
            </div>
            <div className="bg-(--container) p-5 rounded-xl border-2 border-(--shadow) flex items-center gap-4">
                <div className="p-3 bg-(--yellowBG) rounded-lg text-(--yellowText)"><AlertCircle size={24}/></div>
                <div>
                    <div className="text-sm opacity-60 font-medium">อัตราความสำเร็จรวม</div>
                    <div className="text-2xl font-bold text-(--blueText)">{metrics.rate}%</div>
                </div>
            </div>
            <div className="bg-(--container) p-5 rounded-xl border-2 border-(--shadow) flex items-center gap-4">
                <div className="p-3 bg-(--button) rounded-lg text-(--header)"><Users size={24}/></div>
                <div>
                    <div className="text-sm opacity-60 font-medium">ผู้รับผิดชอบทั้งหมด</div>
                    <div className="text-2xl font-bold">{metrics.totalPeople} คน</div>
                </div>
            </div>
        </div>
    );
}