'use client';

import { useState } from 'react';
import Image from 'next/image';
import { allCharacters, allWeapons } from '@/lib/data';
import type { Character, Weapon, Mod } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import SupportModModal from '@/components/SupportModModal';

const SUPPORT_SLOT_CAPACITY = 9;

interface TeamMember {
  character: Character | null;
  weapon: Weapon | null;
  mods: (Mod | null)[];
}

export default function TeamsPage() {
  const [team, setTeam] = useState<TeamMember[]>([
    { character: null, weapon: null, mods: Array(SUPPORT_SLOT_CAPACITY).fill(null) },
    { character: null, weapon: null, mods: Array(SUPPORT_SLOT_CAPACITY).fill(null) },
  ]);

  const [isCharModalOpen, setCharModalOpen] = useState(false);
  const [isWeaponModalOpen, setWeaponModalOpen] = useState(false);
  const [isModModalOpen, setModModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<'character' | 'weapon'>('character');

  const handleSelectCharacter = (char: Character) => {
    const newTeam = [...team];
    newTeam[selectedSlot].character = char;
    setTeam(newTeam);
    setCharModalOpen(false);
  };

  const handleSelectWeapon = (weapon: Weapon) => {
    const newTeam = [...team];
    newTeam[selectedSlot].weapon = weapon;
    setTeam(newTeam);
    setWeaponModalOpen(false);
  };

  const handleSaveMods = (mods: (Mod | null)[]) => {
    const newTeam = [...team];
    newTeam[selectedSlot].mods = mods;
    setTeam(newTeam);
  };

  const openCharacterSelector = (slot: number) => {
    setSelectedSlot(slot);
    setSelectedType('character');
    setCharModalOpen(true);
  };

  const openWeaponSelector = (slot: number) => {
    setSelectedSlot(slot);
    setSelectedType('weapon');
    setWeaponModalOpen(true);
  };

  const openModEditor = (slot: number, type: 'character' | 'weapon') => {
    const member = team[slot];
    const item = type === 'character' ? member.character : member.weapon;
    if (!item) return;

    setSelectedSlot(slot);
    setSelectedType(type);
    setModModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-headline font-bold">Team Setup</h1>
        </div>
        <p className="text-muted-foreground">
          Build your perfect support team composition
        </p>
      </div>

      <div className="space-y-8">
        {/* Support Characters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map((member, index) => (
            <Card key={index} className="p-6 bg-card/60 backdrop-blur border-2 border-border">
              <h3 className="text-lg font-semibold mb-4 text-center">Support {index + 1}</h3>

              {/* Character Slot */}
              <div
                onClick={() => member.character ? openModEditor(index, 'character') : openCharacterSelector(index)}
                className={cn(
                  "relative aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all mb-4",
                  member.character ? "border-primary hover:border-primary/80 bg-black/40" : "border-border hover:border-primary/50 bg-black/20"
                )}
              >
                {member.character ? (
                  <div className="relative w-full h-full group">
                    <Image
                      src={member.character.image}
                      alt={member.character.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-center font-bold text-sm">{member.character.name}</p>
                      <p className="text-white/70 text-center text-xs mt-1">
                        {member.mods.filter(Boolean).length}/{SUPPORT_SLOT_CAPACITY} mods
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl text-muted-foreground">+</span>
                    <span className="text-sm text-muted-foreground">Add Character</span>
                  </div>
                )}
              </div>

              {/* Weapon Slot */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  Support Weapon
                </p>
                <div
                  onClick={() => member.weapon ? openModEditor(index, 'weapon') : openWeaponSelector(index)}
                  className={cn(
                    "relative aspect-[4/3] rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all",
                    member.weapon ? "border-primary hover:border-primary/80 bg-black/40" : "border-border hover:border-primary/50 bg-black/20"
                  )}
                >
                  {member.weapon ? (
                    <div className="relative w-full h-full group">
                      <Image
                        src={member.weapon.image}
                        alt={member.weapon.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-center font-bold text-xs">{member.weapon.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl text-muted-foreground">+</span>
                      <span className="text-xs text-muted-foreground">Add Weapon</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Character Selection Modal */}
      <Dialog open={isCharModalOpen} onOpenChange={setCharModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Support Character</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {allCharacters.map(char => (
                <Card
                  key={char.id}
                  className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectCharacter(char)}
                >
                  <div className="relative aspect-square">
                    <Image src={char.image} alt={char.name} fill className="object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-sm text-center font-semibold truncate">{char.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Weapon Selection Modal */}
      <Dialog open={isWeaponModalOpen} onOpenChange={setWeaponModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Support Weapon</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {allWeapons.map(weapon => (
                <Card
                  key={weapon.id}
                  className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectWeapon(weapon)}
                >
                  <div className="relative aspect-square">
                    <Image src={weapon.image} alt={weapon.name} fill className="object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-sm text-center font-semibold truncate">{weapon.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Mod Configuration Modal */}
      <SupportModModal
        item={selectedType === 'character' ? team[selectedSlot]?.character : team[selectedSlot]?.weapon}
        open={isModModalOpen}
        onOpenChange={setModModalOpen}
        initialMods={team[selectedSlot]?.mods || []}
        onSave={handleSaveMods}
      />
    </div>
  );
}
