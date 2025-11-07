# Testing Guide

## Overview

This guide covers testing strategies for the AbyssBuilder application.

## Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── utils/         # Test utilities
```

## Unit Testing

### Example: Storage Manager

```typescript
import { storage } from '@/lib/storage';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve data', () => {
    const data = { test: 'value' };
    storage.setItem('test-key', data);
    const retrieved = storage.getItem('test-key', {});
    expect(retrieved).toEqual(data);
  });

  it('should return default value when key not found', () => {
    const defaultValue = { default: true };
    const result = storage.getItem('non-existent', defaultValue);
    expect(result).toEqual(defaultValue);
  });
});
```

### Example: Validation

```typescript
import { validateBuild } from '@/lib/validation';

describe('Build Validation', () => {
  it('should validate correct build data', () => {
    const validBuild = {
      buildName: 'Test Build',
      visibility: 'public',
      itemType: 'character',
      itemId: 'test-id',
      itemName: 'Test Character',
      mods: [],
      team: [],
      supportWeapons: [],
    };

    const result = validateBuild(validBuild);
    expect(result.success).toBe(true);
  });

  it('should reject invalid build data', () => {
    const invalidBuild = {
      buildName: '', // Empty name
      visibility: 'invalid',
    };

    const result = validateBuild(invalidBuild);
    expect(result.success).toBe(false);
  });
});
```

## Integration Testing

### Example: Build Creation Flow

```typescript
describe('Build Creation', () => {
  it('should create and save a build', async () => {
    // Setup
    const user = { uid: 'test-user', username: 'testuser' };
    
    // Create build
    const build = createBuild(user, buildData);
    
    // Verify
    const saved = storage.getItem(STORAGE_KEYS.BUILDS, []);
    expect(saved).toContainEqual(expect.objectContaining({
      userId: user.uid,
      buildName: buildData.buildName,
    }));
  });
});
```

## Manual Testing Checklist

### Authentication
- [ ] Sign up with valid credentials
- [ ] Sign up with invalid credentials (too short)
- [ ] Sign in with correct password
- [ ] Sign in with wrong password
- [ ] Sign out
- [ ] Update display name

### Build Management
- [ ] Create new build
- [ ] Edit existing build
- [ ] Delete build
- [ ] View build details
- [ ] Toggle visibility (public/private)
- [ ] Add/remove mods
- [ ] Add/remove team members
- [ ] Add/remove support weapons

### Search & Filter
- [ ] Search by build name
- [ ] Search by creator
- [ ] Filter by element
- [ ] Filter by weapon type
- [ ] Multi-select filters
- [ ] Clear filters

### Error Handling
- [ ] Network error simulation
- [ ] localStorage full error
- [ ] Invalid data handling
- [ ] Error boundary activation

## Performance Testing

### Metrics to Monitor
- Page load time
- Search response time
- Build save time
- Image loading time

### Tools
- Chrome DevTools Performance tab
- Lighthouse
- React DevTools Profiler

## Accessibility Testing

### Checklist
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Focus indicators
- [ ] ARIA labels

## Browser Testing

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing
- iOS Safari
- Chrome Mobile
- Samsung Internet

## Future: Automated Testing Setup

```bash
# Install dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```
