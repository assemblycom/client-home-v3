# Segments UI — Product Requirements Document

**Ticket:** OUT-3300 (Segments UI)
**Branch:** `anit/out-3327-add-ui-to-list-all-the-segments-with-their-count`
**Date:** 2026-03-12

---

## Overview

Segments allow workspace admins to tailor homepage content for different client groups. By default, all clients see the same content ("Default" segment). Admins can create segments based on a single custom field (e.g. "Tier") to show different homepage variants to different client groups.

---

## Sub-tickets

| Ticket | Title | Status |
|--------|-------|--------|
| OUT-3327 | Add UI to list all segments with their count | In Progress |
| OUT-3328 | Add UI to facilitate initiation of creation of new segment | Todo |
| OUT-3329 | Create a new sidebar view to allow editing and creating segment | Todo |

---

## Feature Breakdown

### 1. Segment List (OUT-3327)

**Location:** Sidebar accordion — "Segments" section

**Design:** Collapsible accordion with title "Segments" and a chevron toggle.

**States:**

- **No segments created:** Show only "Default" row with total client count and a grey dot indicator. Description text: _"By default, all clients see the same content. Create segments to tailor your homepage for different clients."_
- **Segments exist:** Show "Default" row (grey dot, client count) + each created segment as a row (colored dot, segment name, client count, ellipsis `...` menu on hover for edit/delete actions).

**Segment Row Structure:**
- Color dot indicator (grey for Default, categorical color for custom segments)
- Segment name (e.g. "Gold")
- Client count (e.g. "60 clients")
- Overflow menu (ellipsis icon) — visible on hover for non-default segments

**Topbar Integration:** When segments exist, show a segment selection dropdown in the topbar. Default selection is "Default". Switching segments changes which homepage variant the admin is editing.

---

### 2. Segment Creation Initiation (OUT-3328)

**Location:** Below the segment list in the sidebar, inside a grey (`#f8f9fb`) bordered card.

**UI Elements:**
- Label: "Segment by"
- Dropdown: Lists workspace custom fields (placeholder: "Select custom field")
- Button: "Create segment" — outlined, centered

**States:**

- **Default (no selection):** Dropdown shows placeholder. Button is enabled.
- **Error — no custom field selected:** Dropdown border turns red (`#991a00`). Error message below: _"Start by selecting a custom field"_ with error icon.
- **No custom fields in workspace:** Dropdown is disabled. Tooltip appears: _"Use CRM tags to decide who sees this segment."_ with a "Help guide" link.
- **5+ segments exist:** Hide this entire creation UI (max 5 segments per workspace).

**Behavior:**
- First segment creation locks the workspace to the selected custom field for all future segments.
- To change the custom field, all existing segments must be deleted first.
- Only `multiSelect` type custom fields are supported initially.

---

### 3. Segment Creation / Edit Sidebar (OUT-3329)

**Location:** Dedicated right-panel sidebar view (slides in, replaces or overlays main content area).

**Header:**
- Back button (arrow + "Back" label) — returns to main sidebar
- Title: "Create segment"
- Subtitle: _"Create a homepage variant for a specific client group."_

**Statistics Bar** (below header, bordered section):
- "Total" label with total client count (e.g. "132 clients")
- Progress bar showing segment distribution
- "Default" row with remaining/unassigned client count

**Form Fields:**

1. **Name** (required)
   - Text input, label "Name"
   - e.g. "Gold"

2. **Assignment Rules** (required)
   - Label: "Show this segment if"
   - Bordered rule box containing:
     - Custom field name displayed as static text (e.g. "Tier")
     - Condition dropdown (placeholder: "Select condition") — currently only "is" is supported
     - Value dropdown (placeholder: "Select tier") — lists values from the multiSelect custom field

3. **Additional OR Conditions** (optional)
   - Label: "Or"
   - Dropdown with a selected value (e.g. "Gold")
   - "+ OR rule" button to add more conditions
   - Empty/blank conditions are removed on save

**Validation Rules:**
- Name is required
- At least one valid value must be selected
- Custom field must be selected
- Condition selection is no longer required (only "is" exists)
- Blank additional conditions are stripped on save

**Action Bar** (sticky footer):
- "Create" button (primary, dark) — or "Save" when editing
- "Cancel" button (secondary, outlined)

**Edit Mode:**
- Same form, pre-populated with existing segment data
- Open question: should empty conditions be removed during edit? (flagged for @arpan.dhakal)

**Delete:** Available via overflow menu on segment list rows. Confirmation required.

---

## Design References (Figma)

| Screen | Node ID | Description |
|--------|---------|-------------|
| Main overview | `13068:36072` | Full segments UI overview |
| Segment list + creation card | `13092:44240` | Accordion with segment rows + "Segment by" card |
| Error: no custom field selected | `13068:41557` | Red border + error message state |
| No custom fields / tooltip | `13099:49506` | Disabled state with tooltip + help link |
| Create/Edit sidebar | `13092:48266` | Full creation form with rules |

All designs are in Figma file `Z9ONck5HGIqNDszxj5YM0G` (Platform).

---

## Business Rules

1. **Max 5 segments** per workspace (creation UI hidden at limit).
2. **Single custom field lock:** Once the first segment is created with a custom field, all subsequent segments use the same field. Reset requires deleting all segments.
3. **Only multiSelect custom fields** are supported in v1.
4. **OR-only conditions:** Multiple rules within a segment are combined with OR logic (not AND).
5. **Default segment** is always present, cannot be deleted, and contains all clients not matched by other segments.
6. **Client counts** should show loading skeletons until the API resolves.

---

## UI Component Mapping

| Design Element | Likely Existing Component |
|----------------|--------------------------|
| Accordion | Sidebar accordion (existing pattern) |
| Segment rows | Custom list items |
| Color dots | 8px circles with categorical colors |
| Overflow menu | Ellipsis icon + dropdown menu |
| Dropdowns | Existing select/dropdown components |
| Text inputs | Existing text field components |
| Buttons (primary/secondary) | Existing button components from design system |
| Error messages | Existing form error pattern |
| Tooltips | Existing tooltip component |
| Progress bar | Custom bar with segment colors |
| Loading skeletons | Existing skeleton components |

---

## Open Questions

- [ ] Should empty conditions be removed during segment edit? (@arpan.dhakal)
- [ ] Color assignment strategy for segment dots — automatic or user-selected?
- [ ] Should we send color values from multiSelect field data?
