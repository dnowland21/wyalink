# WyaLink Platform - Technical Documentation

> **Note:** This page is intended for the WyaLink wiki. Copy the content below to your wiki platform.

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Applications](#applications)
5. [Design System](#design-system)
6. [Development Workflow](#development-workflow)
7. [Deployment](#deployment)
8. [Performance](#performance)
9. [Security Considerations](#security-considerations)
10. [Future Roadmap](#future-roadmap)

---

## Platform Overview

The WyaLink platform consists of two primary applications built in a unified monorepo architecture:

### Customer Website
Public-facing marketing website showcasing WyaLink's cellular service offerings, coverage information, and customer support resources.

**URL Pattern:** `www.wyalink.com` (or configured domain)

### LinkOS Business Management System
Internal operations platform for managing leads, customer relationships, and business analytics. Designed for daily use by WyaLink employees.

**URL Pattern:** `linkos.wyalink.com` (or configured domain)

### Unified Approach
Both applications share a common design system, component library, and brand guidelines to ensure consistency across all customer and internal touchpoints.

---

## Architecture

### Monorepo Structure

The platform is built as a monorepo using npm workspaces:

```
wyalink/
├── apps/
│   ├── website/              # Customer-facing website
│   │   ├── src/
│   │   │   ├── pages/        # Page components (Home, Plans, Coverage, etc.)
│   │   │   ├── App.tsx       # Main app with routing
│   │   │   └── main.tsx      # Entry point
│   │   ├── public/
│   │   │   └── logos/        # WyaLink logo assets
│   │   ├── Dockerfile        # Production container
│   │   ├── nginx.conf        # Web server config
│   │   └── package.json
│   │
│   └── linkos/               # Business management system
│       ├── src/
│       │   ├── pages/        # Dashboard, Leads, Customers
│       │   ├── components/   # Layout (sidebar, header)
│       │   ├── App.tsx       # Main app with routing
│       │   └── main.tsx      # Entry point
│       ├── public/
│       │   └── logos/        # LinkOS logo assets
│       ├── Dockerfile        # Production container
│       ├── nginx.conf        # Web server config
│       └── package.json
│
├── packages/
│   ├── ui/                   # Shared component library
│   │   ├── src/
│   │   │   └── components/   # Button, Card, Header, Footer, etc.
│   │   └── package.json      # @wyalink/ui
│   │
│   └── config/               # Shared configuration
│       ├── tailwind.config.js  # Brand colors, typography
│       └── package.json        # @wyalink/config
│
└── package.json              # Root workspace configuration
```

### Application Flow

**Customer Website:**
```
User → Nginx → React SPA → Static Pages
                         → React Router (client-side navigation)
                         → Shared UI Components
```

**LinkOS System:**
```
Employee → Nginx → React SPA → Dashboard/Leads/Customers
                             → Sidebar Navigation
                             → Data Tables & Filters
                             → Shared UI Components
                             → (Future: API Integration)
```

---

## Technology Stack

### Frontend Framework
- **React 18** - Component-based UI library with hooks and concurrent features
- **TypeScript** - Static typing for improved code quality and developer experience
- **React Router v6** - Declarative routing with nested routes support

### Build & Development
- **Vite** - Next-generation frontend tooling with instant HMR
  - Dev server startup: ~500ms
  - Hot Module Replacement: <100ms
  - Production build: ~600ms per app
- **npm Workspaces** - Monorepo package management without external tools

### Styling
- **Tailwind CSS** - Utility-first CSS framework
  - Custom WyaLink color palette integration
  - Responsive design utilities
  - JIT (Just-In-Time) compilation for optimal bundle size
- **Google Fonts (Nunito)** - Professional, modern typography

### Deployment
- **Docker** - Containerization for consistent environments
- **Nginx** - High-performance static file serving
  - Gzip compression
  - Client-side routing fallback
  - Security headers
  - Health check endpoints
- **Coolify** - Self-hosted PaaS for easy deployment

### Development Tools
- **ESLint** - Code linting and style enforcement
- **TypeScript Compiler** - Type checking during build
- **npm-run-all** - Parallel script execution

---

## Applications

### Customer Website

#### Pages & Features

**Home Page**
- Hero section with brand messaging and CTA
- Feature grid highlighting WyaLink's value propositions
- Statistics showcase (customers, coverage, satisfaction)
- Call-to-action sections with plan links

**Plans Page**
- Three pricing tiers: Essential ($45), Plus ($65), Unlimited ($85)
- Feature comparison table
- Highlighted "Most Popular" tier
- Clear pricing and data limits

**Coverage Page**
- Network coverage information
- Service area details (Northeast Pennsylvania)
- Coverage map placeholder
- Partnership information (T-Mobile network)

**Support Page**
- FAQ section
- Contact information
- Help resources
- Support hours

**About Page**
- Company mission and values
- Local commitment messaging
- Team information (placeholder)
- Community engagement

#### Technical Features
- Fully responsive (mobile, tablet, desktop)
- SEO-optimized metadata and structure
- Accessible navigation with ARIA labels
- Logo variants: colored header, white footer
- Fast page load times (<1s on broadband)

---

### LinkOS Business Management System

#### Core Modules

**Dashboard**
- **4 KPI Cards:**
  - Total Customers: 2,847 (+12.5%)
  - Active Leads: 486 (+8.2%)
  - Monthly Revenue: $84,200 (+15.3%)
  - Conversion Rate: 68.4% (+3.1%)

- **Revenue Overview:** Chart placeholder (2/3 width) with time period selector
- **Top Plans Widget:** Progress bars for Unlimited, Plus, Essential subscriptions
- **Recent Activity Feed:** Customer and lead activities with timestamps

**Leads Management**
- **Statistics Grid:**
  - Total Leads: 486
  - Qualified: 234 (48%)
  - In Progress: 142 (29%)
  - Converted: 110

- **Leads Table:**
  - Columns: Name, Contact (email/phone), Status, Source, Score, Last Contact
  - Search functionality
  - Status filter dropdown
  - Avatar generation from initials
  - Color-coded status badges
  - Lead scoring with color indicators
  - Action buttons: View, Edit
  - Pagination controls

**Customer Management**
- **Statistics Grid:**
  - Total Customers: 2,847
  - Active: 2,683 (94%)
  - New This Month: 142
  - Churned: 164 (6% churn rate)

- **Customer Table:**
  - Columns: Customer, Contact, Plan, Status, Joined Date, Monthly Value
  - Search functionality
  - Plan and status filter dropdowns
  - Avatar generation
  - Plan badges (Unlimited, Plus, Essential)
  - Status indicators (Active, Suspended, Cancelled)
  - Action buttons: View, Edit
  - Pagination controls

#### UI Components

**Collapsible Sidebar**
- **Expanded State (224px width):**
  - Full LinkOS logo
  - Text navigation labels
  - Collapse button (top right)

- **Collapsed State (80px width):**
  - Large clickable icon (48px)
  - Icon-only navigation with tooltips
  - Vertical indicator bar for active page
  - Click icon to expand

- **Visual Design:**
  - Background: Gradient from blue (top) → white (middle) → teal (bottom)
  - Active item: Bold blue gradient with white text
  - Inactive items: Teal icons, hover to white background
  - Smooth 300ms transition animation

**Header Bar**
- **Left Side:**
  - Mobile menu toggle
  - Search bar with icon (max-width: 448px)

- **Right Side:**
  - Notifications bell with orange badge
  - User menu with avatar and dropdown

- **Dropdown Menu:**
  - User info display
  - Profile Settings
  - Preferences
  - Sign Out (red text)

**Data Tables**
- Hover effects on rows
- Sortable columns (future)
- Action buttons with icon tooltips
- Status badges with color coding
- Responsive horizontal scrolling
- Pagination with page numbers

---

## Design System

### Brand Identity

**Mission:** Northeast Pennsylvania's community-first cellular carrier

**Visual Principles:**
- Clean and modern
- Professional yet approachable
- Trust and reliability
- Local community connection

### Color Palette

**Primary (Blue) - Trust & Reliability**
```
50:  #e6f0ff
100: #cce0ff
200: #99c2ff
300: #66a3ff
400: #3385ff
500: #0066ff
600: #0052cc (primary-600)
700: #003d99
800: #00254a (primary-800 - Main Brand Color)
900: #001a33
950: #000d1a
```

**Secondary (Teal) - Innovation & Growth**
```
50:  #e6f7f7
100: #ccefef
200: #99dfdf
300: #66cfcf
400: #36b1b3 (secondary-400 - Main Accent)
500: #2d9799
600: #247a7c
700: #1b5c5e
800: #123d3f
900: #091f20
```

**Accent (Orange) - Call-to-Action**
```
50:  #fff3e6
100: #ffe7cc
200: #ffcf99
300: #ffb766
400: #f37021 (accent-400 - Main CTA)
500: #e65100
600: #cc4700
700: #993600
800: #662400
900: #331200
```

**Usage Guidelines:**
- Primary (Blue): Headers, primary buttons, navigation active states, trusted elements
- Secondary (Teal): Icons, feature highlights, secondary actions, progress indicators
- Accent (Orange): **LIMITED USE** - Primary CTAs, notification badges, urgent alerts only

### Typography

**Font Family:** Nunito

**Weights & Usage:**
- 300 (Light): Subtle text, captions
- 400 (Regular): Body text, descriptions
- 500 (Medium): Labels, form inputs
- 600 (Semi-Bold): Subheadings, card titles
- 700 (Bold): Headings, emphasis
- 800 (Extra-Bold): Hero text, major headings

**Scale:**
- Display: 3xl-4xl (hero sections)
- Headings: xl-2xl (page titles)
- Subheadings: lg (section titles)
- Body: base-sm (content)
- Small: xs (captions, labels)

### Logo Assets

**Available Files:**

| Asset | Type | Colors | Usage |
|-------|------|--------|-------|
| `wyalink-logo.svg` | Full Logo | Blue & Teal | Website header, light backgrounds |
| `wyalink-logo-alt.svg` | Full Logo | White | Website footer, dark backgrounds |
| `wyalink-icon.svg` | Icon | Blue & Teal | Favicons, collapsed UI elements |
| `wyalink-icon-alt.svg` | Icon | White | Dark background icons |
| `linkos-logo.svg` | Full Logo | Blue & Teal | LinkOS sidebar (expanded), favicons |
| `linkos-logo-alt.svg` | Full Logo | White | Dark backgrounds |
| `linkos-icon.svg` | Icon | Blue & Teal | LinkOS sidebar (collapsed) |
| `linkos-icon-alt.svg` | Icon | White | Dark background icons |

**Logo Usage Rules:**
- Always use SVG format when possible (scalability)
- Maintain aspect ratio (never stretch)
- Minimum size: 24px height for icons, 32px height for full logos
- Clear space: Minimum padding equal to the height of the "W" or icon

### Component Library

**Location:** `packages/ui/src/components/`

**Available Components:**

1. **Button**
   - Variants: primary, secondary, accent, outline, ghost
   - Sizes: sm, md, lg, xl
   - Features: Gradient backgrounds, hover effects, disabled states

2. **Card**
   - Optional gradient background
   - Hover effects with shadow
   - Rounded corners (2xl)
   - Flexible padding

3. **Container**
   - Max-width constraints (7xl = 1280px)
   - Responsive padding
   - Centered content

4. **Header**
   - Logo image support
   - Navigation links with active states
   - Mobile hamburger menu
   - Optional CTA button
   - Sticky positioning

5. **Footer**
   - Multi-column layout
   - Logo image support
   - Section-based link organization
   - Copyright text
   - Gradient background (primary-900 to primary-950)

**Importing Components:**
```typescript
import { Button, Card, Header, Footer } from '@wyalink/ui'
```

---

## Development Workflow

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 9+
- Git
- Docker (for production testing)

### Local Development

**Install Dependencies:**
```bash
npm install
```

**Run Development Servers:**
```bash
# Both apps in parallel
npm run dev

# Individual apps
npm run dev:website  # http://localhost:5173
npm run dev:linkos   # http://localhost:5174
```

**Build for Production:**
```bash
# Both apps
npm run build

# Individual apps
npm run build:website
npm run build:linkos
```

**Preview Production Build:**
```bash
# Both apps
npm run preview

# Individual apps
npm run preview:website  # http://localhost:4173
npm run preview:linkos   # http://localhost:4174
```

### Adding New Features

**New Page (Example: Settings page in LinkOS):**

1. Create component: `apps/linkos/src/pages/Settings.tsx`
2. Add route in `apps/linkos/src/App.tsx`:
   ```typescript
   <Route path="/settings" element={<Settings />} />
   ```
3. Update sidebar navigation in `apps/linkos/src/components/Layout.tsx`

**New Shared Component:**

1. Create in `packages/ui/src/components/MyComponent.tsx`
2. Export from `packages/ui/src/index.ts`:
   ```typescript
   export { MyComponent } from './components/MyComponent'
   ```
3. Use in any app:
   ```typescript
   import { MyComponent } from '@wyalink/ui'
   ```

### Code Quality

**Type Checking:**
```bash
# Run TypeScript compiler
npm run build
```

**Best Practices:**
- Use TypeScript for all new code
- Follow existing component patterns
- Maintain responsive design (mobile-first)
- Test on multiple screen sizes
- Keep accessibility in mind (ARIA labels, keyboard navigation)

---

## Deployment

### Docker Build

**Website:**
```bash
docker build -f apps/website/Dockerfile -t wyalink-website .
docker run -p 3000:80 wyalink-website
```

**LinkOS:**
```bash
docker build -f apps/linkos/Dockerfile -t wyalink-linkos .
docker run -p 3001:80 wyalink-linkos
```

### Coolify Deployment

**Step-by-Step:**

1. **Create New Service**
   - Log into Coolify dashboard
   - Click "New Resource" → "Service"
   - Select "Git Repository"

2. **Configure Repository**
   - Connect your Git provider (GitHub, GitLab, etc.)
   - Select the WyaLink repository
   - Choose the branch to deploy (e.g., `main`)

3. **Website Configuration**
   - Dockerfile Path: `apps/website/Dockerfile`
   - Port: `80`
   - Health Check: `/health`
   - Domain: `www.wyalink.com` (or your domain)

4. **LinkOS Configuration**
   - Dockerfile Path: `apps/linkos/Dockerfile`
   - Port: `80`
   - Health Check: `/health`
   - Domain: `linkos.wyalink.com` (or your subdomain)

5. **Deploy**
   - Click "Deploy"
   - Monitor build logs
   - Verify health checks pass

### Environment Variables

**Current Setup:**
- No environment variables required (static sites)

**Future (with backend integration):**
- `VITE_API_URL` - Backend API endpoint
- `VITE_AUTH_DOMAIN` - Authentication provider
- Add to Coolify service configuration

### Health Checks

Both applications include health check endpoints at `/health` that return `200 OK`. This allows Coolify and monitoring tools to verify the application is running correctly.

---

## Performance

### Build Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Website Build | <1s | ~640ms |
| LinkOS Build | <1s | ~660ms |
| Total Monorepo Build | <2s | ~1.3s |
| Dev Server Startup | <1s | ~500ms |
| HMR Update | <200ms | <100ms |

### Production Bundle Sizes

**Website:**
- HTML: ~0.9KB
- CSS: ~31KB (gzipped: ~5.2KB)
- JavaScript: ~197KB (gzipped: ~61KB)
- Total (gzipped): ~67KB

**LinkOS:**
- HTML: ~0.85KB
- CSS: ~29KB (gzipped: ~5KB)
- JavaScript: ~197KB (gzipped: ~59KB)
- Total (gzipped): ~65KB

### Performance Optimizations

- **Code Splitting:** React Router lazy loading (future)
- **Image Optimization:** SVG logos for zero-cost scalability
- **CSS Purging:** Tailwind JIT removes unused styles
- **Gzip Compression:** Nginx compresses all text assets
- **Asset Caching:** Long-term cache headers for static assets
- **Minimal Dependencies:** Only essential packages included

### Lighthouse Scores (Target)

- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

---

## Security Considerations

### Current Implementation

**Static Sites:**
- No server-side code execution
- No database connections
- No user authentication (yet)
- Read-only deployments

**Nginx Configuration:**
- Security headers (X-Frame-Options, etc.)
- HTTPS enforcement (configured in Coolify)
- No directory listing
- Custom error pages

### Future Security Requirements

**When Adding Backend:**
- [ ] JWT-based authentication
- [ ] Role-based access control (RBAC)
- [ ] API rate limiting
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens

**LinkOS Access:**
- [ ] VPN requirement for remote access
- [ ] Multi-factor authentication (MFA)
- [ ] Session timeout (15-30 minutes)
- [ ] Audit logging for all actions

---

## Future Roadmap

### Short-Term (Q1-Q2 2025)

**Backend Integration:**
- [ ] REST API development (Node.js/Express or similar)
- [ ] PostgreSQL database setup
- [ ] Authentication system (JWT)
- [ ] API documentation (OpenAPI/Swagger)

**LinkOS Enhancements:**
- [ ] Real lead and customer data integration
- [ ] Advanced filtering and search
- [ ] Data export functionality (CSV, PDF)
- [ ] Chart library integration (Chart.js or Recharts)
- [ ] Sortable table columns
- [ ] Bulk actions (delete, export, update status)

**Customer Website:**
- [ ] Contact form with email integration
- [ ] Live chat support widget
- [ ] Blog/news section
- [ ] Store locator with map integration

### Mid-Term (Q3-Q4 2025)

**Analytics & Reporting:**
- [ ] Google Analytics integration
- [ ] Custom dashboard widgets
- [ ] Automated reports (daily, weekly, monthly)
- [ ] Revenue forecasting

**Customer Portal:**
- [ ] Customer login system
- [ ] Account management
- [ ] Usage tracking and billing
- [ ] Plan upgrade/downgrade flows
- [ ] Support ticket system

**LinkOS Advanced Features:**
- [ ] Task management and reminders
- [ ] Email and SMS integration
- [ ] Notes and communication history
- [ ] Document upload and management
- [ ] Advanced lead scoring algorithms

### Long-Term (2026+)

**Mobile Applications:**
- [ ] Customer mobile app (React Native)
- [ ] Employee mobile app for field operations
- [ ] Offline mode support

**AI & Automation:**
- [ ] Lead scoring predictions
- [ ] Churn risk analysis
- [ ] Automated follow-up reminders
- [ ] Chatbot for customer support

**Expansion:**
- [ ] Multi-location support
- [ ] Franchise management tools
- [ ] Partner portal
- [ ] API for third-party integrations

---

## Support & Resources

### Internal Documentation
- Component library: `/packages/ui/README.md`
- Individual app documentation: `/apps/*/README.md`
- Architecture diagrams: `/docs/architecture/` (future)

### External Resources
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)

### Team Contacts
- Development Team: [Add contact info]
- DevOps/Deployment: [Add contact info]
- Design Team: [Add contact info]

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** Production Ready (MVP)

---

© 2025 WyaLink. All rights reserved. Proprietary and confidential.

**Designed & Maintained by WyaCore, LLC for WyaLink with support from Claude**
