# 🚀 Quick Start Guide

## Get Started in 3 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Essential Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Quality Checks
npm run lint         # Run ESLint
npm run typecheck    # Check TypeScript types
```

---

## 🎯 Key Features

### 1. Create Builds
- Navigate to `/create`
- Select character or weapon
- Add mods (drag & drop)
- Configure team and support weapons
- Save as public or private

### 2. Browse Builds
- Visit `/builds` to see community builds
- Use filters: element, weapon type, visibility
- Search by name, creator, or character
- Vote on builds you like

### 3. Manage Profile
- Go to `/profile`
- View your builds
- Edit or delete builds
- Update display name

---

## 🛠️ Production Features

### Error Handling
```typescript
// App never crashes - errors are caught gracefully
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Safe Storage
```typescript
import { storage, STORAGE_KEYS } from '@/lib/storage';

// Get data safely
const builds = storage.getItem(STORAGE_KEYS.BUILDS, []);

// Save data safely
storage.setItem(STORAGE_KEYS.BUILDS, newBuilds);
```

### Validation
```typescript
import { validateBuild } from '@/lib/validation';

const result = validateBuild(buildData);
if (result.success) {
  // Use validated data
} else {
  // Handle errors
  console.error(result.errors);
}
```

### Performance
```typescript
import { debounce } from '@/lib/performance';

// Optimize search
const debouncedSearch = debounce((query) => {
  // Search logic
}, 300);
```

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [README](README.md) | Project overview and features |
| [Production Guide](docs/production-ready-guide.md) | All improvements and best practices |
| [API Migration](docs/api-migration-guide.md) | How to add a backend |
| [Testing Guide](docs/testing-guide.md) | Testing strategies |
| [Contributing](CONTRIBUTING.md) | How to contribute |

---

## 🎨 Project Structure

```
src/
├── app/              # Next.js pages & routes
│   ├── builds/      # Build listing & details
│   ├── create/      # Build creator
│   ├── profile/     # User profile
│   └── ...
├── components/       # React components
│   ├── ui/          # Reusable UI (buttons, cards, etc.)
│   ├── layout/      # Layout components
│   └── ...
├── contexts/        # React contexts
├── hooks/           # Custom hooks
└── lib/             # Utilities & helpers
    ├── data.ts      # Game data (characters, weapons, mods)
    ├── types.ts     # TypeScript types
    ├── storage.ts   # Safe localStorage wrapper
    └── ...
```

---

## 🔧 Common Tasks

### Add a New Character
Edit `src/lib/data.ts`:
```typescript
export const allCharacters: Character[] = [
  // ... existing characters
  { 
    name: 'New Character',
    element: 'Pyro',
    role: 'DPS (Skill Damage)',
    melee: 'Sword',
    ranged: 'Pistol'
  },
].map(c => ({ 
  ...c, 
  id: generateId(c.name), 
  image: getImage(`character-${generateId(c.name)}`) 
} as Character));
```

### Add a New Mod
Edit `src/lib/data.ts`:
```typescript
export const allMods: Mod[] = [
  // ... existing mods
  {
    name: "New Mod",
    rarity: 5,
    modType: "Characters",
    element: "Pyro",
    mainAttribute: "ATK +50%",
    tolerance: 20,
    track: 5,
    source: "Forge",
    image: getModImage("new-mod")
  },
];
```

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Type Errors
```bash
# Check types
npm run typecheck
```

### Storage Issues
```bash
# Clear localStorage (in browser console)
localStorage.clear()
```

---

## 🚀 Deployment

### Static Export (Recommended for Local)
```bash
npm run build
# Files will be in 'out/' directory
```

### GitHub Pages
1. Build the project
2. Push `out/` folder to `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Netlify
1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `out`

---

## 💡 Tips & Tricks

### Keyboard Shortcuts
- `Esc` - Close modals

### Developer Tools
- React DevTools - Debug components
- Performance tab - Monitor performance

### Best Practices
- Always validate user input
- Use TypeScript types
- Handle errors gracefully
- Test in multiple browsers

---

## 🎓 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### React
- [React Documentation](https://react.dev)
- [React Hooks](https://react.dev/reference/react)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)

---

## ✅ Checklist for New Developers

- [ ] Read README.md
- [ ] Install dependencies
- [ ] Run dev server
- [ ] Explore the app
- [ ] Read production guide
- [ ] Check code structure
- [ ] Try creating a build
- [ ] Review documentation
- [ ] Make a small change

---

**Ready to build? Let's go! 🚀**

*For detailed information, see the [Production-Ready Guide](docs/production-ready-guide.md)*
