# AbyssBuilder

A Next.js application for creating and sharing character/weapon builds.

## ⭐ Production-Ready Features

- 🎮 Create and manage builds for characters and weapons
- 🔧 Customize builds with mods and support items
- 👥 Team setup with support characters and weapons
- 📝 Write guides for your builds
- 🔒 Public/Private build visibility
- 👤 User authentication with Google Sign-In
- 💾 Safe data persistence with error handling
- 🛡️ Global error boundary for crash protection
- ✅ Input validation with Zod
- 🚀 Performance optimizations (debounce, throttle, memoization)
- 📊 Type-safe throughout with TypeScript
- 🎨 Beautiful UI with Radix UI + Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🎯 Production-Ready Features

### Error Handling
- Global error boundary for crash protection
- Safe localStorage operations with fallbacks
- User-friendly error messages
- Automatic error recovery

### Data Management
- Type-safe storage wrapper
- Input validation with Zod
- Data persistence with error handling
- Backward compatible with existing data

### Performance
- Debounced search (300ms)
- Throttled scroll events
- Memoization utilities
- Performance monitoring tools

### Developer Experience
- Full TypeScript coverage
- Comprehensive documentation
- Migration guides for backend
- Contributing guidelines

## Tech Stack

- **Framework**: Next.js 15.3.3
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── contexts/         # React contexts (auth, etc.)
├── hooks/           # Custom React hooks
└── lib/             # Utility functions and data
docs/
├── filter-enhancement.md  # Multi-select filter documentation
└── type-safety-guide.md   # TypeScript best practices
```

## 📚 Documentation

- [Filter Enhancement Guide](docs/filter-enhancement.md) - Multi-select filters and enhanced search
- [Type Safety Guide](docs/type-safety-guide.md) - TypeScript best practices to prevent errors
- [Production-Ready Guide](docs/production-ready-guide.md) - All improvements and best practices
- [API Migration Guide](docs/api-migration-guide.md) - How to migrate to a backend API
- [Testing Guide](docs/testing-guide.md) - Testing strategies and examples
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building!

**New to the project?** Check out the [Quick Start Guide](QUICK_START.md) for a 3-minute setup!

## 🎨 Key Features Explained

### Multi-Select Filters
Select multiple mod types and rarities simultaneously for better build customization.

### Enhanced Search
Search by mod name, attributes, or effects - find exactly what you need.

### Safe Data Storage
All data is safely stored with error handling and automatic recovery.

### Error Boundaries
App never crashes - errors are caught and handled gracefully.

### Type Safety
Full TypeScript coverage ensures data integrity and prevents bugs.

## 🔄 Future Enhancements

Ready to scale? Check out our [API Migration Guide](docs/api-migration-guide.md) for:
- Backend API integration
- Database setup
- Authentication with JWT
- Real-time updates
- Cloud deployment

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT
