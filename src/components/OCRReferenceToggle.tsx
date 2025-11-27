'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OCRReferenceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  available?: boolean;
}

export function OCRReferenceToggle({ enabled, onToggle, available = true }: OCRReferenceToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="ocr-reference"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={!available}
      />
      <Label htmlFor="ocr-reference" className="flex items-center gap-2 cursor-pointer">
        <span className={!available ? 'text-muted-foreground' : ''}>
          ใช้รูปตัวอย่าง (Few-Shot Learning)
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                ส่งรูปตัวอย่างจากเกมให้ AI ดูก่อน เพื่อเพิ่มความแม่นยำในการอ่าน mod cards
                <br /><br />
                <strong>ข้อดี:</strong> แม่นยำขึ้น เข้าใจ context ดีขึ้น
                <br />
                <strong>ข้อเสีย:</strong> ช้าลงเล็กน้อย (ส่งหลายรูป)
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Label>
      {!available && (
        <span className="text-xs text-muted-foreground">
          (ยังไม่พร้อมใช้งาน)
        </span>
      )}
    </div>
  );
}
