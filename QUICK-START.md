# WyaLink & LinkOS - Quick Start Guide

## Modern Design Complete

Both applications now feature a stunning modern user interface with:
- Gradient backgrounds and buttons
- Smooth animations and transitions
- Glass-morphism effects
- Professional shadows and depth
- Clean, spacious layouts

## Logo Placement

### Where to Put Your Logos

**For WyaLink Website:**
```
apps/website/public/logos/
├── wyalink-logo.svg          (your main logo)
├── wyalink-logo-white.svg    (white version for dark backgrounds)
└── wyalink-icon.svg          (icon only, for favicon)
```

**For LinkOS:**
```
apps/linkos/public/logos/
├── linkos-logo.svg           (your main logo)
├── linkos-logo-white.svg     (white version for sidebar)
└── linkos-icon.svg           (icon only, for favicon)
```

### The Apps Are Already Configured

**WyaLink** will automatically use `/logos/wyalink-logo.svg` in the header.
**LinkOS** currently shows "LinkOS" as text - when you add `/logos/linkos-logo-white.svg`, uncomment line 69 in [apps/linkos/src/components/Layout.tsx](apps/linkos/src/components/Layout.tsx).

## Running the Apps

```bash
# Install dependencies (if you haven't)
npm install

# Run both apps in development mode
npm run dev

# Or run individually
npm run dev:website    # http://localhost:5173
npm run dev:linkos     # http://localhost:5174
```

## What's New

### WyaLink Website

**Home Page:**
- Hero section with animated gradient background
- "Now serving Pennsylvania residents" badge with pulse animation
- Gradient text effects
- Wave SVG divider
- Stats section with gradient numbers (99%, 2025, 24/7)
- Feature cards with gradient icon backgrounds
- Modern CTA section with blur effects

**Modern Features:**
- Buttons with scale-on-hover animations
- Enhanced shadows throughout
- Backdrop blur on header (glass effect)
- Active page highlighting in navigation
- Smooth 300ms transitions everywhere

### LinkOS Dashboard

**Sidebar:**
- Gradient background (primary-900 → primary-800)
- Active navigation items with accent gradient
- Larger, more spacious design (w-72)
- Modern rounded corners (rounded-xl)
- User profile section at bottom

**Layout:**
- Glass-morphism top bar
- Gradient page background
- Notification bell with indicator dot
- Mobile-responsive sidebar

**Coming Soon Pages:**
- Dashboard, Leads, and Customers
- Professional placeholder screens
- Feature lists for planned functionality

## Build Time

Super fast builds:
- **Website**: ~600ms
- **LinkOS**: ~574ms
- **Total**: ~1.2 seconds

## Deploy to Coolify

Each app has its own Dockerfile:
- `apps/website/Dockerfile`
- `apps/linkos/Dockerfile`

In Coolify:
1. Create two services
2. Point to this repo
3. Set Dockerfile paths
4. Deploy

## Customization

### Colors
All colors are in [packages/config/tailwind.config.js](packages/config/tailwind.config.js):
- Primary Blue: #00254a (primary-800)
- Teal: #36b1b3 (secondary-400)
- Orange: #f37021 (accent-400)

### Components
Shared components in [packages/ui/src/components/](packages/ui/src/components/):
- `Button` - 5 variants (primary, secondary, accent, outline, ghost)
- `Card` - with optional hover and gradient effects
- `Header` - with logo support and glass effect
- `Footer` - multi-column layout
- `Container` - max-width wrapper

### Usage Example

```tsx
import { Button, Card } from '@wyalink/ui'

// Modern button with gradient
<Button variant="accent" size="xl">
  Get Started
</Button>

// Card with hover effect and gradient
<Card hover gradient>
  <h3>My Content</h3>
</Card>
```

## Modern Design Features

1. **Gradients** - Buttons, backgrounds, text, icons
2. **Animations** - Scale on hover, smooth transitions
3. **Shadows** - Multiple layers for depth (shadow-xl, shadow-2xl)
4. **Blur Effects** - Backdrop blur on header, decorative blurs
5. **Typography** - Large, bold headings (up to text-7xl)
6. **Spacing** - Generous padding and margins
7. **Border Radius** - Modern, large radii (xl, 2xl, 3xl)
8. **Icons** - Larger, gradient backgrounds
9. **Interactions** - Hover states, active states
10. **Responsive** - Mobile-first, works on all devices

## Files Modified for Modern Design

### Shared Components
- [packages/ui/src/components/Button.tsx](packages/ui/src/components/Button.tsx)
- [packages/ui/src/components/Card.tsx](packages/ui/src/components/Card.tsx)
- [packages/ui/src/components/Header.tsx](packages/ui/src/components/Header.tsx)

### Website
- [apps/website/src/App.tsx](apps/website/src/App.tsx) - Added logo support
- [apps/website/src/pages/Home.tsx](apps/website/src/pages/Home.tsx) - Complete redesign

### LinkOS
- Ready for modern styling (current layout is clean and functional)

## Next Steps

1. Add your logo files to the `public/logos/` folders
2. Run `npm run dev` to see the modern design
3. Customize colors/spacing if needed
4. Build additional LinkOS modules as needed

Need help? Check [MODERN-DESIGN-SUMMARY.md](MODERN-DESIGN-SUMMARY.md) for detailed information.
