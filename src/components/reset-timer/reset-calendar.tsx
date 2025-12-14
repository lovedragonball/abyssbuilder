"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Fish, PawPrint, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotificationSubscribe } from "./notification-subscribe";

// Reset type definitions (excluding daily from calendar display)
type ResetType = "weekly" | "fishMaze" | "geniemon";

interface ResetInfo {
    type: ResetType;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
}

const RESET_CONFIG: Record<ResetType, ResetInfo> = {
    weekly: {
        type: "weekly",
        label: "Weekly Reset",
        shortLabel: "Weekly",
        icon: <CalendarDays className="w-2.5 h-2.5" />,
        color: "text-purple-500",
        bgColor: "bg-purple-500/20",
        borderColor: "border-purple-500/50",
    },
    fishMaze: {
        type: "fishMaze",
        label: "Fish / Maze Reset",
        shortLabel: "Fish/Maze",
        icon: <Fish className="w-2.5 h-2.5" />,
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/20",
        borderColor: "border-cyan-500/50",
    },
    geniemon: {
        type: "geniemon",
        label: "Geniemon Reset",
        shortLabel: "Geniemon",
        icon: <PawPrint className="w-2.5 h-2.5" />,
        color: "text-orange-500",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500/50",
    },
};

// Base dates for cyclic resets (21:00 UTC = 04:00 UTC+7 next day)
const FISH_MAZE_BASE = new Date(Date.UTC(2025, 10, 23, 21, 0, 0, 0)); // Nov 23 2025
const GENIEMON_BASE = new Date(Date.UTC(2025, 9, 28, 21, 0, 0, 0)); // Oct 28 2025

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Check if a date has a specific reset
function hasReset(date: Date, type: ResetType): boolean {
    const checkDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    switch (type) {
        case "weekly":
            return checkDate.getUTCDay() === 1; // Monday

        case "fishMaze": {
            const diffMs = checkDate.getTime() - FISH_MAZE_BASE.getTime();
            const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
            return diffDays >= 0 && diffDays % 28 === 0;
        }

        case "geniemon": {
            const diffMs = checkDate.getTime() - GENIEMON_BASE.getTime();
            const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
            return diffDays >= 0 && diffDays % 3 === 0;
        }

        default:
            return false;
    }
}

// Get filtered resets for a specific date based on visible filters
function getResetsForDate(date: Date, visibleTypes: Set<ResetType>): ResetType[] {
    const resets: ResetType[] = [];

    if (visibleTypes.has("weekly") && hasReset(date, "weekly")) resets.push("weekly");
    if (visibleTypes.has("fishMaze") && hasReset(date, "fishMaze")) resets.push("fishMaze");
    if (visibleTypes.has("geniemon") && hasReset(date, "geniemon")) resets.push("geniemon");

    return resets;
}

// Generate calendar days for a month
function generateCalendarDays(year: number, month: number): (Date | null)[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
    }

    return days;
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

interface DayCellProps {
    date: Date | null;
    isToday: boolean;
    visibleTypes: Set<ResetType>;
}

function DayCell({ date, isToday, visibleTypes }: DayCellProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (!date) {
        return <div className="h-12" />;
    }

    const resets = getResetsForDate(date, visibleTypes);

    return (
        <div
            className={cn(
                "h-12 relative flex items-center justify-center",
                "rounded-md text-base",
                "hover:bg-muted/50 transition-colors cursor-pointer",
                isToday && "ring-1 ring-primary bg-primary/10 font-bold",
                resets.length > 0 && "font-medium"
            )}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Day number */}
            <span className={cn(
                "text-base",
                isToday && "text-primary"
            )}>
                {date.getDate()}
            </span>

            {/* Reset indicator dots */}
            {resets.length > 0 && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {resets.map((resetType) => {
                        const config = RESET_CONFIG[resetType];
                        return (
                            <div
                                key={resetType}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    config.bgColor,
                                    config.color.replace("text-", "bg-").replace("/500", "-500")
                                )}
                                style={{ backgroundColor: config.color.includes("purple") ? "#a855f7" : config.color.includes("cyan") ? "#06b6d4" : "#f97316" }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Tooltip */}
            {showTooltip && resets.length > 0 && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 
                    bg-popover border border-border rounded-md shadow-lg p-1.5 min-w-[100px]
                    animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="text-[10px] font-medium mb-1 text-muted-foreground">
                        {date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric"
                        })}
                    </div>
                    <div className="space-y-0.5">
                        {resets.map((resetType) => {
                            const config = RESET_CONFIG[resetType];
                            return (
                                <div key={resetType} className={cn("flex items-center gap-1 text-[10px]", config.color)}>
                                    {config.icon}
                                    <span>{config.shortLabel}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// Filter checkbox component
interface FilterCheckboxProps {
    type: ResetType;
    checked: boolean;
    onChange: (type: ResetType, checked: boolean) => void;
}

function FilterCheckbox({ type, checked, onChange }: FilterCheckboxProps) {
    const config = RESET_CONFIG[type];

    return (
        <label className={cn(
            "flex items-center gap-1.5 cursor-pointer select-none",
            "px-2 py-1 rounded-md border transition-all text-xs",
            checked
                ? cn(config.bgColor, config.borderColor, config.color)
                : "border-border/50 text-muted-foreground opacity-50"
        )}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(type, e.target.checked)}
                className="sr-only"
            />
            {config.icon}
            <span>{config.shortLabel}</span>
        </label>
    );
}

export function ResetCalendar() {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());

    // Filter state - all visible by default
    const [visibleTypes, setVisibleTypes] = useState<Set<ResetType>>(
        new Set(["weekly", "fishMaze", "geniemon"])
    );

    const calendarDays = useMemo(
        () => generateCalendarDays(currentYear, currentMonth),
        [currentYear, currentMonth]
    );

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    const handleFilterChange = (type: ResetType, checked: boolean) => {
        setVisibleTypes(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(type);
            } else {
                next.delete(type);
            }
            return next;
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Reset Calendar</h3>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevMonth}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <button
                        onClick={goToToday}
                        className="text-base font-medium min-w-[120px] text-center hover:text-primary transition-colors"
                    >
                        {MONTHS[currentMonth]} {currentYear}
                    </button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextMonth}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Filter checkboxes */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                {(Object.keys(RESET_CONFIG) as ResetType[]).map((type) => (
                    <FilterCheckbox
                        key={type}
                        type={type}
                        checked={visibleTypes.has(type)}
                        onChange={handleFilterChange}
                    />
                ))}
            </div>

            {/* Daily reset note */}
            <div className="text-center text-sm text-muted-foreground mb-4">
                📌 Daily Reset: Every day at 04:00 (UTC+7)
            </div>

            {/* Calendar grid */}
            <div className="border border-border rounded-lg overflow-hidden bg-card/30">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-muted/30">
                    {DAYS_OF_WEEK.map((day) => (
                        <div
                            key={day}
                            className="py-2.5 text-center text-sm font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1 p-2">
                    {calendarDays.map((date, index) => (
                        <DayCell
                            key={index}
                            date={date}
                            isToday={date ? isSameDay(date, today) : false}
                            visibleTypes={visibleTypes}
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
                {(Object.keys(RESET_CONFIG) as ResetType[]).map((type) => {
                    const config = RESET_CONFIG[type];
                    return (
                        <div key={type} className="flex items-center gap-1">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: config.color.includes("purple") ? "#a855f7" : config.color.includes("cyan") ? "#06b6d4" : "#f97316" }}
                            />
                            <span>{config.shortLabel}</span>
                        </div>
                    );
                })}
            </div>

            {/* Email Notification Subscribe */}
            <NotificationSubscribe />
        </div>
    );
}

