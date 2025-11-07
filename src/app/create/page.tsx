'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allCharacters, allWeapons, allWeaponTypes } from '@/lib/data';
import { allGeniemon } from '@/lib/geniemon-data';
import type { Character, Weapon, WeaponType, Element, RangedWeaponType } from '@/lib/types';
import type { Geniemon, GeniemonElement } from '@/lib/geniemon-data';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const characterElements: (Element | 'all')[] = ['all', 'Lumino', 'Anemo', 'Hydro', 'Pyro', 'Electro', 'Umbro'];
const weaponTypes: (WeaponType | RangedWeaponType | 'all')[] = ['all', ...allWeaponTypes];
const geniemonElements: (GeniemonElement | 'all')[] = ['all', 'Lumino', 'Anemo', 'Hydro', 'Pyro', 'Electro', 'Umbro', 'Neutral'];

const itemCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const ItemCard = ({ item, type }: { item: Character | Weapon | Geniemon; type?: 'character' | 'weapon' | 'geniemon' }) => {
    const href = type === 'geniemon' ? `/geniemon/${item.id}` : `/create/${item.id}`;
    
    return (
    <motion.div
        variants={itemCardVariants}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
        <Link href={href} passHref>
            <Card className="group block overflow-hidden bg-card border-2 border-transparent hover:border-primary transition-colors aspect-square relative">
            <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="fantasy item"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2 text-center">
                <p className="font-semibold text-sm text-white truncate group-hover:text-primary transition-colors">
                {item.name.toUpperCase()}
                </p>
            </div>
            </Card>
        </Link>
    </motion.div>
    );
};

const ItemGrid = ({ items, type }: { items: (Character[] | Weapon[] | Geniemon[]); type?: 'character' | 'weapon' | 'geniemon' }) => (
    <motion.div 
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
            visible: {
                transition: {
                    staggerChildren: 0.02,
                },
            },
        }}
    >
        {items.map(item => (
            <ItemCard key={item.id} item={item} type={type} />
        ))}
    </motion.div>
)

const CharacterGrid = () => {
    const [selectedElement, setSelectedElement] = useState<Element | 'all'>('all');
    const filteredCharacters = useMemo(() => {
        if (selectedElement === 'all') return allCharacters;
        return allCharacters.filter(c => c.element === selectedElement);
    }, [selectedElement]);

    return (
        <div>
            <div className="mb-6 max-w-xs">
                 <Select onValueChange={(value) => setSelectedElement(value as Element | 'all')} defaultValue="all">
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Element" />
                    </SelectTrigger>
                    <SelectContent>
                        {characterElements.map(element => (
                            <SelectItem key={element} value={element} className="capitalize">{element}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <ItemGrid items={filteredCharacters} type="character" />
        </div>
    )
}

const WeaponGrid = () => {
    const [selectedType, setSelectedType] = useState<WeaponType | RangedWeaponType | 'all'>('all');
    const filteredWeapons = useMemo(() => {
        if (selectedType === 'all') return allWeapons;
        return allWeapons.filter(w => w.type === selectedType);
    }, [selectedType]);

    return (
        <div>
            <div className="mb-6 max-w-xs">
                 <Select onValueChange={(value) => setSelectedType(value as WeaponType | RangedWeaponType | 'all')} defaultValue="all">
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {weaponTypes.map(type => (
                            <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <ItemGrid items={filteredWeapons} type="weapon" />
        </div>
    )
}

const GeniemonGrid = () => {
    const [selectedElement, setSelectedElement] = useState<GeniemonElement | 'all'>('all');
    const filteredGeniemon = useMemo(() => {
        if (selectedElement === 'all') return allGeniemon;
        return allGeniemon.filter(g => g.element === selectedElement);
    }, [selectedElement]);

    return (
        <div>
            <div className="mb-6 max-w-xs">
                 <Select onValueChange={(value) => setSelectedElement(value as GeniemonElement | 'all')} defaultValue="all">
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Element" />
                    </SelectTrigger>
                    <SelectContent>
                        {geniemonElements.map(element => (
                            <SelectItem key={element} value={element} className="capitalize">{element}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <ItemGrid items={filteredGeniemon} type="geniemon" />
        </div>
    )
}


export default function CreateBuildPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <LogIn className="h-16 w-16 mx-auto text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-headline font-bold mb-4">
            Login Required
          </h1>
          <p className="text-muted-foreground mb-8">
            You need to be logged in to create builds. Please login to continue.
          </p>
          <Button asChild size="lg">
            <Link href="/">
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-headline font-bold text-center mb-8">
        Choose An Item For A New Build
      </h1>

      <Tabs defaultValue="characters" className="w-full">
        <TabsList className="mb-6 flex flex-wrap justify-center bg-transparent">
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="weapons">Weapons</TabsTrigger>
          <TabsTrigger value="geniemon">Geniemon</TabsTrigger>
        </TabsList>
        
        <TabsContent value="characters">
          <CharacterGrid />
        </TabsContent>

        <TabsContent value="weapons">
            <WeaponGrid />
        </TabsContent>

        <TabsContent value="geniemon">
            <GeniemonGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
