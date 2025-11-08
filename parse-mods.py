import json
import re

def parse_mods_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    mods = []
    lines = content.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines and comments
        if not line or line.startswith('#'):
            i += 1
            continue
        
        # Check if this looks like a mod name (not a field label)
        if line in ['Main Attribute', 'Effect', 'Tolerance:', 'Track:', 'Source:']:
            i += 1
            continue
        
        # Check if next line has rarity (★)
        if i + 1 < len(lines) and '★' in lines[i + 1]:
            mod_name = line
            i += 1
            
            # Parse rarity
            rarity_line = lines[i].strip()
            rarity_match = re.search(r'(\d)★', rarity_line)
            if not rarity_match:
                i += 1
                continue
            rarity = int(rarity_match.group(1))
            i += 1
            
            # Parse mod type
            if i >= len(lines):
                break
            mod_type = lines[i].strip()
            if not mod_type or mod_type in ['Main Attribute', 'Effect']:
                i += 1
                continue
            i += 1
            
            # Initialize mod object
            mod = {
                "name": mod_name,
                "rarity": rarity,
                "modType": mod_type
            }
            
            # Parse optional element
            if i < len(lines) and lines[i].strip() in ['Lumino', 'Anemo', 'Hydro', 'Pyro', 'Electro', 'Umbro']:
                mod["element"] = lines[i].strip()
                i += 1
            
            # Parse optional symbol
            if i < len(lines) and lines[i].strip() in ['⊙', '◬', '☽', '◊']:
                mod["symbol"] = lines[i].strip()
                i += 1
            
            # Parse Main Attribute
            main_attr = ""
            if i < len(lines) and lines[i].strip() == 'Main Attribute':
                i += 1
                if i < len(lines) and lines[i].strip() and lines[i].strip() != 'Effect':
                    main_attr = lines[i].strip()
                    i += 1
            mod["mainAttribute"] = main_attr if main_attr else "–"
            
            # Parse Effect
            if i < len(lines) and lines[i].strip() == 'Effect':
                i += 1
                effect_lines = []
                while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith('Tolerance:'):
                    effect_lines.append(lines[i].strip())
                    i += 1
                if effect_lines:
                    mod["effect"] = ' '.join(effect_lines)
            
            # Parse Tolerance
            tolerance = 0
            while i < len(lines) and not lines[i].strip().startswith('Tolerance:'):
                i += 1
            if i < len(lines) and lines[i].strip().startswith('Tolerance:'):
                tolerance_match = re.search(r'Tolerance:\s*(\d+)', lines[i])
                if tolerance_match:
                    tolerance = int(tolerance_match.group(1))
                i += 1
            mod["tolerance"] = tolerance
            
            # Parse Track
            track = 0
            while i < len(lines) and not lines[i].strip().startswith('Track:'):
                i += 1
            if i < len(lines) and lines[i].strip().startswith('Track:'):
                track_match = re.search(r'Track:\s*(\d+)', lines[i])
                if track_match:
                    track = int(track_match.group(1))
                i += 1
            mod["track"] = track
            
            # Parse Source
            source = ""
            while i < len(lines) and not lines[i].strip().startswith('Source:'):
                i += 1
            if i < len(lines) and lines[i].strip().startswith('Source:'):
                source = lines[i].strip().replace('Source:', '').strip()
                i += 1
            mod["source"] = source
            
            mods.append(mod)
            print(f"Parsed: {mod_name} ({rarity}★)")
        else:
            i += 1
    
    return mods

# Parse the file
print("Starting to parse new-mods.txt...")
mods = parse_mods_file('new-mods.txt')

# Output as JSON
with open('parsed-mods.json', 'w', encoding='utf-8') as f:
    json.dump(mods, f, indent=2, ensure_ascii=False)

print(f"\nParsed {len(mods)} mods successfully!")
print("Output saved to parsed-mods.json")
