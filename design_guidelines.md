# Design Guidelines: Interactive Trigonometry Learning Game

## Design Approach

**Design System:** Material Design + Educational Platform Patterns (inspired by Khan Academy, Brilliant)
**Rationale:** Educational tools require clarity, consistency, and focus on learning. Material Design provides excellent component patterns for interactive tools while maintaining accessibility. Drawing from established educational platforms ensures familiar, effective learning patterns.

**Core Principles:**
1. Learning-first interface - minimize visual distractions
2. Immediate visual feedback for interactions
3. Clear spatial hierarchy between question, canvas, and tools
4. Professional educational aesthetic that appeals to students and educators

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (p-2, h-8, m-6, etc.)

**Main Layout Structure:**
- Fixed header (h-16) with game title and progress indicator
- Two-column desktop layout: Question panel (left, w-1/3) + Interactive canvas (right, w-2/3)
- Mobile: Stacked layout with question panel above canvas
- Canvas area maintains aspect ratio with max-width constraints

**Container Strategy:**
- Header: Full width with max-w-7xl centered
- Main content: Full viewport height minus header
- Question panel: max-w-md with consistent p-6 padding
- Drawing canvas: Centered with defined max dimensions

## Typography

**Font Family:** 
- Primary: Inter (Google Fonts) - clean, highly legible for educational content
- Math/Technical: "Courier New" for angle measurements and mathematical notation

**Hierarchy:**
- Game Title: text-2xl font-bold
- Question Title: text-xl font-semibold
- Question Text: text-base leading-relaxed
- Instructions: text-sm text-gray-600
- Tool Labels: text-sm font-medium
- Angle Labels on Canvas: text-xs font-mono
- Button Text: text-sm font-medium

## Component Library

### Question Panel
- Card-based design with subtle border
- Sections: Question number badge, problem statement, geometric diagram reference, step-by-step instructions
- Clear visual separation between question text and action area
- Submit/Check Answer button prominently placed at bottom

### Interactive Canvas
- White background (#FFFFFF) with subtle grid overlay (optional toggle)
- Geometric elements: Lines (2px stroke), Points (8px diameter circles), Angle arcs (1.5px stroke)
- Active drawing state: Dashed preview lines during construction
- Completed construction: Solid lines with distinctive treatment for user-drawn vs given elements
- Coordinate system indicators in corners

### Drawing Toolbar
- Horizontal toolbar above canvas (h-14)
- Tool buttons with icon + label: Point, Line, Angle Bisector, Measure, Clear
- Active tool state: Highlighted with subtle background
- Undo/Redo buttons on right side
- Compact spacing (gap-2) between tools

### Feedback System
- Success state: Green checkmark with "Correct!" message overlay on canvas
- Error state: Red X with hint message, highlighting incorrect construction
- Partial credit: Yellow warning icon with guidance
- Animated transitions (300ms) for state changes

### Progress Tracking
- Header progress bar showing question completion (h-1 full-width)
- Score counter in top-right: "X/Y Correct"
- Question number indicator: "Question 3 of 10"

### Navigation
- Minimal distraction: Simple "Next Question" button appears after correct answer
- "Skip Question" option in subtle text link
- Exit/Menu icon in top-left for game settings

## Interactive States

**Canvas Interactions:**
- Hover on points: Enlarge slightly (scale-110), show coordinates tooltip
- Selected point/line: Highlighted with accent color treatment
- Construction in progress: Dashed preview following cursor
- Snap-to-grid behavior: Subtle magnetic effect with 100ms transition

**Button States:**
- Default: Solid background, medium weight text
- Hover: Slight scale (scale-105), deeper shadow
- Active: Pressed appearance with scale-95
- Disabled: Reduced opacity (opacity-40), no pointer events

**Tool Selection:**
- Selected tool: Background accent, icon color change
- Disabled tools: Grayed out with tooltip explanation
- Tool cursor changes: Custom cursor icon when tool is active

## Animations

**Minimal, purposeful animations only:**
- Feedback overlays: Fade in (200ms) with slight scale
- Tool selection: Smooth background transition (150ms)
- Question transitions: Slide animation (400ms ease-in-out)
- Progress bar: Width transition as questions complete
- NO scroll animations, parallax, or decorative motion

## Images

**No hero image required** - this is a functional educational tool.

**Icon Usage:**
- Use Material Icons via CDN for toolbar icons (point, line, angle, measure, undo, redo, clear)
- Geometric construction icons should be simple, monochrome line drawings
- Success/Error icons: Use standard checkmark/X symbols

**Geometric Diagrams:**
- Question reference diagrams rendered as SVG within question panel
- Static, non-interactive reference showing the problem setup
- Consistent style matching the interactive canvas

## Visual Consistency

- Maintain uniform geometric element styling across question diagrams and interactive canvas
- Use consistent color coding: Given elements vs. constructed elements vs. correct answer overlays
- Standardize measurement display format (degrees with ° symbol)
- Uniform spacing between canvas grid lines if grid is enabled
- Match geometric precision (snap angles to common increments: 5° or 10°)

This design creates a focused, distraction-free learning environment where the geometric construction tools are intuitive, feedback is immediate and clear, and students can concentrate on understanding trigonometry concepts through interactive practice.