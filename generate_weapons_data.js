const fs = require('fs');
const path = require('path');

const inputPath = 'c:\\Users\\chawa\\Downloads\\AbyssBuilder\\weapons_refinement_0_to_5.txt';
const outputPath = 'c:\\Users\\chawa\\Downloads\\AbyssBuilder\\src\\lib\\weapons-data.ts';

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const weapons = JSON.parse(rawData);

    const processedWeapons = weapons.map(weapon => {
        // Determine category
        // Check stats of level 0 (or any level)
        const stats = weapon.refinement_data[0].stats;
        let category = 'Melee';

        // Heuristic: If it has "Max Ammo" or "Mag Capacity", it's Range.
        if (stats['Max Ammo'] || stats['Mag Capacity'] || stats['Projectile DMG'] || stats['Beam DMG'] || stats['Explosion DMG']) {
            category = 'Range';
        }

        // Special case overrides if needed
        // "Fathomless Sharkgaze" (id 16) has Spike ATK and no ammo -> Melee (Correct)

        // Weapon Image Mapping from User provided HTML
        const weaponImageMap = {
            "Arclight Apocalypse": "https://files.boarhat.gg/assets/duetnightabyss/weapon/arclight_apocalypses_v2.PNG",
            "Aureate Yore": "https://files.boarhat.gg/assets/duetnightabyss/weapon/aurate_yore_v1.PNG",
            "Blade Amberglow": "https://files.boarhat.gg/assets/duetnightabyss/weapon/blade_amberglow_v1.PNG",
            "Blast Artistry": "https://files.boarhat.gg/assets/duetnightabyss/weapon/blast_artistry_v1.PNG",
            "Bluecurrent Pulse": "https://files.boarhat.gg/assets/duetnightabyss/weapon/bluecurrent_pulse_v2.PNG",
            "Day of Sacred Verdict": "https://files.boarhat.gg/assets/duetnightabyss/weapon/day_of_sacred_verdict_v1.PNG",
            "Daybreak Hymn": "https://files.boarhat.gg/assets/duetnightabyss/weapon/daybreak_hymn_v1.PNG",
            "Destructo": "https://files.boarhat.gg/assets/duetnightabyss/weapon/destructo_v1.PNG",
            "Dreamweaver's Feather": "https://files.boarhat.gg/assets/duetnightabyss/weapon/dreamweaver_feather_v1.PNG",
            "Elpides Abound": "https://files.boarhat.gg/assets/duetnightabyss/weapon/elpides_abound_v2.PNG",
            "Embla Inflorescence": "https://files.boarhat.gg/assets/duetnightabyss/weapon/embla_inflorescence_v2.PNG",
            "Entropic Singularity": "https://files.boarhat.gg/assets/duetnightabyss/weapon/entropic_singularity_v1.PNG",
            "Excresduo": "https://files.boarhat.gg/assets/duetnightabyss/weapon/excresduo_v1.PNG",
            "Exiled Fangs": "https://files.boarhat.gg/assets/duetnightabyss/weapon/exiled_fangs_v1.PNG",
            "Exiled Thunderwyrm": "https://files.boarhat.gg/assets/duetnightabyss/weapon/exiled_thunderwyrm_v1.PNG",
            "Fathomless Sharkgaze": "https://files.boarhat.gg/assets/duetnightabyss/weapon/fathomless_sharkgaze_v1.PNG",
            "Flamme De Epuration": "https://files.boarhat.gg/assets/duetnightabyss/weapon/flamme_de_epuration_v1.PNG",
            "Guixu Ratchet": "https://files.boarhat.gg/assets/duetnightabyss/weapon/guixu_ratchet_v1.PNG",
            "Ingenious Tactics": "https://files.boarhat.gg/assets/duetnightabyss/weapon/ingenious_tactics_v1.PNG",
            "Ironforger": "https://files.boarhat.gg/assets/duetnightabyss/weapon/ironforger_v1.PNG",
            "Momiji Itteki": "https://files.boarhat.gg/assets/duetnightabyss/weapon/momiji_itteki_v1.PNG",
            "Osteobreaker": "https://files.boarhat.gg/assets/duetnightabyss/weapon/osteobreaker_v1.PNG",
            "Punitive Inferno": "https://files.boarhat.gg/assets/duetnightabyss/weapon/punitive_inferno_v1.PNG",
            "Pyrothirst": "https://files.boarhat.gg/assets/duetnightabyss/weapon/pyrothirst_v2.PNG",
            "Remanent Reminiscence": "https://files.boarhat.gg/assets/duetnightabyss/weapon/remanent_reminiscence_v1.PNG",
            "Rendhusk": "https://files.boarhat.gg/assets/duetnightabyss/weapon/rendhusk_v1.PNG",
            "Sacred Favour": "https://files.boarhat.gg/assets/duetnightabyss/weapon/sacred_favour_v1.PNG",
            "Sacrosanct Chorus": "https://files.boarhat.gg/assets/duetnightabyss/weapon/sacrosanct_chorus_v1.PNG",
            "Sacrosanct Decree": "https://files.boarhat.gg/assets/duetnightabyss/weapon/sacrosanct_decree_v1.PNG",
            "Screamshot": "https://files.boarhat.gg/assets/duetnightabyss/weapon/screamshot_v1.PNG",
            "Searing Sandwhisper": "https://files.boarhat.gg/assets/duetnightabyss/weapon/searing_sandwhisper_v1.PNG",
            "Shackle of Lonewolf": "https://files.boarhat.gg/assets/duetnightabyss/weapon/shackle_of_lonewolf_v1.PNG",
            "Silent Sower": "https://files.boarhat.gg/assets/duetnightabyss/weapon/silent_sower_v1.PNG",
            "Silverwhite Edict": "https://files.boarhat.gg/assets/duetnightabyss/weapon/silverwhite_edict_v1.PNG",
            "Siren's Kiss": "https://files.boarhat.gg/assets/duetnightabyss/weapon/siren_kiss_v3.PNG",
            "Soulrend": "https://files.boarhat.gg/assets/duetnightabyss/weapon/soulrend_v1.PNG",
            "Stellar Finality": "https://files.boarhat.gg/assets/duetnightabyss/weapon/stellar_finality_v1.PNG",
            "Submerged Serenade": "https://files.boarhat.gg/assets/duetnightabyss/weapon/submerged_serenade_v1.PNG",
            "Tetherlash": "https://files.boarhat.gg/assets/duetnightabyss/weapon/tetherlash_v1.PNG",
            "Undying Oneiros": "https://files.boarhat.gg/assets/duetnightabyss/weapon/undying_oneiros_v1.PNG",
            "Vernal Jade Halberd": "https://files.boarhat.gg/assets/duetnightabyss/weapon/vernal_jade_halberd_v1.PNG",
            "Viridis Reefs": "https://files.boarhat.gg/assets/duetnightabyss/weapon/viridis_reefs_v1.PNG",
            "Wandering Rose": "https://files.boarhat.gg/assets/duetnightabyss/weapon/wandering_rose_v1.PNG",
            "Wanewraith": "https://files.boarhat.gg/assets/duetnightabyss/weapon/wanewraith_v1.PNG",
            "Withershade": "https://files.boarhat.gg/assets/duetnightabyss/weapon/withershade_v1.PNG"
        };

        let imagePath = weaponImageMap[weapon.name];

        // Fallback for plural/singular mismatch if any
        if (!imagePath) {
            // Try adding 's' (e.g. Arclight Apocalypse -> Arclight Apocalypses)
            imagePath = weaponImageMap[weapon.name + 's'];
        }
        if (!imagePath) {
            // Try removing 's'
            if (weapon.name.endsWith('s')) {
                imagePath = weaponImageMap[weapon.name.slice(0, -1)];
            }
        }

        if (!imagePath) {
            console.warn(`No image found for weapon: ${weapon.name}`);
            imagePath = '';
        }

        return {
            ...weapon,
            category: category,
            image: imagePath
        };
    });

    const fileContent = `import { WeaponDefinition } from './types';

export const WEAPONS_DATA: WeaponDefinition[] = ${JSON.stringify(processedWeapons, null, 4)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log('Successfully generated weapons-data.ts');
} catch (error) {
    console.error('Error generating weapons data:', error);
}
