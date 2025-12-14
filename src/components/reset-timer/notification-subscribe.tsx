"use client";

import React, { useState } from "react";
import { Bell, Mail, Check, Loader2, X, CalendarDays, Fish, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResetType = "weekly" | "fishMaze" | "geniemon";

interface NotificationOption {
    type: ResetType;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
    {
        type: "weekly",
        label: "Weekly Reset",
        icon: <CalendarDays className="w-4 h-4" />,
        color: "text-purple-500",
        bgColor: "bg-purple-500/20",
    },
    {
        type: "fishMaze",
        label: "Fish / Maze Reset",
        icon: <Fish className="w-4 h-4" />,
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/20",
    },
    {
        type: "geniemon",
        label: "Geniemon Reset",
        icon: <PawPrint className="w-4 h-4" />,
        color: "text-orange-500",
        bgColor: "bg-orange-500/20",
    },
];

export function NotificationSubscribe() {
    const [email, setEmail] = useState("");
    const [selectedTypes, setSelectedTypes] = useState<Set<ResetType>>(new Set(["weekly", "fishMaze", "geniemon"]));
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const toggleType = (type: ResetType) => {
        setSelectedTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes("@")) {
            setStatus("error");
            setMessage("Please enter a valid email address");
            return;
        }

        if (selectedTypes.size === 0) {
            setStatus("error");
            setMessage("Please select at least one notification type");
            return;
        }

        setIsLoading(true);
        setStatus("idle");
        setMessage("");

        try {
            const response = await fetch("/api/notifications/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    types: Array.from(selectedTypes),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
                setMessage("🎉 Successfully subscribed! You'll receive email reminders before resets.");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to subscribe. Please try again.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-6 p-4 rounded-xl border border-border bg-card/80">
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h4 className="text-base font-semibold">Email Notifications</h4>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                Get email reminders before server resets (sent at 03:00 UTC+7)
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email input */}
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={cn(
                            "w-full pl-10 pr-4 py-2.5 rounded-lg",
                            "bg-background/50 border border-border",
                            "text-sm placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                            "transition-all"
                        )}
                        disabled={isLoading}
                    />
                </div>

                {/* Reset type selection */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Select notifications:</p>
                    <div className="flex flex-wrap gap-2">
                        {NOTIFICATION_OPTIONS.map((option) => (
                            <button
                                key={option.type}
                                type="button"
                                onClick={() => toggleType(option.type)}
                                disabled={isLoading}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-sm",
                                    selectedTypes.has(option.type)
                                        ? cn(option.bgColor, option.color, "border-current")
                                        : "border-border text-muted-foreground opacity-50 hover:opacity-75"
                                )}
                            >
                                {option.icon}
                                <span>{option.label}</span>
                                {selectedTypes.has(option.type) && (
                                    <Check className="w-3 h-3 ml-1" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full"
                    variant="gradient"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subscribing...
                        </>
                    ) : (
                        <>
                            <Bell className="w-4 h-4 mr-2" />
                            Subscribe to Notifications
                        </>
                    )}
                </Button>

                {/* Status message */}
                {status !== "idle" && (
                    <div className={cn(
                        "flex items-start gap-2 p-3 rounded-lg text-sm",
                        status === "success"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                        {status === "success" ? (
                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        ) : (
                            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{message}</span>
                    </div>
                )}
            </form>
        </div>
    );
}
