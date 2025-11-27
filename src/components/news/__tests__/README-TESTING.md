# News Updates Section - Testing Guide

## Overview

This directory contains comprehensive tests for the News Updates Section feature. The test suite covers unit tests, component tests, integration tests, and visual regression tests.

## Test Files

### Unit Tests

#### `patch-parser.test.ts`
Tests for the PatchParser class methods.

**Coverage:**
- `extractHighlightedTerms()` - Extracting bracketed terms
- `determinePatchType()` - Identifying patch note types
- `parse()` - Full HTML parsing with various scenarios

**Key Test Cases:**
- Single and multiple bracketed terms
- Nested brackets
- Empty input handling
- Malformed HTML handling
- Date parsing and sorting
- Unique ID generation

#### `patch-parser-edge-cases.test.ts`
Edge case and error condition tests for PatchParser.

**Coverage:**
- Malformed HTML scenarios
- Empty and null inputs
- Unusual content (very long text, special characters, emoji)
- Date format variations
- Bracketed terms edge cases
- Performance with large datasets

#### `patch-parser-integration.test.ts`
Integration tests using the actual Patch.txt file.

**Coverage:**
- Real-world HTML parsing
- Specific known issues extraction
- Specific patch notes extraction
- Date sorting verification
- Highlighted terms extraction
- Patch type identification

#### `patch-cache.test.ts`
Tests for the caching mechanism.

**Coverage:**
- Cache storage and retrieval
- Cache expiration
- Cache invalidation
- localStorage integration

### Component Tests

#### `known-issues-card.test.tsx`
Tests for the KnownIssuesCard component.

**Coverage:**
- Rendering with issues
- Empty state handling
- Highlighted terms display
- Scrollable content
- Accessibility features
- Internationalization

#### `patch-notes-card.test.tsx`
Tests for the PatchNotesCard component.

**Coverage:**
- Rendering with updates
- Date grouping
- Show more functionality
- Empty state handling
- Highlighted terms display
- Accessibility features
- Internationalization

#### `news-updates-section.test.tsx`
Tests for the main NewsUpdatesSection component.

**Coverage:**
- Layout rendering (grid, responsive)
- Data integration with child components
- Error state handling
- Empty state handling
- Prop forwarding
- Accessibility (ARIA labels, roles)
- Internationalization

#### `update-card.test.tsx`
Tests for the base UpdateCard component.

**Coverage:**
- Basic rendering
- Title and content display
- Icon rendering
- Custom styling
- Accessibility

### Feature Tests

#### `news-accessibility.test.tsx`
Accessibility-focused tests using jest-axe.

**Coverage:**
- WCAG compliance
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast

#### `news-animations.test.tsx`
Animation and interaction tests.

**Coverage:**
- Card entry animations
- Hover effects
- Scroll behavior
- Animation performance
- Framer Motion integration

#### `news-performance.test.tsx`
Performance optimization tests.

**Coverage:**
- Render performance
- Caching effectiveness
- Lazy loading
- Memory usage
- Large dataset handling

#### `thai-translations.test.tsx`
Internationalization tests for Thai language.

**Coverage:**
- Translation rendering
- Locale switching
- Thai character display
- Date formatting
- Empty/error states in Thai

#### `news-visual-regression.test.tsx`
Visual regression tests for layout and styling.

**Coverage:**
- Desktop layout
- Mobile layout
- Card styling consistency
- Item visual elements
- Color scheme consistency
- Typography
- Shadow and border effects

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test patch-parser.test.ts
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Only Unit Tests

```bash
npm test -- src/lib/__tests__
```

### Run Only Component Tests

```bash
npm test -- src/components/news/__tests__
```

## Test Structure

### Typical Test Structure

```typescript
describe('ComponentName', () => {
  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      const props = { /* test props */ };
      
      // Act
      render(<Component {...props} />);
      
      // Assert
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });
});
```

### Common Test Patterns

#### Testing Component Rendering

```typescript
it('should render component with props', () => {
  const { container } = render(<Component prop="value" />);
  expect(container.querySelector('.class-name')).toBeInTheDocument();
});
```

#### Testing User Interactions

```typescript
it('should handle click event', async () => {
  const handleClick = jest.fn();
  render(<Component onClick={handleClick} />);
  
  const button = screen.getByRole('button');
  await userEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### Testing Accessibility

```typescript
it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Testing Async Behavior

```typescript
it('should load data asynchronously', async () => {
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});
```

## Mocking

### Mocking Framer Motion

```typescript
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));
```

### Mocking Child Components

```typescript
jest.mock('../child-component', () => ({
  ChildComponent: ({ prop }: any) => (
    <div data-testid="child-component" data-prop={prop}>
      Mocked Child
    </div>
  ),
}));
```

### Mocking Data Fetching

```typescript
jest.mock('@/lib/patch-data-server', () => ({
  getPatchData: jest.fn(() => Promise.resolve(mockPatchData)),
}));
```

## Test Data

### Sample Patch Data

```typescript
const mockPatchData: PatchData = {
  knownIssues: [
    {
      id: 'issue-1',
      description: 'Test issue with [Bracketed Term]',
      highlightedTerms: ['Bracketed Term'],
    },
  ],
  updates: [
    {
      date: '2025-11-22',
      displayDate: 'Update Details - 2025-11-22',
      notes: [
        {
          id: 'note-1',
          description: 'Fixed [Bug]',
          highlightedTerms: ['Bug'],
          type: 'fix',
        },
      ],
    },
  ],
  lastUpdated: '2025-11-22T00:00:00Z',
};
```

### Sample HTML for Parser Tests

```typescript
const sampleHTML = `
  <div class="ace-line"><strong>▍Known Issues</strong></div>
  <div class="ace-line">✧ Issue description</div>
  <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
  <div class="ace-line">✦ Fixed something</div>
`;
```

## Coverage Goals

### Target Coverage

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

### Current Coverage

Run `npm test -- --coverage` to see current coverage metrics.

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled daily runs

### CI Configuration

```yaml
- name: Run tests
  run: npm test -- --coverage --ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Debugging Tests

### Debug Single Test

```typescript
it.only('should debug this test', () => {
  // This test will run in isolation
});
```

### Skip Test Temporarily

```typescript
it.skip('should skip this test', () => {
  // This test will be skipped
});
```

### Debug with Console Logs

```typescript
it('should debug with logs', () => {
  const { container } = render(<Component />);
  console.log(container.innerHTML); // View rendered HTML
  screen.debug(); // Pretty-print DOM
});
```

### Debug with Breakpoints

Add `debugger;` statement in test:

```typescript
it('should debug with breakpoint', () => {
  debugger; // Execution will pause here
  render(<Component />);
});
```

Run with Node inspector:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ Bad:
```typescript
expect(component.state.value).toBe(5);
```

✅ Good:
```typescript
expect(screen.getByText('Value: 5')).toBeInTheDocument();
```

### 2. Use Semantic Queries

❌ Bad:
```typescript
container.querySelector('.button');
```

✅ Good:
```typescript
screen.getByRole('button', { name: 'Submit' });
```

### 3. Test Accessibility

Always include accessibility tests:

```typescript
it('should be accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 4. Keep Tests Isolated

Each test should be independent:

```typescript
beforeEach(() => {
  // Reset state before each test
  jest.clearAllMocks();
  localStorage.clear();
});
```

### 5. Use Descriptive Test Names

❌ Bad:
```typescript
it('works', () => { /* ... */ });
```

✅ Good:
```typescript
it('should display error message when parsing fails', () => { /* ... */ });
```

### 6. Test Edge Cases

Always test:
- Empty data
- Null/undefined values
- Very large datasets
- Special characters
- Error conditions

### 7. Mock External Dependencies

Mock APIs, timers, and external libraries:

```typescript
jest.useFakeTimers();
jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
```

## Troubleshooting

### Tests Failing Locally

1. Clear Jest cache: `npm test -- --clearCache`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check Node version matches CI environment

### Tests Passing Locally But Failing in CI

1. Check for timezone differences
2. Check for file system case sensitivity
3. Check for environment-specific dependencies

### Flaky Tests

1. Add `waitFor` for async operations
2. Increase timeout for slow operations
3. Mock time-dependent code
4. Ensure proper cleanup in `afterEach`

### Memory Leaks

1. Clean up event listeners in `afterEach`
2. Clear timers and intervals
3. Unmount components properly
4. Check for circular references

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain coverage above 90%
4. Add tests for edge cases
5. Update this README if adding new test patterns

## Questions?

For questions about testing, please:
1. Check this README
2. Review existing test files for examples
3. Consult the team's testing guidelines
4. Ask in the development channel
