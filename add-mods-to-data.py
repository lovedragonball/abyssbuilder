import json
import re

# Read parsed mods
with open('parsed-mods.json', 'r', encoding='utf-8') as f:
    new_mods = json.load(f)

# Read existing data.ts
with open('src/lib/data.ts', 'r', encoding='utf-8') as f:
    data_content = f.read()

# Extract existing mod names
existing_mod_pattern = r'"name":\s*"([^"]+)"'
existing_mods = set(re.findall(existing_mod_pattern, data_content))

print(f"Found {len(existing_mods)} existing mods in data.ts")
print(f"Parsed {len(new_mods)} new mods from file")

# Filter out mods that already exist
mods_to_add = []
for mod in new_mods:
    # Create a unique key for comparison
    mod_key = f"{mod['name']}_{mod['rarity']}"
    
    # Check if this exact mod (name + rarity) exists
    is_duplicate = False
    for existing_name in existing_mods:
        if mod['name'] == existing_name:
            # Need to check rarity too, but for now we'll be conservative
            # and skip if name matches
            is_duplicate = True
            break
    
    if not is_duplicate:
        mods_to_add.append(mod)

print(f"Found {len(mods_to_add)} new mods to add")

if len(mods_to_add) == 0:
    print("No new mods to add. All mods already exist in data.ts")
    exit(0)

# Convert mods to TypeScript format
def mod_to_ts(mod):
    lines = ["  {"]
    lines.append(f'    "name": "{mod["name"]}",')
    lines.append(f'    "rarity": {mod["rarity"]},')
    lines.append(f'    "modType": "{mod["modType"]}",')
    
    if "element" in mod:
        lines.append(f'    "element": "{mod["element"]}",')
    if "symbol" in mod:
        lines.append(f'    "symbol": "{mod["symbol"]}",')
    
    lines.append(f'    "mainAttribute": "{mod["mainAttribute"]}",')
    
    if "effect" in mod:
        # Escape quotes in effect
        effect = mod["effect"].replace('"', '\\"')
        lines.append(f'    "effect": "{effect}",')
    
    lines.append(f'    "tolerance": {mod["tolerance"]},')
    lines.append(f'    "track": {mod["track"]},')
    lines.append(f'    "source": "{mod["source"]}"')
    lines.append("  }")
    
    return "\n".join(lines)

# Find the position to insert (before ].map())
map_pattern = '].map(mod => ({ ...mod, image: getModImage(mod.name, mod.element) } as Mod));'
map_position = data_content.find(map_pattern)

if map_position == -1:
    print("Error: Could not find insertion point in data.ts")
    exit(1)

# Find the last closing brace before ].map(
# We need to insert after the last mod's closing brace
last_brace = data_content.rfind('}', 0, map_position)
if last_brace == -1:
    print("Error: Could not find last mod closing brace")
    exit(1)

# Find the end of line after the last brace
insert_position = data_content.find('\n', last_brace) + 1

# Build the new mods string
new_mods_str = ",\n" + ",\n".join([mod_to_ts(mod) for mod in mods_to_add])

# Insert the new mods before ].map()
new_content = data_content[:insert_position] + new_mods_str + "\n" + data_content[insert_position:]

# Write back to file
with open('src/lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully added {len(mods_to_add)} new mods to data.ts!")
print("\nSample of added mods:")
for mod in mods_to_add[:10]:
    print(f"  - {mod['name']} ({mod['rarity']}★)")
if len(mods_to_add) > 10:
    print(f"  ... and {len(mods_to_add) - 10} more")
