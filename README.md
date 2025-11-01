# LG QAMS

A modern, clean, and modular pure JavaScript front-end project built with Vite.

## Features

- 🚀 **Vite** - Lightning fast build tool and dev server
- 📦 **Pure JavaScript** - No frameworks, just vanilla JS with ES modules
- 🎨 **Modular Architecture** - Organized structure with pages, components, and utils
- 🎨 **Flowbite Design System** - Complete design system with colors, typography, spacing, and components
- 🛠️ **Development Tools** - ESLint and Prettier configured
- 🎯 **Clean Code** - Maintainable and easy to understand

## Project Structure

```
lg-qams/
├── index.html              # Entry HTML file
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js            # Application entry point
│   ├── pages/             # HTML pages
│   │   ├── home.html
│   │   └── about.html
│   ├── components/        # Reusable components (HTML/CSS/JS)
│   │   ├── header/
│   │   │   ├── header.html
│   │   │   ├── header.css
│   │   │   └── header.js
│   │   └── button/
│   │       ├── button.html
│   │       ├── button.css
│   │       └── button.js
│   ├── routes.js          # Route configuration
│   ├── utils/             # Utility functions
│   │   ├── dom.js         # DOM manipulation utilities
│   │   ├── api.js         # API utilities
│   │   ├── app.js         # Application initialization
│   │   ├── router.js      # Router implementation
│   │   └── navigation.js  # Navigation helpers
│   ├── styles/
│   │   ├── main.css           # Global stylesheet
│   │   ├── variables.css      # CSS variables (backward compatibility)
│   │   ├── flowbite-tokens.css # Flowbite design tokens
│   │   └── flowbite.css       # Flowbite component styles
│   └── assets/            # Static assets (images, etc.)
└── public/                # Public assets served as-is
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Path Aliases

The project uses path aliases configured in `vite.config.js` for cleaner imports:

- `@/` - `src/`
- `@pages/` - `src/pages/`
- `@components/` - `src/components/`
- `@utils/` - `src/utils/`
- `@styles/` - `src/styles/`
- `@assets/` - `src/assets/`

## Flowbite Design System

This project uses **Flowbite design system** with regular CSS (no Tailwind). All Flowbite design tokens are available as CSS variables.

### Design Tokens

All Flowbite design tokens are available in `src/styles/flowbite-tokens.css`:

- **Colors**: Complete color palette (blue, gray, green, red, yellow, purple, pink) with semantic aliases
- **Typography**: Font families, sizes, weights, line heights, letter spacing
- **Spacing**: Consistent spacing scale (0.25rem to 8rem)
- **Border Radius**: Rounded corners scale
- **Shadows**: Shadow utilities
- **Transitions**: Transition timing functions
- **Z-Index**: Layering scale

### Using Flowbite Tokens

Use CSS variables in your styles:

```css
.my-element {
  color: var(--flowbite-primary);
  padding: var(--flowbite-space-4);
  border-radius: var(--flowbite-radius-lg);
  font-size: var(--flowbite-text-lg);
}
```

### Flowbite Components

Pre-built component styles are available in `src/styles/flowbite.css`:

- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn-warning`, `.btn-outline`
- **Navbar**: `.navbar`, `.navbar-container`, `.navbar-brand`, `.navbar-menu`, `.navbar-link`
- **Cards**: `.card`, `.card-header`, `.card-body`, `.card-footer`
- **Forms**: `.form-input`, `.form-label`

### Flowbite JavaScript

Flowbite JavaScript is initialized automatically. Interactive components (modals, dropdowns, tooltips) are available through Flowbite's JavaScript API.

See [Flowbite Documentation](https://flowbite.com/docs/getting-started/introduction/) for component usage.

## Code Style

- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting

Run linting and formatting:

```bash
npm run lint
npm run format
```

## Adding New Components

1. Create a new folder in `src/components/`
2. Add `component-name.html`, `component-name.css`, and `component-name.js`
3. Import and use in your pages or main app

## Adding New Pages

1. Create a new HTML file in `src/pages/`
2. Add a route in `src/routes.js`
3. Link to it from navigation using `data-router` attribute

## Routing

The project includes a client-side router using the History API:

- **Routes** - Defined in `src/routes.js`
- **Router** - Core router implementation in `src/utils/router.js`
- **Navigation** - Helper utilities in `src/utils/navigation.js`

### Adding Routes

Edit `src/routes.js` to add new routes:

```javascript
router.addRoute('/path', {
  page: '/src/pages/page.html',
  title: 'Page Title',
  meta: { description: 'Page description' },
});
```

### Navigation

Use `data-router` attribute on links for client-side navigation:

```html
<a href="/about" data-router>About</a>
```

Or use programmatic navigation:

```javascript
import { navigate } from './utils/navigation.js';
navigate('/about');
```

### Route Hooks

Routes support before/after navigation hooks:

```javascript
router.addRoute('/admin', {
  page: '/src/pages/admin.html',
  beforeEnter: async (to, from) => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/login');
      return false; // Prevent navigation
    }
  },
  afterEnter: (to, from) => {
    // Analytics, cleanup, etc.
  },
});
```

## Utilities

The `src/utils/` directory contains reusable utility functions:

- `dom.js` - DOM manipulation helpers
- `api.js` - HTTP request helpers
- `app.js` - Application initialization
- `router.js` - Client-side router implementation
- `navigation.js` - Navigation helper functions

## License

ISC
