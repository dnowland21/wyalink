# Logo Asset Guide

## Logo Placement Structure

### For WyaLink Website
Place logo files in: `/apps/website/public/logos/`

**Recommended files:**
- `wyalink-logo.svg` - Main logo (color)
- `wyalink-logo-white.svg` - White version for dark backgrounds
- `wyalink-icon.svg` - Icon/mark only (for favicon, mobile)
- `wyalink-wordmark.svg` - Text only version

### For LinkOS
Place logo files in: `/apps/linkos/public/logos/`

**Recommended files:**
- `linkos-logo.svg` - Main logo (color)
- `linkos-logo-white.svg` - White version for dark backgrounds
- `linkos-icon.svg` - Icon/mark only (for favicon, mobile)

## Favicon Setup

Place favicons in the `/public` folder of each app:
- `favicon.ico` - Standard favicon
- `favicon.svg` - SVG favicon (modern browsers)
- `apple-touch-icon.png` - iOS home screen (180x180)

## File Formats

**Preferred:**
- SVG for all logos (scalable, small file size)
- PNG with transparency for raster needs (2x and 3x versions for retina)

**Sizes for PNG (if needed):**
- Logo: 200h, 400h (2x), 600h (3x)
- Icon: 64x64, 128x128, 256x256

## Usage in Code

### Website
```tsx
import logo from '/logos/wyalink-logo.svg'
// Or for public folder access
<img src="/logos/wyalink-logo.svg" alt="WyaLink" />
```

### LinkOS
```tsx
import logo from '/logos/linkos-logo.svg'
// Or for public folder access
<img src="/logos/linkos-logo.svg" alt="LinkOS" />
```

## Brand Colors Reference

Use these in your logo files:
- Primary Blue: #00254a
- Teal: #36b1b3
- Orange: #f37021

## Directory Structure After Logo Placement

```
apps/website/public/
├── logos/
│   ├── wyalink-logo.svg
│   ├── wyalink-logo-white.svg
│   ├── wyalink-icon.svg
│   └── wyalink-wordmark.svg
├── favicon.ico
├── favicon.svg
└── apple-touch-icon.png

apps/linkos/public/
├── logos/
│   ├── linkos-logo.svg
│   ├── linkos-logo-white.svg
│   └── linkos-icon.svg
├── favicon.ico
├── favicon.svg
└── apple-touch-icon.png
```
