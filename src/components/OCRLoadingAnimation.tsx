'use client';

import { useEffect, useState } from 'react';
import { Loader2, Eye, Search, Sparkles } from 'lucide-react';

interface OCRLoadingAnimationProps {
  status: 'recognizing' | 'matching';
}

const loadingMessages = {
  recognizing: [
    'กำลังอ่านข้อมูลจากรูปภาพ...',
    'Gemini AI กำลังวิเคราะห์ mod cards...',
    'กำลังตรวจจับชื่อ mods...',
    'กำลังอ่านค่า tolerance...',
    'เกือบเสร็จแล้ว...',
  ],
  matching: [
    'กำลังจับคู่กับฐานข้อมูล...',
    'กำลังค้นหา mods ที่ตรงกัน...',
    'กำลังกรอง variants...',
    'กำลังตรวจสอบ element...',
    'เกือบเสร็จแล้ว...',
  ],
};

export function OCRLoadingAnimation({ status }: OCRLoadingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = loadingMessages[status];

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [status, messages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Animated Icon */}
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        
        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-spin" 
             style={{ animationDuration: '3s' }} />
        
        {/* Inner circle with icon */}
        <div className="relative w-24 h-24 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center">
          {status === 'recognizing' ? (
            <Eye className="w-12 h-12 text-primary animate-pulse" />
          ) : (
            <Search className="w-12 h-12 text-primary animate-pulse" />
          )}
        </div>

        {/* Sparkles */}
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
        <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-blue-400 animate-bounce" 
                  style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          {status === 'recognizing' ? '🤖 Gemini AI กำลังอ่านรูปภาพ' : '🔍 กำลังจับคู่ Mods'}
        </h3>
        
        {/* Animated message */}
        <p className="text-sm text-muted-foreground animate-pulse min-h-[20px]">
          {messages[messageIndex]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Mod Cards Animation */}
      <div className="flex gap-2 items-center justify-center">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="w-8 h-12 rounded border-2 border-primary/30 bg-primary/5"
            style={{
              animation: 'pulse 2s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Tips */}
      <div className="text-xs text-center text-muted-foreground max-w-md space-y-1">
        <p>💡 <span className="font-semibold">เคล็ดลับ:</span> ถ่ายรูปให้ชัดเจนเพื่อความแม่นยำสูงสุด</p>
        <p>⚡ ใช้เวลาประมาณ 3-5 วินาที</p>
      </div>
    </div>
  );
}
