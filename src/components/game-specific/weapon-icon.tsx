import type { WeaponType } from '@/lib/types';
import { Sword, Swords, Target, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const PolearmIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 22l8-8" />
      <path d="M5.5 13.5l5 5" />
      <path d="M14.5 3.5l5 5" />
      <path d="M19 9l-2.5 2.5" />
      <path d="M21 2l-2 2" />
    </svg>
  );

const weaponIconMap: Record<string, React.ElementType> = {
  Sword: Sword,
  Greatsword: Swords,
  'Dual Blades': Swords,
  Katana: Sword,
  Polearm: PolearmIcon,
  Whipsword: Target,
};

interface WeaponTypeIconProps extends React.HTMLAttributes<SVGSVGElement> {
  weaponType: WeaponType | string;
}

export function WeaponTypeIcon({ weaponType, className, ...props }: WeaponTypeIconProps) {
  const Icon = weaponIconMap[weaponType] || Sword;
  return <Icon className={cn('h-4 w-4', className)} {...props} />;
}
