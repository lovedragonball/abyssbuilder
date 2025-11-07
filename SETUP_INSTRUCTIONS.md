# 🚀 Setup Instructions

## Quick Setup (3 minutes)

### 1. Install Node.js

Check if you have Node.js installed:
```bash
node --version
```

If not, download from https://nodejs.org/ (LTS version recommended)

### 2. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourusername/abyssbuilder.git
cd abyssbuilder

# Install dependencies
npm install
```

### 3. Setup Environment

```bash
# Copy environment file
cp .env.example .env.local
```

The `.env.local` file is ready to use with default values.

### 4. Run the Project

```bash
# Start development server
npm run dev
```

Open http://localhost:3000 in your browser 🎉

## Available Features

✅ Create new builds
✅ Edit builds
✅ Delete builds
✅ View all builds
✅ Search and filter builds
✅ Add mods and team members

## Data Storage

- All data is stored in **Browser Local Storage**
- Data stays on your device only
- No server or database required
- Data will be lost if you clear browser cache

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Quality Checks
npm run lint         # Check code style
npm run typecheck    # Check TypeScript types
```

## Troubleshooting

### npm install fails
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 is already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### Data disappeared
- Data is stored in Local Storage
- Clearing browser cache will delete all data
- Consider exporting important builds

## Need Help?

Open an issue on GitHub if you encounter any problems!

## 🎉 Done!

You're ready to start creating builds! 🎮
