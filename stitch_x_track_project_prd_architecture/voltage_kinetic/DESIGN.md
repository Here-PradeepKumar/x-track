# Design System Strategy: Electric Performance

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Monolith"**

This design system is engineered to feel like a high-performance telemetry dashboard carved out of obsidian. It moves away from the "friendly SaaS" aesthetic, embracing **Kinetic Functionalism**. We achieve this through a "Digital-First, Rugged-Professional" lens: every pixel must feel intentional, high-velocity, and mission-critical. 

To break the "template" look, we utilize **Asymmetric Data Density**. Instead of a standard centered grid, we lean into heavy-left or heavy-right alignments, overlapping sharp-edged containers, and extreme shifts in typography scale. The layout should feel like a specialized piece of hardware—unapologetic, precise, and electrification-focused.

---

## 2. Colors & Surface Architecture

### The Palette
- **Primary (`#f3ffca` / `#cafd00`):** Our "Electric Lime." Use this for high-impact actions and critical data points.
- **Secondary (`#00eefc`):** "Electric Cyan." Reserved for secondary data streams or "active" connection states.
- **Neutral/Background (`#0e0e0e`):** "Deep Charcoal." The void upon which our performance data lives.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. They clutter the UI and feel "web-standard." In this system, boundaries are defined exclusively by **Tonal Shifts**. 
- To separate a sidebar from a main feed, transition from `surface` (#0e0e0e) to `surface-container-low` (#131313).
- To highlight a header, use `surface-bright` (#2c2c2c).

### Surface Hierarchy & Nesting
Treat the UI as a series of machined layers.
1. **Base Layer:** `surface` (#0e0e0e)
2. **Sub-Sections:** `surface-container-low` (#131313)
3. **Interactive Cards:** `surface-container` (#1a1919)
4. **Active/Floating Overlays:** `surface-container-highest` (#262626)

### The "Glow & Gradient" Rule
To add "soul" to the ruggedness, use **Subtle Photonic Glows**.
- **Active State:** Instead of a border, an active element (like a selected gauge) should have a 4px-8px outer glow using `primary` at 20% opacity.
- **Data Gradients:** For CTAs or progress bars, use a linear gradient from `primary` (#cafd00) to `primary_dim` (#beee00) at a 135-degree angle to simulate light hitting a physical surface.

---

## 3. Typography: The Performance Scale

Our typography is the engine of the brand. We pair the aggressive, industrial geometry of **Space Grotesk** (our Heading choice) with the technical precision of **Inter**.

- **Display & Headline (Space Grotesk):** Use `display-lg` (3.5rem) for hero stats and `headline-md` (1.75rem) for section titles. These should always be uppercase or have tight letter-spacing (-0.02em) to emphasize the "condensed/rugged" feel.
- **Body & Labels (Inter):** Use `body-md` (0.875rem) for high-density data tables. The "Label" tokens (`label-sm`) are critical for technical metadata—always use `on_surface_variant` (#adaaaa) to ensure they don't compete with primary data.

---

## 4. Elevation & Depth: Tonal Layering

### The Layering Principle
Forget drop shadows for structure. Depth is achieved by "stacking" dark values. A `surface_container_highest` (#262626) component sitting on a `surface` (#0e0e0e) background provides all the "lift" needed.

### Ambient Shadows
Shadows are only used for **Floating HUD Elements** (tooltips, modals). 
- **The Spec:** Blur: 24px, Spread: 0, Color: `#000000` at 40% opacity.
- **The "Ghost Border" Fallback:** If a container sits on a background of the same color, use a "Ghost Border": `outline_variant` (#494847) at **15% opacity**. It should feel like a faint reflection on a sharp edge, not a stroke.

### Sharp Corners (0px Radius)
In accordance with the "Rugged" requirement, all `roundedness` tokens are set to **0px**. No exceptions. This creates a technical, architectural silhouette that feels engineered rather than "designed."

---

## 5. Components

### Buttons (The "Actuators")
- **Primary:** Background: `primary`; Text: `on_primary` (#516700); Shape: Sharp 0px; Hover: Add `secondary` (#00eefc) 2px bottom-glow.
- **Secondary:** Background: Transparent; Text: `primary`; Border: 1px `primary` at 40% opacity.

### Performance Inputs
- **Text Fields:** Background: `surface_container_high`; Bottom-border only: 2px `outline`. On focus, the bottom border switches to `primary` with a subtle `primary` glow.
- **Checkboxes/Radios:** Use sharp squares. High-contrast `primary` fill when active.

### Data-Forward Lists
- **No Dividers:** Separate list items using `8px` (Spacing Scale `2`) of vertical margin or alternating background shifts between `surface_container_low` and `surface_container`.
- **Leading Elements:** Use `secondary` (Cyan) for icons or status pips to draw the eye to "active" rows.

### Performance HUD (Custom Component)
- A "HUD Card" uses `surface_container_lowest` with a `primary` top-accent bar (2px height). Use `label-sm` for technical units (e.g., "KWH", "RPM") positioned in the top-right corner of the card.

---

## 6. Do’s and Don’ts

### Do:
- **Use High-Contrast Spacing:** Use `spacing-12` (2.75rem) and `spacing-16` (3.5rem) to create "Editorial Breathing Room" between dense data blocks.
- **Embrace Asymmetry:** Align primary KPIs to the left and secondary technical meta-data to the right.
- **Layer Data:** Place `label-sm` text directly above or nested within `display-lg` numbers to create a "Telemetry" look.

### Don't:
- **Don't use Rounded Corners:** Ever. A 4px radius breaks the "Kinetic Monolith" vibe.
- **Don't use Grey Shadows:** If a shadow is needed, it must be pure black or a tinted "glow" from the primary color.
- **Don't use Decorative Dividers:** If you feel the need to add a line, try adding 20px of whitespace instead. If it still feels messy, shift the background color of one section by one tier (e.g., Low to Lowest).