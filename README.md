# AbyssBuilder

A Next.js application for creating and sharing character/weapon builds.

## Features

- 🎮 Create and manage builds for characters and weapons
- 🔧 Customize builds with mods and support items
- 👥 Team setup with support characters and weapons
- 📝 Write guides for your builds
- 💾 Local storage - all data stored in your browser
- 🎨 Beautiful UI with Radix UI + Tailwind CSS
- 📱 Responsive design
- ✨ Smooth page transitions with accessibility support
- ♿ Full accessibility compliance (WCAG 2.1)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/abyssbuilder.git
cd abyssbuilder
```

2. Install dependencies
```bash
npm install
```

3. Copy environment file
```bash
cp .env.example .env.local
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Tech Stack

- **Framework**: Next.js 15.3.3
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Storage**: Browser Local Storage

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── contexts/         # React contexts
├── hooks/           # Custom React hooks
└── lib/             # Utility functions and data
```

## How It Works

All data is stored locally in your browser's Local Storage. This means:
- No backend server required
- No database setup needed
- Data persists in your browser
- Each browser has its own data

## Accessibility

This application is built with accessibility in mind:
- **Keyboard Navigation**: Full keyboard support throughout the application
- **Screen Reader Support**: ARIA labels and live regions for important updates
- **Reduced Motion**: Respects `prefers-reduced-motion` system preference
- **Focus Management**: Proper focus handling during page transitions
- **Color Contrast**: WCAG 2.1 AA compliant color schemes

## Recent Updates

### Page Rendering Fix (November 2024)
Fixed critical issue where pages would not display content when navigating through menus. The solution includes:
- Enhanced page transition animations with fallback mechanisms
- Error boundary for graceful degradation
- Improved accessibility features
- Comprehensive testing coverage

See [CHANGELOG.md](CHANGELOG.md) for detailed information.

## License

MIT
