# TrigonQuest - Interactive Trigonometry Learning Game

## Overview

TrigonQuest is an interactive educational web application designed to teach trigonometry concepts through hands-on geometric construction exercises. Students work through progressive questions by drawing geometric elements (points, lines, angle bisectors) on an interactive canvas to solve trigonometry problems. The application provides immediate visual feedback and validation, making abstract mathematical concepts tangible and engaging.

The platform focuses on angle-based geometry problems, particularly angle bisector construction, with plans to expand to complementary angles, supplementary angles, and angle measurement exercises.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for component-based UI development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing (currently single-route application)
- **TanStack Query** (React Query) for server state management, data fetching, and caching

**UI Component System**
- **shadcn/ui** component library with Radix UI primitives for accessible, customizable components
- **Tailwind CSS** for utility-first styling with custom educational theme
- **Material Design principles** adapted for educational interfaces, emphasizing clarity and learning-focused aesthetics
- Custom design tokens for spacing, colors, and typography defined in `tailwind.config.ts` and `index.css`

**Layout Strategy**
- Responsive two-column desktop layout: Question panel (1/3 width) + Interactive canvas (2/3 width)
- Mobile: Stacked vertical layout with question panel above canvas
- Fixed header (64px) with progress tracking
- Canvas maintains aspect ratio with 800x600 base dimensions

**State Management Approach**
- Local component state (useState) for UI interactions and drawing operations
- TanStack Query for server-fetched questions and validation results
- No global state management library needed given current scope

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js with TypeScript
- ESM module system throughout the codebase
- Custom Vite middleware integration for development HMR

**API Design**
- RESTful JSON API with two primary endpoints:
  - `GET /api/questions` - Fetches all available questions
  - `POST /api/validate` - Validates student answers against correct solutions
- Request/response validation using Zod schemas shared between client and server

**Data Storage**
- **In-Memory Storage** (MemStorage class) currently used for question bank and validation logic
- Database infrastructure prepared with Drizzle ORM and PostgreSQL (Neon serverless) but not yet actively used
- Migration system configured via `drizzle.config.ts` for future database integration

**Validation Logic**
- Server-side geometric validation of student-drawn elements
- Comparison algorithms for points, lines, and angles with tolerance thresholds
- Detailed feedback generation explaining correctness or errors

### Data Models & Schemas

**Core Geometric Types** (defined in `shared/schema.ts`):
- `Point`: 2D coordinates (x, y)
- `Line`: Defined by start/end points, includes `isUserDrawn` flag
- `Angle`: Three points (point1, vertex, point2) with optional degree measurement

**Question Structure**:
- Question metadata: id, type, title, description, instructions
- Given elements: predefined points, lines, angles visible to student
- Correct answer definition for server-side validation

**Question Types** (enum):
- `angle_bisector` - Currently implemented
- `angle_measurement` - Planned
- `complementary_angles` - Planned
- `supplementary_angles` - Planned

**User Answer Structure**:
- Question ID reference
- Arrays of user-drawn lines and points
- Submitted for validation via POST request

### Interactive Canvas System

**Drawing Tool Architecture**
- SVG-based rendering for crisp geometric elements at any zoom level
- Tool system: Point, Line, Angle Bisector tools with state-based activation
- Click-and-drag interaction model for line creation
- Point snapping to grid (configurable 20px grid) with 15px snap threshold
- Hover states for interactive feedback on nearby points

**Visual Feedback Mechanisms**
- Color coding: Given elements (black), user-drawn elements (blue), hover states
- Real-time preview line rendering during drawing operations
- Angle measurement display with arc visualization
- Grid overlay toggle for alignment assistance

**Canvas Controls**
- Undo functionality for user-drawn elements
- Clear all user drawings
- Grid visibility toggle
- Disabled state during submission/validation

### Validation & Feedback Flow

**Client-Side Flow**:
1. Student draws geometric elements using interactive tools
2. Submit button triggers validation mutation
3. Loading state displays during server validation
4. Result stored in local state

**Server-Side Validation**:
1. Parse and validate incoming answer structure with Zod
2. Compare user-drawn elements against correct answer
3. Check geometric properties (angles, positions, slopes) within tolerance
4. Generate detailed feedback message
5. Return `ValidationResult` with boolean correctness and message

**Feedback Presentation**:
- Full-screen overlay with animation on submission
- Success: Green checkmark with congratulatory message
- Incorrect: Yellow warning with hint/guidance
- Auto-dismiss after 2 seconds, then allow retry or next question

### Progress Tracking

**Current Implementation**:
- In-memory score tracking (increments on correct answers)
- Question progression via array index
- Visual progress bar showing current question number and score
- No persistence across page refreshes (future enhancement opportunity)

## External Dependencies

### Third-Party Services

**Database** (Prepared but not active):
- **Neon Serverless PostgreSQL** - Cloud-hosted PostgreSQL with connection pooling via `@neondatabase/serverless`
- Connection string managed via `DATABASE_URL` environment variable
- Migration management through Drizzle Kit

### Key NPM Packages

**UI & Styling**:
- `@radix-ui/*` - 20+ accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Type-safe component variant management
- `lucide-react` - Icon library for toolbar and UI elements

**Data & State Management**:
- `@tanstack/react-query` - Async state management, caching, and data fetching
- `zod` - Runtime type validation and schema definition
- `drizzle-orm` - TypeScript ORM for PostgreSQL (configured for future use)
- `drizzle-zod` - Zod schema generation from Drizzle schemas

**Forms & Validation**:
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolver integration

**Development Tools**:
- `@replit/vite-plugin-*` - Replit-specific development tooling (error overlays, banners, cartographer)
- `tsx` - TypeScript execution for development server
- `esbuild` - Fast bundler for production server build

**Fonts & Assets**:
- Google Fonts: Inter (primary UI font)
- Courier New (fallback for mathematical notation)

### Environment Configuration

**Required Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection string (required by drizzle.config.ts even if database not actively used)
- `NODE_ENV` - Environment mode (development/production)

**Build & Deployment**:
- Development: `npm run dev` - Runs Express server with Vite middleware
- Production Build: `npm run build` - Bundles client with Vite, server with esbuild
- Production Start: `npm start` - Runs compiled Express server serving static client assets
- Database Push: `npm run db:push` - Applies schema changes to PostgreSQL via Drizzle