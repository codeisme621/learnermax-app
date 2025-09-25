# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Next.js 15 frontend application built with shadcn/ui as the foundation for our custom component library:

- **Framework**: Next.js 15 with App Router and Turbopack for development
- **React Version**: React 19 with TypeScript
- **Styling**: TailwindCSS v4 with custom CSS variables
- **UI System**: shadcn/ui component library with multiple registry sources
- **Component Foundation**: Radix UI primitives for accessibility and behavior
- **Variant Management**: class-variance-authority (CVA) for component variants
- **Testing**: Jest with React Testing Library for unit tests
- **Font Optimization**: Geist fonts loaded via next/font

**shadcn/ui Implementation**
This project uses shadcn/ui as the primary component system:

- **Copy-paste components**: We own and customize all component code
- **Multiple registries**: Components sourced from various shadcn registries (expanding as needed)
- **Custom theming**: CSS variables and Tailwind configuration for consistent design tokens
- **Accessible by default**: Built on Radix UI primitives for WAI-ARIA compliance

Component Registries (Current & Planned)

- **Official shadcn/ui**: Primary component source
- **Additional registries**: Will be added as project needs expand

### Key Dependencies

- **Authentication**: NextAuth.js for user authentication
- **Payments**: Stripe integration with React components
- **AI Integration**: AI SDK for React from Vercel
- **AWS Integration**: AWS Cognito Identity Provider client
- **Styling Utilities**: clsx, tailwind-merge for conditional classes
- **Icons**: Lucide React for consistent iconography

## Development Commands

```bash
# Development
pnpm dev              # Start Next.js dev server with Turbopack
pnpm build            # Build for production with Turbopack
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Testing
pnpm test             # Run Jest unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report

# shadcn/ui
npx shadcn@latest add [component]  # Add components from registries
```

## Architecture Patterns

### Component Structure
- **shadcn/ui Components**: Copy-paste components from various shadcn registries
- **Custom Components**: Built using shadcn patterns and extending base components
- **App Router**: Next.js 15 App Router structure with `layout.tsx` and `page.tsx` files
- **Utilities**: Shared utilities including the `cn()` function for class merging


### shadcn/ui Component Pattern
All components follow the shadcn/ui conventions:
- **CVA variants**: Consistent variant API across all components
- **Composable**: Support `asChild` prop via Radix UI Slot for flexible composition
- **Customizable**: Easy to modify styling and behavior since we own the code
- **Accessible**: Built on Radix UI primitives for robust accessibility
- **TypeScript**: Full type safety with proper prop interfaces

```tsx
// Example shadcn/ui component structure
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const Button = React.forwardRef<
    React.ElementRef<"button">,
    React.ComponentPropsWithoutRef<"button"> & VariantProps<typeof buttonVariants>
>(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
        />
    )
})

Button.displayName = "Button"
```

### Testing Strategy
- Unit tests only - no integration or E2E tests in this directory
- Jest configuration with Next.js integration via `next/jest`
- Mock external dependencies (Next.js Image, etc.)
- Test component rendering, props, variants, and user interactions
- Tests located in `__tests__` directories alongside source files

## Configuration Files

- `next.config.ts`: Basic Next.js configuration
- `jest.config.js`: Jest setup with Next.js integration and path mapping for `@/` imports
- `jest.setup.js`: Test environment setup with testing-library/jest-dom
- `eslint.config.mjs`: ESLint configuration extending Next.js and TypeScript rules
- `components.json`: shadcn/ui configuration for component generation


## Key Files for Understanding Architecture

- `lib/utils.ts`: Core utility functions, especially `cn()` for class merging
- `components/ui/button.tsx`: Example of the component pattern with variants and composition
- `app/layout.tsx`: Root layout with font optimization and global styles

## shadcn/ui Philosophy
This project embraces the shadcn/ui approach of:

- **Copy, don't install**: We own our component code for maximum customization
- **Composable components**: Built for flexibility and reuse
- **Design system consistency**: Unified theming via CSS variables
- **Developer experience**: TypeScript, excellent APIs, and clear pattern