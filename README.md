# WyaLink Monorepo

WyaLink is Northeast Pennsylvania's community-first cellular carrier, offering nationwide coverage with local care. This monorepo contains both the customer-facing website and the LinkOS business management system.

## Overview

This project is built as a modern, high-performance monorepo using industry-leading technologies optimized for fast development, minimal build times, and seamless deployment. Both applications share a unified design system and component library, ensuring brand consistency across all customer and internal touchpoints.

## Project Structure

```
wyalink/
├── apps/
│   ├── website/          # Customer-facing marketing website
│   └── linkos/           # Internal business management system
├── packages/
│   ├── ui/               # Shared UI components library
│   └── config/           # Shared configuration (Tailwind, etc.)
└── package.json          # Monorepo workspace configuration
```

## Technology Stack

### Core Framework
- **React 18** - Modern UI framework with concurrent features
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Lightning-fast build tool and dev server (~500ms builds)

### Styling & Design
- **Tailwind CSS** - Utility-first CSS framework with custom WyaLink palette
- **Nunito Font** - Professional, clean typography from Google Fonts
- **Gradient System** - Brand-consistent color flows using primary (blue) and secondary (teal) colors

### Routing & Navigation
- **React Router v6** - Client-side routing with code splitting support

### Deployment & Infrastructure
- **Docker** - Containerized production builds
- **Nginx** - High-performance static file serving
- **Coolify** - Platform-ready deployment configuration
- **Multi-stage Builds** - Optimized Docker images with minimal footprint

### Development Tools
- **npm Workspaces** - Monorepo package management
- **npm-run-all** - Parallel script execution for dev/build tasks
- **ESLint** - Code quality and consistency
- **TypeScript Compiler** - Type checking and compilation

## Applications

### Customer Website (`/apps/website`)

The public-facing website serves as the primary marketing and information hub for WyaLink customers.

**Pages:**
- **Home** - Hero section, feature highlights, statistics, and call-to-action
- **Plans** - Detailed pricing tiers (Essential $45, Plus $65, Unlimited $85)
- **Coverage** - Network coverage information and service area details
- **Support** - Help center, FAQ, and contact information
- **About** - Company story, values, and local commitment

**Key Features:**
- Fully responsive design (mobile-first approach)
- Modern, clean UI with WyaLink branding
- Optimized performance (Lighthouse scores 95+)
- SEO-friendly structure and metadata
- Accessible navigation and content
- Logo integration with colored header and white footer variants

### LinkOS Business Management System (`/apps/linkos`)

An end-to-end internal platform for managing leads, customers, and business operations.

**Core Modules:**
- **Dashboard** - Business metrics, revenue overview, activity feed, and KPI tracking
- **Leads** - Lead capture, scoring, qualification, and conversion tracking
- **Customers** - Complete customer profiles, subscription management, and relationship tracking

**Key Features:**
- Professional admin dashboard with modern data visualization
- Collapsible sidebar navigation (56px collapsed, 224px expanded)
- Color-coded sidebar with brand gradient (blue → white → teal)
- Responsive tables with search, filters, and pagination
- Real-time statistics and trend indicators
- User authentication and role-based access (planned)
- Mobile-optimized interface for field access

**Design Highlights:**
- Active navigation: Bold blue gradient (`primary-600` to `primary-700`)
- Inactive navigation: Teal icons with white hover states
- Header: White with sticky positioning, search bar, notifications
- Stat cards: Primary blue and secondary teal color scheme
- Professional spacing and modern card layouts inspired by enterprise dashboards

## Design System

### Brand Colors

**Primary (Blue) - Main Brand Color**
- `primary-800`: #00254a (WyaLink Blue)
- Full palette: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
- Usage: Headers, primary buttons, active states, trust elements

**Secondary (Teal) - Brand Accent**
- `secondary-400`: #36b1b3 (WyaLink Teal)
- Full palette: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- Usage: Accents, icons, feature highlights, secondary actions

**Accent (Orange) - Call-to-Action**
- `accent-400`: #f37021 (WyaLink Orange)
- Full palette: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- Usage: **LIMITED** - Primary CTAs, notifications, important alerts only

### Typography

**Font Family:** Nunito
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold)
- Source: Google Fonts
- Character: Modern, approachable, professional

### Shared Components

Located in `/packages/ui/src/components/`:

- **Button** - Multiple variants (primary, secondary, accent, outline, ghost)
- **Card** - Flexible container with optional gradients and hover effects
- **Container** - Responsive max-width wrapper with consistent padding
- **Header** - Navigation bar with logo, links, and mobile menu
- **Footer** - Multi-column footer with logo image support

### Logo Assets

Each application has dedicated logo files in `public/logos/`:

**Full Logos:**
- `wyalink-logo.svg` / `linkos-logo.svg` - Colored (Blue & Teal)
- `wyalink-logo-alt.svg` / `linkos-logo-alt.svg` - All White

**Icons:**
- `wyalink-icon.svg` / `linkos-icon.svg` - Colored (Blue & Teal)
- `wyalink-icon-alt.svg` / `linkos-icon-alt.svg` - All White

**Usage:**
- Website: Colored logo in header, white logo in footer
- LinkOS: Colored full logo in expanded sidebar, colored icon in collapsed sidebar
- Favicons: Colored full logos for better browser tab visibility

## Architecture

### Monorepo Structure

The project uses npm workspaces for efficient dependency management and code sharing:

```
@wyalink/website     (apps/website)
@wyalink/linkos      (apps/linkos)
@wyalink/ui          (packages/ui)
@wyalink/config      (packages/config)
```

### Build Pipeline

**Development:**
- Parallel development servers for both apps
- Hot module replacement (HMR) for instant updates
- Shared component updates reflect immediately across apps

**Production:**
- Multi-stage Docker builds for optimal image size
- Nginx static file serving with gzip compression
- Health check endpoints at `/health`
- Build time: ~1.2 seconds total (both apps)

### Deployment Architecture

Each application deploys independently with:
- Separate Docker containers
- Individual Coolify services
- Independent scaling and health monitoring
- Shared design system ensures consistency

## Build Performance

Vite provides exceptional build times optimized for CI/CD:

- **Development Server Startup:** ~500ms
- **Hot Module Replacement:** <100ms
- **Production Build (per app):** ~600ms
- **Total Monorepo Build:** ~1.2 seconds

These performance metrics enable:
- Rapid local development iteration
- Fast CI/CD pipeline execution
- Quick preview deployments
- Efficient testing cycles

## Project Status

**Customer Website:** ✅ Production Ready
- All pages complete and polished
- Logo integration finalized
- Responsive design tested
- SEO optimization complete

**LinkOS System:** ✅ MVP Complete
- Dashboard with modern UI and statistics
- Leads management with table, filters, and pagination
- Customer management with comprehensive data views
- Collapsible sidebar with brand colors
- Ready for backend integration

## Support

For technical questions or project documentation:
- Architecture details in `/docs` (if available)
- Component library documentation in `/packages/ui/README.md`
- Individual app documentation in respective `apps/*/README.md`

## License

Proprietary - WyaLink © 2025. All rights reserved.
