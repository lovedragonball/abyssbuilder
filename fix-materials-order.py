import re

# Read the file
with open('src/app/materials/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the correct order
correct_order = """// Material categories with their items (ordered by priority)
const categories = {
  'Secret Letters': [
    'Secret_Letter-_Berenica',
    'Secret_Letter-_Blade_Amberglow',
    'Secret_Letter-_Bluecurrent_Pulse',
    'Secret_Letter-_Daphne',
    'Secret_Letter-_Destructo',
    'Secret_Letter-_Entropic_Singularity',
    'Secret_Letter-_Excresduo',
    'Secret_Letter-_Exiled_Fangs',
    'Secret_Letter-_Fathomless_Sharkgaze',
    'Secret_Letter-_Flamme_De_Epuration',
    'Secret_Letter-_Ingenious_Tactics',
    'Secret_Letter-_Ironforger',
    'Secret_Letter-_Lady_Nifle',
    'Secret_Letter-_Lisbelle',
    'Secret_Letter-_Lynn',
    'Secret_Letter-_Margie',
    'Secret_Letter-_Momiji_Itteki',
    'Secret_Letter-_Osteobreaker',
    'Secret_Letter-_Outsider',
    'Secret_Letter-_Pyrothirst',
    'Secret_Letter-_Randy',
    'Secret_Letter-_Rebecca',
    'Secret_Letter-_Remanent_Reminiscence',
    'Secret_Letter-_Rendhusk',
    'Secret_Letter-_Screamshot',
    'Secret_Letter-_Searing_Sandwhisper',
    'Secret_Letter-_Sibylle',
    'Secret_Letter-_Silent_Shower',
    'Secret_Letter-_Silverwhite_Edict',
    "Secret_Letter-_Siren's_Kiss",
    'Secret_Letter-_Soulrend',
    'Secret_Letter-_Tetherslash',
    'Secret_Letter-_Truffle_and_Filbert',
    'Secret_Letter-_Undying_Oneiros',
    'Secret_Letter-_Wanewraith',
    'Secret_Letter-_Withershade',
  ],
  'Weapon Components': ["""

print("Script created. Run with: python fix-materials-order.py")
