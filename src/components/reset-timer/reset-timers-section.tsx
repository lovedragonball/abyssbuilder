"use client";

import React, { useEffect, useState } from "react";
import { TimerCard } from "./timer-card";
import { Calendar, Clock, Fish, PawPrint } from "lucide-react";

export function ResetTimersSection() {
    const [timers, setTimers] = useState<{
        daily: Date | null;
        weekly: Date | null;
        fishMaze: Date | null;
        geniemon: Date | null;
    }>({
        daily: null,
        weekly: null,
        fishMaze: null,
        geniemon: null,
    });

    useEffect(() => {
        const calculateTimers = () => {
            const now = new Date();

            // Helper to get next occurrence based on cycle
            // Base time is 21:00 UTC (which is 04:00 UTC+7 next day)

            // Daily: 04:00 UTC+7 = 21:00 UTC (previous day)
            const getNextDaily = () => {
                const d = new Date();
                const currentYear = d.getUTCFullYear();
                const currentMonth = d.getUTCMonth();
                const currentDate = d.getUTCDate();

                // Target is 21:00 UTC
                let target = new Date(Date.UTC(currentYear, currentMonth, currentDate, 21, 0, 0, 0));

                // If now is past 21:00 UTC, next reset is tomorrow 21:00 UTC
                if (d.getTime() >= target.getTime()) {
                    target = new Date(Date.UTC(currentYear, currentMonth, currentDate + 1, 21, 0, 0, 0));
                }

                return target;
            };

            // Weekly: Monday 04:00 UTC+7 = Sunday 21:00 UTC
            const getNextWeekly = () => {
                const d = new Date();
                const currentYear = d.getUTCFullYear();
                const currentMonth = d.getUTCMonth();
                const currentDate = d.getUTCDate();
                const currentDay = d.getUTCDay(); // 0 = Sunday

                // Target is Sunday 21:00 UTC
                let target = new Date(Date.UTC(currentYear, currentMonth, currentDate + (0 - currentDay), 21, 0, 0, 0));

                // If today is Sunday and we passed 21:00 UTC, or if it's not Sunday yet
                if (d.getTime() >= target.getTime()) {
                    target.setDate(target.getDate() + 7);
                }

                return target;
            };

            // Fish/Maze: 28 days cycle. Base: 2025-11-24 04:00 UTC+7 = 2025-11-23 21:00 UTC
            const getNextFishMaze = () => {
                const baseDate = new Date(Date.UTC(2025, 10, 23, 21, 0, 0, 0)); // Nov 23 2025 21:00 UTC
                const cycleMs = 28 * 24 * 60 * 60 * 1000;

                const diff = now.getTime() - baseDate.getTime();
                const cyclesPassed = Math.floor(diff / cycleMs);

                const nextReset = new Date(baseDate.getTime() + (cyclesPassed + 1) * cycleMs);
                return nextReset;
            };

            // Geniemon: 3 days cycle. Base: 2025-10-29 04:00 UTC+7 = 2025-10-28 21:00 UTC
            const getNextGeniemon = () => {
                const baseDate = new Date(Date.UTC(2025, 9, 28, 21, 0, 0, 0)); // Oct 28 2025 21:00 UTC
                const cycleMs = 3 * 24 * 60 * 60 * 1000;

                const diff = now.getTime() - baseDate.getTime();
                const cyclesPassed = Math.floor(diff / cycleMs);

                const nextReset = new Date(baseDate.getTime() + (cyclesPassed + 1) * cycleMs);
                return nextReset;
            };

            setTimers({
                daily: getNextDaily(),
                weekly: getNextWeekly(),
                fishMaze: getNextFishMaze(),
                geniemon: getNextGeniemon(),
            });
        };

        calculateTimers();
        // Recalculate every minute to ensure date correctness if crossing midnight/reset boundaries
        const interval = setInterval(calculateTimers, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">Server Reset Timers (UTC+7)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <TimerCard
                    title="Daily Reset"
                    icon={<Calendar className="h-4 w-4" />}
                    targetDate={timers.daily}
                    colorClass="text-blue-500"
                />
                <TimerCard
                    title="Weekly Reset"
                    icon={<Calendar className="h-4 w-4" />}
                    targetDate={timers.weekly}
                    colorClass="text-purple-500"
                />
                <TimerCard
                    title="Fish / Maze Reset"
                    icon={<Fish className="h-4 w-4" />}
                    targetDate={timers.fishMaze}
                    colorClass="text-cyan-500"
                />
                <TimerCard
                    title="Geniemon Reset"
                    icon={<PawPrint className="h-4 w-4" />}
                    targetDate={timers.geniemon}
                    colorClass="text-orange-500"
                />
            </div>
        </section>
    );
}
