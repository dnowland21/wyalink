# LinkOS Shell

Complete starter template with the WyaLink Design System, navigation, and example pages.

## What's Included

- Complete WyaLink Design System (shadcn/ui components)
- WyaLink brand colors (Blue #00254a, Teal #36b1b3, Orange #f37021)
- Messaging colors with shade variations (Success, Error, Warning, Info)
- All UI components: Button, Card, Input, Badge, Table
- Collapsible sidebar navigation
- Responsive layout with header
- Example pages demonstrating the design system
- Lucide React icons
- Tailwind CSS configuration
- React Router setup
- TypeScript support

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (runs on port 5175)
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Features

### Collapsible Sidebar Navigation
- Fully responsive sidebar with gradient background
- Collapsible to icon-only view
- Active state highlighting
- Smooth transitions

### Example Pages
- **Dashboard** - Stats overview with cards and activity feed
- **Products** - Product catalog with table and badges
- **Customers** - Customer management interface
- **Orders** - Order tracking and status
- **Settings** - Application settings forms
- **Design System** - Complete component showcase

### Design System
Navigate to `/design` to view the complete WyaLink Design System showcase with all components, colors, and usage examples.

## Project Structure

```
linkos-shell/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components (Badge, Button, Card, Input)
│   │   └── Layout.tsx   # Main layout with sidebar navigation
│   ├── lib/
│   │   └── utils.ts     # Utility functions
│   ├── pages/
│   │   ├── Dashboard.tsx      # Dashboard example
│   │   ├── Products.tsx       # Products example
│   │   ├── Customers.tsx      # Customers example
│   │   ├── Orders.tsx         # Orders example
│   │   ├── Settings.tsx       # Settings example
│   │   └── DesignSystem.tsx   # Design system showcase
│   ├── App.tsx          # Main app with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles with WyaLink design tokens
├── index.html
├── package.json
├── tailwind.config.js   # Tailwind configuration with WyaLink colors
├── tsconfig.json
└── vite.config.ts
```

## Using This as a Starter

This shell provides a complete foundation for building new WyaLink applications:

1. **Copy this directory** to your workspace
2. **Rename** it for your new project
3. **Update** package.json name and description
4. **Customize** the navigation in `src/components/Layout.tsx`
5. **Replace** example pages with your own features
6. **Start building** using the included design system

All components are ready to use and follow the WyaLink brand guidelines.

## Customization

### Adding New Pages
1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx`

### Modifying Navigation
Edit `src/components/Layout.tsx` to add, remove, or reorganize navigation items.

### Styling
- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Use Tailwind classes with WyaLink design tokens
