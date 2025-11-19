'use client';
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeamsPage;
var react_1 = require("react");
var image_1 = require("next/image");
var data_1 = require("@/lib/data");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var SupportModModal_1 = require("@/components/SupportModModal");
var SUPPORT_SLOT_CAPACITY = 9;
function TeamsPage() {
    var _a, _b, _c;
    var _d = (0, react_1.useState)([
        { character: null, weapon: null, mods: Array(SUPPORT_SLOT_CAPACITY).fill(null) },
        { character: null, weapon: null, mods: Array(SUPPORT_SLOT_CAPACITY).fill(null) },
    ]), team = _d[0], setTeam = _d[1];
    var _e = (0, react_1.useState)(false), isCharModalOpen = _e[0], setCharModalOpen = _e[1];
    var _f = (0, react_1.useState)(false), isWeaponModalOpen = _f[0], setWeaponModalOpen = _f[1];
    var _g = (0, react_1.useState)(false), isModModalOpen = _g[0], setModModalOpen = _g[1];
    var _h = (0, react_1.useState)(0), selectedSlot = _h[0], setSelectedSlot = _h[1];
    var _j = (0, react_1.useState)('character'), selectedType = _j[0], setSelectedType = _j[1];
    var handleSelectCharacter = function (char) {
        var newTeam = __spreadArray([], team, true);
        newTeam[selectedSlot].character = char;
        setTeam(newTeam);
        setCharModalOpen(false);
    };
    var handleSelectWeapon = function (weapon) {
        var newTeam = __spreadArray([], team, true);
        newTeam[selectedSlot].weapon = weapon;
        setTeam(newTeam);
        setWeaponModalOpen(false);
    };
    var handleSaveMods = function (mods) {
        var newTeam = __spreadArray([], team, true);
        newTeam[selectedSlot].mods = mods;
        setTeam(newTeam);
    };
    var openCharacterSelector = function (slot) {
        setSelectedSlot(slot);
        setSelectedType('character');
        setCharModalOpen(true);
    };
    var openWeaponSelector = function (slot) {
        setSelectedSlot(slot);
        setSelectedType('weapon');
        setWeaponModalOpen(true);
    };
    var openModEditor = function (slot, type) {
        var member = team[slot];
        var item = type === 'character' ? member.character : member.weapon;
        if (!item)
            return;
        setSelectedSlot(slot);
        setSelectedType(type);
        setModModalOpen(true);
    };
    return (<div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <lucide_react_1.Users className="w-8 h-8 text-primary"/>
          <h1 className="text-4xl font-headline font-bold">Team Setup</h1>
        </div>
        <p className="text-muted-foreground">
          Build your perfect support team composition
        </p>
      </div>

      <div className="space-y-8">
        {/* Support Characters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map(function (member, index) { return (<card_1.Card key={index} className="p-6 bg-card/60 backdrop-blur border-2 border-border">
              <h3 className="text-lg font-semibold mb-4 text-center">Support {index + 1}</h3>

              {/* Character Slot */}
              <div onClick={function () { return member.character ? openModEditor(index, 'character') : openCharacterSelector(index); }} className={(0, utils_1.cn)("relative aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all mb-4", member.character ? "border-primary hover:border-primary/80 bg-black/40" : "border-border hover:border-primary/50 bg-black/20")}>
                {member.character ? (<div className="relative w-full h-full group">
                    <image_1.default src={member.character.image} alt={member.character.name} fill className="object-cover transition-transform group-hover:scale-105"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-center font-bold text-sm">{member.character.name}</p>
                      <p className="text-white/70 text-center text-xs mt-1">
                        {member.mods.filter(Boolean).length}/{SUPPORT_SLOT_CAPACITY} mods
                      </p>
                    </div>
                  </div>) : (<div className="flex flex-col items-center gap-2">
                    <span className="text-4xl text-muted-foreground">+</span>
                    <span className="text-sm text-muted-foreground">Add Character</span>
                  </div>)}
              </div>

              {/* Weapon Slot */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                  Support Weapon
                </p>
                <div onClick={function () { return member.weapon ? openModEditor(index, 'weapon') : openWeaponSelector(index); }} className={(0, utils_1.cn)("relative aspect-[4/3] rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all", member.weapon ? "border-primary hover:border-primary/80 bg-black/40" : "border-border hover:border-primary/50 bg-black/20")}>
                  {member.weapon ? (<div className="relative w-full h-full group">
                      <image_1.default src={member.weapon.image} alt={member.weapon.name} fill className="object-cover transition-transform group-hover:scale-105"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-center font-bold text-xs">{member.weapon.name}</p>
                      </div>
                    </div>) : (<div className="flex flex-col items-center gap-1">
                      <span className="text-2xl text-muted-foreground">+</span>
                      <span className="text-xs text-muted-foreground">Add Weapon</span>
                    </div>)}
                </div>
              </div>
            </card_1.Card>); })}
        </div>
      </div>

      {/* Character Selection Modal */}
      <dialog_1.Dialog open={isCharModalOpen} onOpenChange={setCharModalOpen}>
        <dialog_1.DialogContent className="max-w-4xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Select Support Character</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <scroll_area_1.ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {data_1.allCharacters.map(function (char) { return (<card_1.Card key={char.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={function () { return handleSelectCharacter(char); }}>
                  <div className="relative aspect-square">
                    <image_1.default src={char.image} alt={char.name} fill className="object-cover"/>
                  </div>
                  <div className="p-2">
                    <p className="text-sm text-center font-semibold truncate">{char.name}</p>
                  </div>
                </card_1.Card>); })}
            </div>
          </scroll_area_1.ScrollArea>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Weapon Selection Modal */}
      <dialog_1.Dialog open={isWeaponModalOpen} onOpenChange={setWeaponModalOpen}>
        <dialog_1.DialogContent className="max-w-4xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Select Support Weapon</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          <scroll_area_1.ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {data_1.allWeapons.map(function (weapon) { return (<card_1.Card key={weapon.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={function () { return handleSelectWeapon(weapon); }}>
                  <div className="relative aspect-square">
                    <image_1.default src={weapon.image} alt={weapon.name} fill className="object-cover"/>
                  </div>
                  <div className="p-2">
                    <p className="text-sm text-center font-semibold truncate">{weapon.name}</p>
                  </div>
                </card_1.Card>); })}
            </div>
          </scroll_area_1.ScrollArea>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Mod Configuration Modal */}
      <SupportModModal_1.default item={selectedType === 'character' ? (_a = team[selectedSlot]) === null || _a === void 0 ? void 0 : _a.character : (_b = team[selectedSlot]) === null || _b === void 0 ? void 0 : _b.weapon} open={isModModalOpen} onOpenChange={setModModalOpen} initialMods={((_c = team[selectedSlot]) === null || _c === void 0 ? void 0 : _c.mods) || []} onSave={handleSaveMods}/>
    </div>);
}
