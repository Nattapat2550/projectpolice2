import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function Header() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-(--container) p-6 rounded-2xl border-2 border-(--shadow) shadow-sm">
            <div>
                <h1 className="text-3xl font-black text-(--header) tracking-tight flex items-center gap-2">
                    <BarChart3 className="text-(--blueText)" size={32} />
                    Dashboard
                </h1>
            </div>
        </div>
    );
}