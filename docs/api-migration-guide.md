# API Migration Guide

## Overview

This guide helps you migrate from localStorage to a real backend API when you're ready.

## Current Architecture (localStorage)

```
┌─────────────┐
│   Browser   │
│             │
│ ┌─────────┐ │
│ │LocalStorage│
│ └─────────┘ │
└─────────────┘
```

## Future Architecture (API)

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │─────▶│   API       │─────▶│  Database   │
│             │◀─────│   Server    │◀─────│             │
└─────────────┘      └─────────────┘      └─────────────┘
```

## Step 1: Create API Service Layer

Create `src/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Builds
  static async getBuilds() {
    return this.request<Build[]>('/api/builds');
  }

  static async getBuild(id: string) {
    return this.request<Build>(`/api/builds/${id}`);
  }

  static async createBuild(build: BuildInput) {
    return this.request<Build>('/api/builds', {
      method: 'POST',
      body: JSON.stringify(build),
    });
  }

  static async updateBuild(id: string, build: Partial<BuildInput>) {
    return this.request<Build>(`/api/builds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(build),
    });
  }

  static async deleteBuild(id: string) {
    return this.request<void>(`/api/builds/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth
  static async signIn(username: string, password: string) {
    return this.request<{ user: User; token: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static async signUp(username: string, password: string) {
    return this.request<{ user: User; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }
}
```

## Step 2: Create Data Hooks

Create `src/hooks/use-builds.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/lib/api';

export function useBuilds() {
  return useQuery({
    queryKey: ['builds'],
    queryFn: () => ApiService.getBuilds(),
  });
}

export function useBuild(id: string) {
  return useQuery({
    queryKey: ['builds', id],
    queryFn: () => ApiService.getBuild(id),
  });
}

export function useCreateBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ApiService.createBuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}

export function useUpdateBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BuildInput> }) =>
      ApiService.updateBuild(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
      queryClient.invalidateQueries({ queryKey: ['builds', id] });
    },
  });
}

export function useDeleteBuild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ApiService.deleteBuild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builds'] });
    },
  });
}
```

## Step 3: Update Components

### Before (localStorage):
```typescript
const [builds, setBuilds] = useState<Build[]>([]);

useEffect(() => {
  const savedBuilds = storage.getItem(STORAGE_KEYS.BUILDS, []);
  setBuilds(savedBuilds);
}, []);
```

### After (API):
```typescript
const { data: builds, isLoading, error } = useBuilds();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## Step 4: Backend API Structure

### Recommended Stack:
- **Node.js + Express** (Simple, fast)
- **Next.js API Routes** (Integrated)
- **NestJS** (Enterprise-grade)
- **tRPC** (Type-safe)

### Example Express API:

```typescript
// server/index.ts
import express from 'express';
import cors from 'cors';
import { buildsRouter } from './routes/builds';
import { authRouter } from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/builds', buildsRouter);
app.use('/api/auth', authRouter);

app.listen(3001, () => {
  console.log('API server running on port 3001');
});
```

```typescript
// server/routes/builds.ts
import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  const builds = await db.builds.findMany();
  res.json(builds);
});

router.post('/', async (req, res) => {
  const build = await db.builds.create({ data: req.body });
  res.json(build);
});

// ... more routes

export const buildsRouter = router;
```

## Step 5: Database Schema

### PostgreSQL (Recommended):

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Builds table
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  build_name VARCHAR(100) NOT NULL,
  description TEXT,
  guide TEXT,
  visibility VARCHAR(10) CHECK (visibility IN ('public', 'private')),
  item_type VARCHAR(20) CHECK (item_type IN ('character', 'weapon')),
  item_id VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  item_image TEXT,
  mods JSONB DEFAULT '[]',
  team JSONB DEFAULT '[]',
  support_weapons JSONB DEFAULT '[]',
  support_mods JSONB DEFAULT '{}',
  vote_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  build_id UUID REFERENCES builds(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, build_id)
);

-- Indexes
CREATE INDEX idx_builds_user_id ON builds(user_id);
CREATE INDEX idx_builds_visibility ON builds(visibility);
CREATE INDEX idx_builds_created_at ON builds(created_at DESC);
CREATE INDEX idx_votes_build_id ON votes(build_id);
```

## Step 6: Authentication

### JWT Token Flow:

```typescript
// server/middleware/auth.ts
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}
```

### Update Auth Context:

```typescript
const signIn = async (username: string, password: string) => {
  const { user, token } = await ApiService.signIn(username, password);
  
  // Store token
  storage.setItem('auth_token', token);
  
  // Set user
  setUser(user);
};
```

## Step 7: Data Migration

### Export localStorage data:

```typescript
// scripts/export-data.ts
import { storage, STORAGE_KEYS } from '@/lib/storage';
import fs from 'fs';

const builds = storage.getItem(STORAGE_KEYS.BUILDS, []);
const users = storage.getItem(STORAGE_KEYS.USERS, {});

fs.writeFileSync('data-export.json', JSON.stringify({ builds, users }, null, 2));
```

### Import to database:

```typescript
// scripts/import-data.ts
import { db } from './db';
import data from './data-export.json';

async function importData() {
  // Import users
  for (const [username, userData] of Object.entries(data.users)) {
    await db.users.create({
      data: {
        username,
        password_hash: userData.password, // Hash this!
        display_name: userData.displayName,
      },
    });
  }

  // Import builds
  for (const build of data.builds) {
    await db.builds.create({ data: build });
  }
}

importData();
```

## Step 8: Deployment

### Frontend (Vercel):
```bash
vercel deploy
```

### Backend Options:

1. **Railway**: Easy deployment
2. **Render**: Free tier available
3. **Fly.io**: Global edge deployment
4. **AWS/GCP/Azure**: Enterprise scale

### Database Options:

1. **Supabase**: PostgreSQL + Auth
2. **PlanetScale**: MySQL serverless
3. **MongoDB Atlas**: NoSQL
4. **Neon**: Serverless PostgreSQL

## Step 9: Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.yourapp.com

# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
PORT=3001
```

## Step 10: Testing

```typescript
// tests/api.test.ts
describe('Builds API', () => {
  it('should create a build', async () => {
    const build = await ApiService.createBuild(mockBuild);
    expect(build.id).toBeDefined();
  });

  it('should get all builds', async () => {
    const builds = await ApiService.getBuilds();
    expect(Array.isArray(builds)).toBe(true);
  });
});
```

## Migration Checklist

- [ ] Set up backend server
- [ ] Create database schema
- [ ] Implement API endpoints
- [ ] Add authentication
- [ ] Create API service layer
- [ ] Update components to use API
- [ ] Export localStorage data
- [ ] Import data to database
- [ ] Test all functionality
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Update environment variables
- [ ] Monitor and optimize

## Gradual Migration Strategy

You can migrate gradually:

1. **Phase 1**: Keep localStorage, add API layer
2. **Phase 2**: Sync localStorage with API
3. **Phase 3**: Use API as primary, localStorage as cache
4. **Phase 4**: Remove localStorage dependency

This allows you to test the API while keeping the app functional!
