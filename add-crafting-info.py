import re

# Weapon component mapping from materials page
weapon_components = {
    'Arclight_Apocalypses': ['Bowstring', 'Lower Limb', 'Upper Limb'],  # Bow (3 parts)
    'Blast_Artistry': ['Barrel', 'Bolt', 'Frame'],  # Shotgun
    'Bluecurrent_Pulse': ['Barrel', 'Frame'],  # Dual Pistols (2 parts)
    'Day_of_Sacred_Verdict': ['Barrel', 'Bolt', 'Frame'],  # Shotgun
    'Daybreak_Hymn': ['Barrel', 'Bolt', 'Frame'],  # Assault Rifle
    'Destructo': ['Barrel', 'Bolt', 'Frame'],  # Grenade Launcher
    'Dreamweavers_Feather': ['Barrel', 'Bolt', 'Frame'],  # Assault Rifle
    'Embla_Inflorescence': ['Bowstring', 'Lower Limb', 'Riser', 'Upper Limb'],  # Bow (4 parts)
    'Entropic_Singularity': ['Barrel', 'Bolt', 'Frame'],  # Pistol
    'Excresduo': ['Barrel', 'Frame'],  # Dual Pistols (2 parts)
    'Exiled_Thunderwyrm': ['Barrel', 'Bolt', 'Frame'],  # Assault Rifle
    'Flamme_De_Epuration': ['Barrel', 'Bolt', 'Frame'],  # Assault Rifle
    'Guixu_Ratchet': ['Barrel', 'Bolt', 'Frame'],  # Grenade Launcher
    'Osteobreaker': ['Barrel', 'Bolt', 'Frame'],  # Assault Rifle
    'Rendhusk': ['Barrel', 'Bolt', 'Frame'],  # Pistol
    'Sacrosanct_Chorus': ['Barrel', 'Frame'],  # Dual Pistols (2 parts)
    'Sacrosant_Decrcee': ['Barrel', 'Bolt', 'Frame'],  # Pistol
    'Screamshot': ['Barrel', 'Bolt', 'Frame'],  # Shotgun
    'Searing_Sandwhisper': ['Bowstring', 'Lower Limb', 'Riser', 'Upper Limb'],  # Bow (4 parts)
    'Silent_Sower': ['Barrel', 'Bolt', 'Frame'],  # Shotgun
    'Silverwhite_Edict': ['Barrel', 'Bolt', 'Frame'],  # Grenade Launcher
    'Soulrend': ['Bowstring', 'Lower Limb', 'Upper Limb'],  # Bow (3 parts)
    'Stellar_Finality': ['Barrel', 'Bolt', 'Frame'],  # Grenade Launcher
    'Submerged_Serenade': ['Barrel', 'Bolt', 'Frame'],  # Assault Rifle
}

# Read the weapon-details.ts file
with open('src/lib/weapon-details.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all ranged weapons that don't have crafting info
weapons_without_crafting = []

for weapon_name, components in weapon_components.items():
    # Convert weapon name to kebab-case for searching
    weapon_id = weapon_name.lower().replace('_', '-')
    
    # Check if this weapon exists in the file
    weapon_pattern = f"'{weapon_id}':\\s*{{[^}}]+?}}"
    weapon_match = re.search(weapon_pattern, content, re.DOTALL)
    
    if weapon_match:
        weapon_block = weapon_match.group(0)
        # Check if it already has crafting info
        if 'crafting:' not in weapon_block:
            weapons_without_crafting.append((weapon_id, weapon_name, components))
            print(f"Found weapon without crafting: {weapon_name} ({weapon_id})")

print(f"\nTotal weapons without crafting info: {len(weapons_without_crafting)}")

# Now add crafting info to each weapon
for weapon_id, weapon_name, components in weapons_without_crafting:
    # Find the closing brace of attributes section
    # Pattern: find the weapon, then find where attributes ends
    weapon_start_pattern = f"'{weapon_id}':\\s*{{"
    
    # Find the weapon start position
    weapon_start = re.search(weapon_start_pattern, content)
    if not weapon_start:
        print(f"Could not find weapon: {weapon_id}")
        continue
    
    start_pos = weapon_start.start()
    
    # Find the matching closing brace for this weapon
    # We need to find the attributes section and add crafting after it
    search_from = start_pos
    
    # Look for the pattern: attributes: { ... },\n  },
    # We want to insert before the final },
    pattern = f"('{weapon_id}':[^}}]*?attributes:\\s*{{[^}}]+?}})(\\s*)(,?\\s*}})"
    
    match = re.search(pattern, content[start_pos:start_pos+5000], re.DOTALL)
    if match:
        # Get the full match position in original content
        match_start = start_pos + match.start()
        match_end = start_pos + match.end()
        
        before = content[:match_start]
        weapon_block = match.group(1)
        whitespace = match.group(2)
        closing = match.group(3)
        after = content[match_end:]
        
        # Build crafting info with proper formatting
        components_str = str(components).replace("'", "'")
        crafting_info = f""",
    crafting: {{
      cost: 280000,
      time: 180,
      materials: [
        {{ name: 'Projectile', quantity: 2 }}
      ],
      components: {components_str}
    }}"""
        
        content = before + weapon_block + crafting_info + whitespace + closing + after
        print(f"Added crafting info to: {weapon_name}")
    else:
        print(f"Could not match pattern for: {weapon_id}")

# Write back to file
with open('src/lib/weapon-details.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ Successfully added crafting info to {len(weapons_without_crafting)} weapons!")
