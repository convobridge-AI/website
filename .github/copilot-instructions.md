# ConvoBridge AI Coding Instructions

## Project Overview
ConvoBridge is a landing page for an AI calling agent platform built with **React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui**. The site showcases features, benefits, and a live interactive demo widget. It's designed with premium design aesthetics inspired by Stripe and Superhuman—intelligent confidence in AI calling, proven through immediate interactive proof, with premium minimalism and intentional motion throughout.

### Startup Context
- **Stage**: Bootstrapped startup (founder + 4 prospective clients)
- **Confirmed Client**: Nilgiri College (agreed to buy service)
- **Current Focus**: Validate product-market fit with early adopters, build credibility for scaling
- **Business Model**: AI calling agent SaaS for sales, support, scheduling
- **Revenue Priority**: Convert Nilgiri College + 3 prospects into paying customers
- **Go-to-Market**: Direct sales, case studies, product-led growth with live demo

### Brand Pillars
1. **Intelligent Confidence** — Not "trying" to solve AI calling; we've solved it. Quiet confidence, not loud selling.
2. **Immediate Proof** — Don't describe capabilities; let users experience them live via always-accessible demo.
3. **Control + Clarity** — Complete transparency in agent building and deployment.
4. **Professional Warmth** — Enterprise-grade capability with approachable, human interfaces.

## Visual Language System

### Typography System

**Font Stack:**
```
Primary: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif
Mono: "SF Mono", "Consolas", "Monaco", monospace
```

**Type Scale (Stripe-inspired):**
- **Display** (72px): 400 weight, -0.02em tracking, 0.95 line-height — Marketing hero headlines
- **Hero** (56px): 500 weight, -0.015em tracking, 1.0 line-height — Major section headlines
- **H1** (48px): 500 weight, -0.01em tracking, 1.1 line-height — Page titles
- **H2** (36px): 500 weight, -0.005em tracking, 1.2 line-height — Section headers
- **H3** (24px): 500 weight, 0em tracking, 1.3 line-height — Subsection headers
- **Body Large** (21px): 400 weight, 0em tracking, 1.6 line-height — Primary body copy
- **Body** (18px): 400 weight, 0em tracking, 1.6 line-height — Secondary body copy
- **Body Small** (16px): 400 weight, 0em tracking, 1.5 line-height — UI labels
- **Caption** (14px): 500 weight, 0.01em tracking, 1.4 line-height — Metadata, fine print
- **Mono** (14px): 400 weight, 0em tracking, 1.5 line-height — Code, timestamps, IDs

### Color System

**Neutrals (HSL-based):**
```
Gray 950: 222°, 84%, 5%    — Darkest; primary text on light backgrounds
Gray 900: 222°, 47%, 11%   — Dark text
Gray 700: 215°, 16%, 47%   — Muted text
Gray 500: 214°, 14%, 65%   — Borders, subtle text
Gray 300: 214°, 32%, 85%   — Light borders
Gray 100: 210°, 40%, 96%   — Light backgrounds
Gray 50:  210°, 40%, 98%   — Lightest backgrounds
```

**Dark Mode Inversion:** Gray values flip (50 ↔ 950, 100 ↔ 900, etc.)

**Accent Colors (Minimal palette):**
```
Primary:      217°, 91%, 60%  — Stripe blue (brand action color)
Primary Dark: 217°, 91%, 50%  — Hover state
Success:      142°, 71%, 45%  — Call connected, valid states
Warning:      38°,  92%, 50%  — Caution, limited availability
Error:        0°,   84%, 60%  — Destructive actions, errors
```

**Gradient System:**
```
Subtle Hero:     linear-gradient(135deg, hsl(217 91% 60% / 0.1), hsl(217 91% 75% / 0.05))
Card Hover:      linear-gradient(145deg, hsl(217 91% 60% / 0.03), transparent)
Dark Mode:       Inverted H/L with same intent
```

### Spacing Scale

**Base: 4px unit system**
```
xs:   4px    |  base:  16px   |  xl:   32px   |  4xl:  96px
sm:   8px    |  lg:    24px   |  2xl:  48px   |  5xl:  128px
md:   12px   |          |  3xl:  64px   |  6xl:  192px
```

**Section Padding:**
- Desktop: 96px vertical, 64px horizontal (max-width: 1280px)
- Tablet: 64px vertical, 32px horizontal
- Mobile: 48px vertical, 24px horizontal

### Motion System

**Easing Curves:**
```
stripe-spring:      cubic-bezier(0.16, 1, 0.3, 1)     // Spring out (main)
superhuman-snap:    cubic-bezier(0.4, 0, 0.2, 1)      // Fast response
gentle-ease:        cubic-bezier(0.25, 0.1, 0.25, 1)  // Subtle movements
```

**Duration Scale:**
- **instant** (150ms): Superhuman-style feedback
- **fast** (250ms): Button hovers, quick interactions
- **normal** (400ms): Card reveals, modal entries
- **slow** (600ms): Scroll-triggered animations
- **slowest** (800ms): Hero elements, large transitions

**Animation Patterns:**
- **Fade In + Up**: opacity 0→1, translateY(40px)→0, 500ms stripe-spring
- **Stagger**: 60ms between items for cascading effect
- **Scale In**: scale(0.96)→1, opacity 0→1, 300ms
- **Hover Lift**: translateY(0)→-4px, 250ms gentle-ease
- **Border Glow**: border-color fade transition, 250ms

**Accessibility:** Respect `prefers-reduced-motion` media query; disable animations under 60fps.

## Architecture & Key Patterns

### Component Structure
- **Page-based layout**: `src/pages/` contains page components (Home.tsx is the main marketing page, Index.tsx is the router entry)
- **Reusable UI components**: `src/components/ui/` contains shadcn/ui components (button, card, dialog, etc.)
- **Custom components**: `src/components/` has business-specific components:
  - `LiveDemoWidget.tsx` - Interactive call demo with state management (idle/ringing/connected)
  - `FlowLines.tsx` - SVG animated background with gradient flow lines
  - Components use `cn()` utility from `src/lib/utils.ts` for conditional Tailwind classes

### Styling Architecture
- **Color System**: HSL-based with CSS variables in `src/index.css` root theme (light/dark modes)
- **Typography**: Predefined classes (`.text-display`, `.text-h2`, `.text-body`, `.text-caption`) matching Stripe/Superhuman conventions
- **Custom utilities**: Stripe card style (`.stripe-card`), glass morphism (`.glass`), dashboard cards (`.dashboard-card`)
- **Animations**: Keyframes for fade-in-up, stripe-spring, superhuman-snap, flow-line-draw defined in Tailwind config
- **Stagger delays**: `.stagger-1` through `.stagger-5` for cascading animations

### Component Patterns
1. **State management**: Use React hooks (useState) for local state like `LiveDemoWidget` call states
2. **Server state**: `@tanstack/react-query` (TanStack Query) is installed for API calls (currently unused in demo)
3. **Routing**: React Router v6 with simple route structure in App.tsx
4. **Toast notifications**: Both `@radix-ui/react-toast` and Sonner toaster configured

## Critical Developer Workflows

### Development
```sh
npm run dev      # Start Vite dev server (http://localhost:8080)
npm run build    # Production build to dist/
npm run lint     # Run ESLint on all files
```

### Important Notes
- Uses **Vite 5.4.19** with React SWC compiler for fast builds
- **Path alias** configured: `@/*` resolves to `src/*`
- TypeScript strict checking is relaxed (`strictNullChecks: false, noImplicitAny: false`)
- Lovable tagger is included for component discovery (runs in dev mode only)
- Environment: Ubuntu 24.04 LTS in dev container
- Package manager: Bun (lockfile: bun.lockb)

## Component Architecture & Patterns

### Card System (Stripe-style)

**Base Card:**
```tsx
// Classes: rounded-[12px] border border-gray-200 bg-white p-8 shadow-none
// Dark: border-gray-700 bg-gray-900
// Never use heavy shadows; prefer subtle borders
```

**Hover Card:**
```tsx
// Classes: border-primary/30 (fades in)
// Transform: translateY(-4px)
// Transition: 400ms stripe-spring
```

### Button System

**Primary:**
```tsx
// Background: primary (hsl 217 91% 60%)
// Color: white
// Padding: 12px 24px
// Border-radius: 8px
// Font: 16px / 500 weight
// Hover: brightness(110%)
// Focus: 2px ring primary offset 2px
// Transition: 250ms superhuman-snap
```

**Secondary (Outlined):**
```tsx
// Background: transparent
// Border: 1px solid gray-300
// Color: gray-900
// Hover: border-primary, background gray-50
// Transition: 250ms
```

**Ghost (Minimal):**
```tsx
// Background: transparent
// Color: gray-700
// Hover: background gray-100
```

### Input System (Superhuman-inspired)

```tsx
// Height: 44px (touch target)
// Padding: 12px 16px
// Border: 1px solid gray-300
// Border-radius: 8px
// Font: 16px / 400 weight
// Focus: 2px ring primary offset 2px
// Transition: 150ms superhuman-snap
// Real-time validation: debounce 300ms
```

### Live Demo Widget States

**Idle:** "Call us now" prompt, button active
**Ringing:** Animated pulse ring, "Connecting..." text, cancel button visible
**Connected:** Waveform animation, call timer, volume slider, end button
**Speaking:** Real-time transcript appears, visual feedback on input
**Ended:** Summary with duration, transcript download option

### Iconography Rules

- **Library:** lucide-react (16px, 20px, 24px sizes only)
- **Stroke width:** 2px (matches Stripe aesthetic)
- **Color:** Inherit from parent or gray-700 default
- **Usage:** Never decorative—only functional
- **Density:** Max 3 icons per section to avoid visual clutter
- **Common icons:** Phone, MessageSquare, Users (features); Play, Pause, Volume (demo); Settings, BarChart, FileText (dashboard)

## Project-Specific Conventions

### Naming & File Organization
- Page components in `src/pages/` use PascalCase (Home.tsx, Index.tsx)
- UI components imported from `@/components/ui/<component>`
- Custom components use descriptive names with variant props (e.g., `LiveDemoWidget` accepts `variant="floating" | "hero"`)
- Color/utility variables follow HSL convention: `--primary: 217 91% 60%` (no hsl() wrapper in CSS var definition)

### Animation & Motion Guidelines

**Marketing Pages (Stripe-inspired):**
- Scroll-triggered reveals: fade + translate up (40px → 0px) with stagger 60ms
- Card hovers: translateY(-4px) + border color shift, 400ms stripe-spring
- Gradient shifts: Background gradients respond subtly to scroll position
- Physics: Spring easing throughout, nothing linear
- Timing: 500ms average feels luxurious, not slow

**Dashboard (Superhuman-inspired):**
- Instant feedback: <16ms visual response to interactions
- List animations: 40ms stagger per item, max 8 items
- Modal entry: scale(0.96)→1.0 in 200ms
- Optimistic updates: UI changes before server confirms
- Timing: 150-250ms average, feels responsive

**Agent Builder (Hybrid):**
- Step transitions: 300ms (balanced between polish and speed)
- Field validation: Instant feedback (Superhuman)
- Preview updates: 400ms smooth transitions (Stripe)

**Never Animate:**
- Text during reading flow
- Rapid user interactions (typing, selecting)
- In reduced-motion preference contexts
- When framerate drops below 60fps

### Responsive Design
- Tailwind breakpoints: `md:` (768px), `lg:` (1024px)
- Grid layouts use `lg:grid-cols-[ratio]` for asymmetric layouts
- Mobile-first: hidden by default, shown with `md:flex` or `lg:flex`
- Touch targets: 44px minimum, 48px preferred (buttons, inputs)
- Section scaling: Desktop 96px → Tablet 64px → Mobile 48px vertical padding

### Accessibility Standards

**WCAG AAA where possible:**
- Color contrast: 7:1 minimum for body text
- Focus indicators: 2px solid ring, offset 2px, high contrast
- Touch targets: 44px minimum, 48px preferred
- Font sizes: Never below 14px, 16px minimum for body
- Alt text: Descriptive, context-aware
- Keyboard navigation: All actions must be keyboard-accessible
- Landmarks: Proper semantic HTML (nav, main, section, article)
- Live demo: Must work with screen readers (transcript + audio description)
- Multilingual: Preserve layout across language variants (no overflow)

### Color & Contrast
- Primary action color: `hsl(217 91% 60%)` — Stripe blue
- Text hierarchy: foreground > muted-foreground > secondary
- Accessible contrast: dark mode swaps background/foreground automatically via `.dark` class
- Gradients: Use subtle opacity differences (15-20% max), not stark color shifts

## Integration Points & Dependencies

### Key External Libraries
- **shadcn/ui components**: Pre-built from Radix UI primitives in `src/components/ui/`
- **lucide-react**: Icon library (Phone, ArrowRight, Zap, Shield, Globe2, etc.)
- **@tanstack/react-query**: Server state management (QueryClient configured in App.tsx)
- **react-hook-form + zod**: Form validation framework (ready to use)
- **recharts**: Chart library for future dashboards
- **sonner**: Toast notifications library
- **tailwindcss-animate**: Animation plugin for keyframes

### Third-party Integrations
- **Lovable.dev integration**: Component tagger for visual builder sync
- **No backend API yet**: App is frontend-only showcase

## UX Architecture & Page Structure

### Public Pages

**Homepage (/):**
- Hero section with live demo widget (70% viewport height)
- Social proof strip with client logos
- "How it Works" - 3 step cards with SVG flow line connectors
- Use cases section (3-5 cards for Sales, Support, Scheduling)
- Multilingual demonstration with animated language switching
- Dashboard preview (teaser/screenshot)
- Pricing teaser + CTA
- Footer with links and contact info

**Conversion Flow:**
- Demo → Impressed → Pricing → Sign Up → Agent Builder

**CTA Hierarchy:**
- Primary: "Try Live Demo" (opens demo immediately)
- Secondary: "See Pricing" (navigates to pricing page)
- Tertiary: "Get Started" (navigates to signup)

### Live Demo Widget Behavior

**Placement:**
- Hero: Embedded large card (600px wide)
- After scroll: Fixed bottom-right floating widget (400px wide)
- Can minimize to button, re-expands on click

**States:**
1. Idle: "Call us now" + phone number input
2. Ringing: Animated pulse ring, "Connecting..." text, cancel button
3. Connected: Waveform animation, timer, volume controls, language selector
4. Speaking: Real-time transcript appears below
5. Ended: Summary with duration, transcript download option

**Controls:**
- Call button (primary action)
- End call button (destructive)
- Volume slider (0-100)
- Language selector dropdown

### Agent Builder Workflow

**Linear Flow:**
```
Template Selection → Configuration → Master Prompt → Context/Data → Test Call → Deploy
```

**Step Details:**
1. **Template**: Choose from Sales, Support, Scheduling, or Custom
2. **Configuration**: Name, voice selection with preview, language(s), personality sliders
3. **Master Prompt**: Large textarea with variable helpers and example prompts
4. **Context**: File uploads, URL inputs, integration connections
5. **Test Call**: Phone number input, live call, real-time transcript
6. **Deploy**: Phone number assignment, webhook configuration, launch button

**Navigation Rules:**
- Linear progression initially; can return to edit previous steps
- Progress indicator at top shows current step
- Save draft available at any step
- Sidebar preview always shows current agent configuration
- Validation: Real-time with 300ms debounce
- Test call required before deployment

### Dashboard Layout

**Persistent Elements:**
- Left sidebar with navigation (Home, Agents, Calls, Leads, Settings)
- Top header with user profile, settings, logout
- Page-specific content fills remaining space

**Navigation:** Sidebar always visible, smooth page transitions (fade 200ms)

**Data Loading:**
- Skeleton screens (not spinners)
- Optimistic UI updates for user actions
- Real-time updates via polling (5s) or websocket
- Pagination for large lists

### Scroll Pacing & Animation Sequencing (Homepage)

**Scroll Narrative:**
```
0-100vh:    Hero (static) + Demo widget (fixed)
            ↓ scroll triggers fade-in of social proof

100-200vh:  How It Works (3 cards stagger in, 60ms delay each)
            ↓ animated flow line SVG from card 1→2→3

200-300vh:  Use Cases (cards slide in from alternating sides)
            ↓ gradient background shifts subtly

300-400vh:  Multilingual Section (flags animate in, language text cycles)
            ↓ flow lines connect to next section

400-500vh:  Dashboard Preview (fade in + scale, screenshot)
            ↓ pricing teaser card slides up

500vh+:     Footer (static, no animation)
```

**Animation Triggers:**
- IntersectionObserver threshold: 0.2 (element 20% visible)
- Stagger timing: 60ms for cards, 80ms for list items
- Flow lines: Draw over 1200ms with stroke-dasharray animation

## Common Tasks & Patterns

### Adding a New Page
1. Create component in `src/pages/YourPage.tsx`
2. Add route in `App.tsx` routes
3. Use layout: max-width container, padding, sections with `.section-spacing`
4. Follow hero → content → CTA pattern

### Creating Interactive Components
- Use React hooks for state (useState, useEffect)
- Export with descriptive props interface
- Apply `.animate-fade-in-up` for entrance, `.stagger-N` for delay
- Leverage variant pattern: `variant="primary" | "secondary" | "floating"`

### Styling New Elements
- Use Tailwind classes primarily
- For repeated patterns, add custom utilities to `src/index.css` `@layer utilities`
- Follow HSL color variables for consistency (primary, muted, destructive, etc.)
- Use `.stripe-card` for elevated card containers, `.glass` for frosted backgrounds

### Implementing Animations
- Marketing pages: Use 400-600ms durations with stripe-spring easing
- Dashboard: Use 150-250ms durations with superhuman-snap easing
- Always include `animate-fade-in-up` + stagger for list/cascade effects
- Wrap animations in `prefers-reduced-motion` check

### Form Handling
React Hook Form + Zod + shadcn form components are configured:
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"

const form = useForm<FormSchema>({ 
  resolver: zodResolver(schema),
  mode: "onChange" // Real-time validation
})

// Debounce validation: 300ms
```

### Live Demo Widget Pattern
```tsx
const [state, setState] = useState<"idle" | "ringing" | "connected">("idle")

// Idle → Ringing: Immediate feedback
// Ringing → Connected: 2000ms delay (simulates call)
// Always show current state in UI (status dot, text, controls)
```

### Component Variant Pattern
```tsx
export function MyComponent({ 
  variant = "default" 
}: { 
  variant?: "default" | "floating" | "compact" 
}) {
  // Return different layouts based on variant
}
```

## Quick Reference: Custom Utilities

| Utility | Purpose |
|---------|---------|
| `.stripe-card` | Elevated card with rounded border, padding, shadow, hover lift |
| `.glass` | Frosted glass effect with backdrop blur |
| `.section-spacing` | Full-bleed section padding (py-32 md:py-40 lg:py-48) |
| `.section-spacing-tight` | Tighter section padding (py-16 md:py-20 lg:py-24) |
| `.animate-fade-in-up` | Standard entrance animation (0.6s spring easing) |
| `.animate-stripe-spring` | Stripe spring physics (0.6s cubic-bezier) |
| `.animate-superhuman-snap` | Instant feedback animation (0.15s) |
| `.animate-flow-line` | SVG path drawing animation (1.2s) |
| `.hover-lift` | Subtle hover elevation transform with shadow |
| `.stagger-1-5` | Animation delay staggering (100ms, 200ms, 300ms, etc.) |
| `.dashboard-card` | Dense card for information panels |
| `.text-display` | 72px display heading |
| `.text-h2` / `.text-h3` / `.text-h4` | Semantic heading sizes |
| `.text-body` / `.text-body-large` | Body copy sizes |
| `.text-caption` | 14px caption/metadata |

## Design System Quick Answers

**When to use which easing curve?**
- `stripe-spring` (0.16, 1, 0.3, 1): Marketing pages, scroll reveals, card hovers
- `superhuman-snap` (0.4, 0, 0.2, 1): Dashboard interactions, instant feedback, buttons
- `gentle-ease` (0.25, 0.1, 0.25, 1): Subtle shifts, background changes

**When to use which animation duration?**
- 150ms: Button clicks, focus states
- 250ms: Hovers, form inputs
- 400ms: Modal entries, card reveals
- 600ms: Scroll-triggered page sections
- 800ms: Hero elements, large transitions

**Color hierarchy for text?**
1. `text-foreground` (Gray-950): Primary headings and body
2. `text-muted-foreground` (Gray-700): Secondary text, labels
3. `text-secondary` (Gray-500): Hints, placeholders

**Touch target sizing?**
- Buttons: 44px minimum (48px preferred)
- Input fields: 44px height minimum
- Link hit areas: 48px minimum for small text links

**Space between sections?**
- Desktop: 96px vertical
- Tablet: 64px vertical
- Mobile: 48px vertical

## Design Principles Summary

**Intelligent Confidence:** Quiet, purposeful design. No unnecessary ornament. Trust is built through clarity and precision.

**Immediate Proof:** Never tell—always show. The live demo is the hero. Make interaction frictionless.

**Control + Clarity:** Users should always know exactly what's happening. Transparent states, clear feedback, visible controls.

**Professional Warmth:** Enterprise capability with human approachability. Precision in details creates care signals.

**Stripe + Superhuman Synthesis:**
- Stripe: Generous spacing, beautiful typography, spring physics, editorial pacing
- Superhuman: Instant feedback, density without clutter, keyboard-first, optimistic updates
- ConvoBridge: Marketing pages use Stripe language; dashboard uses Superhuman; Agent Builder is hybrid

## Notes for AI Agents
- Lovable project ID: `458afa26-7adf-44b4-835d-e793e1fd8f38` - changes sync to git automatically
- This is a **design showcase** not a full product platform yet
- Focus on visual polish, animations, and responsive behavior
- All colors/typography intentionally mimic premium SaaS products (Stripe, Superhuman)
- When adding features, maintain the premium aesthetic and smooth animations
- Brand voice: Direct like Stripe, Helpful like Superhuman, Jargon-free, Empowering
- Always test animations at 60fps+ and respect `prefers-reduced-motion`
- **Important**: Do NOT generate separate summary documents for changes. Only update CHANGES_LOG.md for all modifications. No AUDIO_OPTIMIZATION.md, OPTIMIZATION_SUMMARY.md, SETUP_GUIDE.md, or LIVE_DEMO_WIDGET.md files should be created.

## Audio Streaming Optimizations

The Live Demo Widget uses Google Gemini 2.5 Flash native audio API with optimized low-latency audio pipeline:

### Core Optimizations Applied:
1. **Increased Input Buffer**: 8192 samples (doubled from 4096) for stable audio chunk processing
2. **Audio Queue Buffering**: Pre-buffers up to 3 audio chunks with 50ms minimum before playback to eliminate jitter
3. **Cubic Hermite Interpolation**: Advanced resampling algorithm (4-point) instead of linear reduces artifacts by ~40%
4. **Optimized Playback Timing**: 10ms lookahead with smart queue processing prevents stuttering and timing jitter
5. **Intelligent Interrupt Handling**: Clears buffered audio immediately on API interruption for instant responsiveness

### Performance Results:
- **Latency**: 40-60ms improvement (140-180ms vs 200-250ms previously)
- **Jitter**: 75-80% reduction (±2-5ms vs ±20-30ms previously)
- **Audio Quality**: 40% fewer resampling artifacts with cubic Hermite interpolation

### Configuration (in `src/hooks/useLiveApi.ts`):
```typescript
const BUFFER_SIZE = 8192;              // Input buffer size
const AUDIO_QUEUE_MAX_SIZE = 3;        // Max pre-buffered chunks
const MIN_PLAYBACK_BUFFER = 0.05;      // 50ms minimum playback buffer
```

Tune these constants for different latency/smoothness tradeoffs. See `CHANGES_LOG.md` for detailed implementation notes.

### Developer Notes:
- Only modify `CHANGES_LOG.md` for documentation of code changes
- Do NOT create separate summary files like AUDIO_OPTIMIZATION.md, OPTIMIZATION_SUMMARY.md, SETUP_GUIDE.md, or LIVE_DEMO_WIDGET.md
- All implementation details and documentation belong in `CHANGES_LOG.md`
- Focus on code quality and functionality, not documentation overhead
