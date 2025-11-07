# Contributing to AbyssBuilder

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/abyssbuilder.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### 1. Make Changes

- Follow the existing code style
- Use TypeScript for type safety
- Add comments for complex logic
- Keep functions small and focused

### 2. Test Your Changes

- Test manually in the browser
- Check for console errors
- Verify data persistence
- Test error scenarios

### 3. Commit Your Changes

Use conventional commit messages:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

Example:
```bash
git commit -m "feat: add multi-select filter for mods"
```

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User | null {
  // Implementation
}

// ❌ Bad
function getUser(id: any): any {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good
export function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>;
}

// ❌ Bad
export function MyComponent(props: any) {
  return <div>{props.title}</div>;
}
```

### Error Handling

```typescript
// ✅ Good
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  toast.error('Failed to load data');
  return null;
}

// ❌ Bad
const data = await fetchData(); // No error handling
```

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── layout/      # Layout components
│   └── game-specific/ # Game-specific components
├── contexts/        # React contexts
├── hooks/           # Custom hooks
└── lib/             # Utilities and helpers
    ├── data.ts      # Game data
    ├── types.ts     # TypeScript types
    ├── storage.ts   # Storage utilities
    ├── validation.ts # Validation schemas
    └── performance.ts # Performance utilities
```

## Adding New Features

### 1. Characters/Weapons

Add to `src/lib/data.ts`:

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

### 2. Mods

Add to `src/lib/data.ts`:

```typescript
export const allMods: Mod[] = [
  // ... existing mods
  {
    name: "New Mod",
    rarity: 5,
    modType: "Characters",
    element: "Pyro",
    symbol: "⊙",
    mainAttribute: "ATK +50%",
    effect: "Increases damage by 10%",
    tolerance: 20,
    track: 5,
    source: "Forge",
    image: getModImage("new-mod")
  },
];
```

### 3. UI Components

Create in `src/components/`:

```typescript
'use client';

import { cn } from '@/lib/utils';

interface MyComponentProps {
  title: string;
  className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {title}
    </div>
  );
}
```

## Documentation

- Update README.md for major features
- Add JSDoc comments for complex functions
- Update type definitions in types.ts
- Create guides in docs/ for new systems

## Questions?

- Open an issue for bugs
- Start a discussion for feature requests
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
