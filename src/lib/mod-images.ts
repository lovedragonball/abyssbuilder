// Demon Wedge (Mod) Images Mapping
export const modImages: Record<string, string> = {
    // Arbiter series
    "arbiters-illusionary-sacrifice": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/arbiter.png",
    
    // Bahamut series
    "bahamuts-frosty-breath": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/bahamut.png",
    "bahamuts-misty-veil": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/bahamut.png",
    "bahamuts-celerity": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/bahamut.png",
    
    // Cerberus series
    "cerberuss-celerity": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/cerberus.png",
    "cerberuss-frosty-breath": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/cerberus.png",
    
    // Covenanter series
    "covenanter-anemo": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_anemo.png",
    "covenanter-electro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_electro_v1.png",
    "covenanter-hydro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_hydro_v1.png",
    "covenanter-lumino": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_lumino.png",
    "covenanter-pyro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_pyro_v1.png",
    "covenanter-umbro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/covenanter_umbro_v1.png",
    
    // Eldritch series
    "eldritch-cerberus": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/eldritch_cerberus.png",
    "eldritch-lilith": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/eldritch_lilith.png",
    
    // Fafnir
    "fafnir": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/fafnir.png",
    
    // Feathered Serpent
    "feathered-serpent": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/feathered_serpent.png",
    
    // Fenrir
    "fenrir": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/fenrir.png",
    
    // Griffin series
    "griffin-anemo": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/griffin_anemo.png",
    "griffin-electro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/griffin_electro.png",
    "griffin-hydro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/griffin_hydro.png",
    "griffin-lumino": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/griffin_lumino.png",
    "griffin-pyro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/griffin_pyro.png",
    "griffin-umbro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/griffin_umbro.png",
    
    // Hastur
    "hastur": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/hastur.png",
    
    // Helios
    "helios": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/helios.png",
    
    // Ifrit
    "ifrit": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/ifrit.png",
    
    // Jormugand
    "jormugand": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/jormugand.png",
    
    // Lilith
    "lilith": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/lilith.png",
    
    // Pan
    "pan": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/pan_v1.png",
    
    // Phoenix
    "phoenix": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/phoenix.png",
    
    // Siren
    "siren": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/siren.png",
    
    // Sphinx
    "sphinx": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/sphinx.png",
    
    // Summanus
    "summanus": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/summanus.png",
    
    // Typhon series
    "typhon-anemo": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/typhon_anemo.png",
    "typhon-electro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/typhon_electro.png",
    "typhon-hydro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/typhon_hydro.png",
    "typhon-lumino": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/typhon_lumino.png",
    "typhon-pyro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/typhon_pyro.png",
    "typhon-umbro": "https://files.boarhat.gg/assets/duetnightabyss/demonwedge/typhon_umbro.png",
};

export function getModImage(modName: string, element?: string): string {
    // Convert mod name to key format
    const key = modName.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/'/g, '')
        .replace(/[()]/g, '');
    
    console.log('Mod name:', modName, '→ Key:', key, 'Element:', element);
    
    // Try to find exact match first
    if (modImages[key]) {
        console.log('✓ Found exact match');
        return modImages[key];
    }
    
    // Special handling for Covenanter mods based on element
    if (modName.toLowerCase().includes('covenanter') && element) {
        const elementLower = element.toLowerCase();
        const covenanterKey = `covenanter-${elementLower}`;
        if (modImages[covenanterKey]) {
            console.log('✓ Found Covenanter element match:', covenanterKey);
            return modImages[covenanterKey];
        }
    }
    
    // Special handling for Griffin mods based on element
    if (modName.toLowerCase().includes('griffin') && element) {
        const elementLower = element.toLowerCase();
        const griffinKey = `griffin-${elementLower}`;
        if (modImages[griffinKey]) {
            console.log('✓ Found Griffin element match:', griffinKey);
            return modImages[griffinKey];
        }
    }
    
    // Special handling for Typhon mods based on element
    if (modName.toLowerCase().includes('typhon') && element) {
        const elementLower = element.toLowerCase();
        const typhonKey = `typhon-${elementLower}`;
        if (modImages[typhonKey]) {
            console.log('✓ Found Typhon element match:', typhonKey);
            return modImages[typhonKey];
        }
    }
    
    // Try to find partial match (for variants)
    const partialKey = Object.keys(modImages).find(k => key.includes(k) || k.includes(key.split('-')[0]));
    if (partialKey) {
        console.log('✓ Found partial match:', partialKey);
        return modImages[partialKey];
    }
    
    console.log('✗ No match found, using fallback');
    // Default fallback
    return 'https://picsum.photos/seed/mod-placeholder/200/100';
}
