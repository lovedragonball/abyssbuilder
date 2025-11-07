import type { Element } from '@/lib/types';
import { Flame, Droplets, Wind, Zap, Leaf, Snowflake, Mountain, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const elementIconMap: Record<Element, React.ElementType> = {
  Pyro: Flame,
  Hydro: Droplets,
  Anemo: Wind,
  Electro: Zap,
  Lumino: Sun,
  Umbro: Moon,
};

const elementColorMap: Record<Element, string> = {
  Pyro: 'text-chart-1',
  Hydro: 'text-chart-2',
  Anemo: 'text-chart-3',
  Electro: 'text-primary',
  Lumino: 'text-yellow-400',
  Umbro: 'text-indigo-400',
};

interface ElementIconProps extends React.HTMLAttributes<SVGSVGElement> {
  element: Element;
}

export function ElementIcon({ element, className, ...props }: ElementIconProps) {
  const Icon = elementIconMap[element];
  const colorClass = elementColorMap[element];
  if (!Icon) return null;
  return <Icon className={cn('h-4 w-4', colorClass, className)} {...props} />;
}
