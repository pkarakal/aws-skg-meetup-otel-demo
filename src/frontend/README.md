# Frontend Service

A modern e-commerce web application built with Next.js 14, featuring server-side rendering, client-side state
management, and full OpenTelemetry instrumentation.

## Overview

The Frontend service provides the user interface for the e-commerce platform. It communicates with backend services (
Cart, Catalog, Checkout) to display products, manage shopping carts, and process orders.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)
- **Theming**: next-themes (dark/light mode)
- **Observability**: OpenTelemetry (Node.js + Web instrumentation)

## Architecture

```
frontend/
├── app/                     # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page
│   ├── error.tsx           # Global error boundary
│   ├── about/
│   │   └── page.tsx        # About page
│   ├── shop/
│   │   ├── page.tsx        # Product catalog page
│   │   ├── loading.tsx     # Loading state
│   │   └── error.tsx       # Error boundary
│   └── checkout/
│       ├── page.tsx        # Checkout page
│       └── error.tsx       # Error boundary
├── components/              # Reusable UI components
│   └── ui/                 # Radix UI-based components
├── services/               # API service clients
│   ├── catalog.ts          # Catalog service client
│   ├── cart.ts             # Cart service client
│   └── checkout.ts         # Checkout service client
├── lib/                    # Utility functions
├── stores/                 # Zustand state stores
├── instrumentation.js      # OpenTelemetry Node.js setup
└── public/                 # Static assets
```

## Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun
- Docker (optional, for containerized development)

## Configuration

### Environment Variables

Create a `.env.local` file or set environment variables:

| Variable                        | Description              | Default               |
|---------------------------------|--------------------------|-----------------------|
| `CATALOG_SERVICE_ADDR`          | Catalog service URL      | http://localhost:8080 |
| `CART_SERVICE_ADDR`             | Cart service URL         | http://localhost:8081 |
| `CHECKOUT_SERVICE_ADDR`         | Checkout service URL     | http://localhost:8082 |
| `OTEL_EXPORTER_OTLP_ENDPOINT`   | OTLP endpoint            | http://localhost:4317 |
| `NEXT_PUBLIC_OTEL_SERVICE_NAME` | Service name for tracing | frontend              |

### Example `.env.local`

```env
CATALOG_SERVICE_ADDR=http://localhost:8080
CART_SERVICE_ADDR=http://localhost:8081
CHECKOUT_SERVICE_ADDR=http://localhost:8082
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

## Running Locally

### Development Mode

```bash
cd src/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Building

```bash
# Production build
npm run build

# Docker image
docker build -t frontend:latest .
```

## Pages

| Route       | Description                                    |
|-------------|------------------------------------------------|
| `/`         | Home page with featured content                |
| `/shop`     | Product catalog with add-to-cart functionality |
| `/checkout` | Shopping cart review and order placement       |
| `/about`    | About page                                     |

## Features

### Product Catalog (`/shop`)

- Browse products from the Catalog service
- View product details (name, description, price, images)
- Add items to cart
- Loading and error states

### Shopping Cart

- Persistent cart state via Zustand
- Add/remove items
- Update quantities
- Cart total calculation

### Checkout (`/checkout`)

- Review cart contents
- Enter shipping information
- Process order through Checkout service
- Order confirmation

### Theme Support

- Light and dark mode via next-themes
- System preference detection
- Persistent theme selection

## API Services

The frontend communicates with backend services through wrapper functions in `services/`:

### Catalog Service (`services/catalog.ts`)

```typescript
// Fetch all products
getProducts(): Promise<Product[]>

// Fetch single product
getProduct(id: string): Promise<Product>
```

### Cart Service (`services/cart.ts`)

```typescript
// Get user's cart
getCart(userId: string): Promise<Cart>

// Add item to cart
addToCart(userId: string, item: CartItem): Promise<void>

// Remove item from cart
removeFromCart(userId: string, itemId: string): Promise<void>
```

### Checkout Service (`services/checkout.ts`)

```typescript
// Process checkout
processCheckout(userId: string, data: CheckoutData): Promise<Order>
```

## Observability

### Node.js Instrumentation

Server-side instrumentation is configured in `instrumentation.js` and loaded via `NODE_OPTIONS`:

- HTTP client tracing (fetch to backend services)
- Next.js middleware tracing
- Server component rendering

### Browser Instrumentation

Client-side instrumentation includes:

- Page load performance
- User interactions
- Client-side fetch calls

### Exported Telemetry

- **Traces**: Distributed tracing across frontend and backend services
- **Metrics**: Web vitals, request counts, latencies

Telemetry is exported via OTLP to the configured collector.

## Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## UI Components

The project uses Radix UI primitives with custom styling:

- `Button` - Primary/secondary buttons
- `DropdownMenu` - Navigation menus
- `Label` - Form labels
- `NavigationMenu` - Site navigation
- `Tooltip` - Hover tooltips

Components are styled with Tailwind CSS and `class-variance-authority` for variant management.

## State Management

Zustand stores manage client-side state:

- **Cart Store**: Shopping cart items, totals, add/remove actions
- **Theme Store**: Theme preference (handled by next-themes)

## Forms

Forms use React Hook Form with Zod schema validation:

- Type-safe form handling
- Declarative validation rules
- Error message display

## Error Handling

- **Error Boundaries**: Page-level error boundaries (`error.tsx`)
- **Loading States**: Suspense boundaries with loading UI (`loading.tsx`)
- **Toast Notifications**: User feedback via Sonner

## Development Tips

### Adding a New Page

1. Create a folder in `app/` with the route name
2. Add `page.tsx` for the main content
3. Optionally add `loading.tsx` and `error.tsx`

### Adding a New Service Client

1. Create a file in `services/`
2. Import OpenTelemetry tracing utilities
3. Wrap fetch calls with span creation

### Custom Components

1. Add component to `components/`
2. Use Radix UI primitives where applicable
3. Style with Tailwind CSS utility classes
