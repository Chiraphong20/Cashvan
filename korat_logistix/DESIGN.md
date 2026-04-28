# Design System Specification: The Precision Navigator

## 1. Overview & Creative North Star

This design system is engineered to transform a standard logistics utility into a high-end orchestration platform. Moving beyond the "industrial" look typical of supply-chain software, we are adopting a Creative North Star we call **"The Precision Navigator."**

The aesthetic is rooted in **Modern Editorial Precision**. We treat data not as a chore, but as a premium asset. We break the rigid, boxed-in "template" look by utilizing intentional asymmetry, sophisticated tonal layering, and high-contrast typography scales. For the Nakhon Ratchasima region—a hub of movement and commerce—the UI must feel as reliable as an architect’s blueprint and as fluid as a modern navigation map.

## 2. Color Architecture & Tonal Depth

The palette moves away from flat, "plastic" interfaces. We utilize a sophisticated range of blues, greens, and ambers to signify authority and status without visual fatigue.

### The Foundation
*   **Primary (Authority):** `#003fb1` (Primary) to `#1a56db` (Primary Container). Used for critical navigation and core brand moments.
*   **Success (Checked-in):** `#006c49` (Secondary). A deep, forest emerald that signals reliability.
*   **Warning (Target/Alert):** `#694100` (Tertiary). A sophisticated ochre rather than a generic "safety orange," maintaining an editorial feel.
*   **Background Hierarchy:** `#f8f9ff` (Surface) provides a cool, crisp canvas.

### The "No-Line" Rule
To achieve a premium, custom feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through:
1.  **Background Shifts:** Place a `surface_container_lowest` card on a `surface_container_low` background.
2.  **Tonal Transitions:** Use subtle shifts between `surface_dim` and `surface_bright` to delineate areas.

### The Glass & Gradient Rule
Floating elements (Map overlays, Mobile LIFF drawers) should utilize **Glassmorphism**. Use `surface_container_high` with a 70-80% opacity and a `20px` backdrop-blur. 
Main Action Buttons should not be flat; apply a subtle linear gradient from `primary` (#003fb1) to `primary_container` (#1a56db) to provide "visual soul."

## 3. Typography: The Editorial Voice

We use a dual-font strategy to balance character with high-speed readability. 

*   **The Display Voice (Plus Jakarta Sans):** Used for `display`, `headline`, and `title` scales. This geometric sans-serif brings a "tech-forward" and premium feel to data headers.
*   **The Functional Voice (Inter):** Used for `body` and `label` scales. Inter is selected for its high x-height and exceptional legibility on small mobile screens (LIFF). 
*   **Thai Context:** When localized, **Prompt** replaces Jakarta for headlines, and **Sarabun** replaces Inter for body copy to maintain the professional, government-standard-yet-modern feel required for the region.

**Hierarchy Note:** Use `display-md` for high-level regional stats and `label-sm` in all-caps with 0.05em tracking for metadata to create an authoritative, "dashboard" aesthetic.

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often messy. This system uses **Atmospheric Intelligence** to create depth.

*   **The Layering Principle:** Stack your containers.
    *   *Base:* `surface`
    *   *Section:* `surface_container_low`
    *   *Card:* `surface_container_lowest` (Pure white #ffffff)
*   **Ambient Shadows:** If a "floating" state is required (e.g., a map marker or a mobile action button), use an extra-diffused shadow: `Y: 8px, Blur: 24px, Color: on_surface @ 6% opacity`.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at 15% opacity. Never use a 100% opaque border.

## 5. Components

### Action Buttons
*   **Primary:** Gradient (Primary to Primary Container), `0.5rem` (lg) roundedness. 
*   **Tertiary/Ghost:** No container. Use `primary` text with an icon.
*   **Mobile (LIFF):** Buttons must be full-width and utilize the `display-sm` type scale for maximum thumb-tap confidence.

### Data Cards & Survey Sheets
*   **No Dividers:** Separate content chunks using the Spacing Scale (e.g., `1.5rem` vertical gaps) rather than horizontal lines.
*   **The "Nakhon" Card:** Use a `surface_container_lowest` background. For status, don't use a full colored card; use a vertical 4px "accent bar" on the left edge using `secondary` (Success) or `tertiary` (Warning).

### Map Overlays (Desktop & Mobile)
*   **Container:** `surface_container_high` with 80% opacity and backdrop-blur.
*   **Corners:** `0.75rem` (xl) roundedness to soften the technical data.
*   **Interaction:** Overlays should "slide" from the bottom on Mobile (LIFF) and "float" with ambient shadows on Desktop Admin.

### Input Fields
*   **Style:** Filled style using `surface_container_highest`. 
*   **Active State:** No heavy border; instead, use a 2px `primary` underline or a subtle `primary` ghost border.

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts in the Admin dashboard. Place key KPIs off-center to create a modern, editorial flow.
*   **Do** use `surface_bright` to highlight active navigation states.
*   **Do** prioritize "Breathing Room." If a screen feels crowded, increase the spacing rather than adding a divider.

### Don't:
*   **Don't** use pure black (#000000) for text. Use `on_surface` (#121c28) to maintain a premium, ink-like softness.
*   **Don't** use the `DEFAULT` (0.25rem) roundedness for large containers; reserve it for small tags. Use `lg` or `xl` for structural elements.
*   **Don't** use standard "Warning Red" for everything. Use the `tertiary` (Ochre) for targets and `error` (#ba1a1a) strictly for critical system failures.