"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface TimerCardProps {
    title: string;
    icon?: React.ReactNode;
    targetDate: Date | null;
    colorClass?: string;
}

export function TimerCard({ title, icon, targetDate, colorClass = "text-primary" }: TimerCardProps) {
    const [timeLeft, setTimeLeft] = useState<string>("Loading...");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!targetDate) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) {
                return "Resetting...";
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                return `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
            return `${hours}h ${minutes}m ${seconds}s`;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!isClient) {
        return (
            <Card className="h-full border-muted/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        {icon && React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">--:--:--</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full border-muted/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    {icon && React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" })}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold tracking-tight ${colorClass}`}>
                    {timeLeft}
                </div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">
                    Next: {targetDate?.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
            </CardContent>
        </Card>
    );
}
