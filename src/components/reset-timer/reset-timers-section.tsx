"use client";

import React from "react";
import { ResetCalendar } from "./reset-calendar";
import { Clock } from "lucide-react";

export function ResetTimersSection() {
    return (
        <section className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Server Reset Schedule (UTC+7)</h2>
            </div>

            <ResetCalendar />
        </section>
    );
}

