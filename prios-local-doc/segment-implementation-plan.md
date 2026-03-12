# Segments UI — Implementation Plan

**Parent ticket:** OUT-3300 | **Branch:** `anit/out-3327-add-ui-to-list-all-the-segments-with-their-count`

---

## What Already Exists

| Layer | What's done | Where |
|-------|-------------|-------|
| DB schema | `segments` + `conditions` tables with relations | `src/features/segments/lib/segments/segments.schema.ts`, `conditions/conditions.schema.ts` |
| Service | `SegmentsService` with `getAll()` and `create()` | `src/features/segments/lib/segments.service.ts` |
| Repository | `SegmentsDrizzleRepository` (getAll, createOne) + `ConditionsDrizzleRepository` (createMany) | `segments.repository.ts`, `conditions.repository.ts` |
| Controller | GET + POST handlers | `src/features/segments/lib/segments.controller.ts` |
| API route | `/api/segments` (GET, POST) | `src/app/api/segments/route.ts` |
| DTOs | `SegmentCreateDtoSchema`, `SegmentResponseDtoSchema` | `src/features/segments/lib/segments.dto.ts` |
| UI (stub) | `<Segment />` + `<SegmentCard />` with static dummy data | `src/features/editor/components/Sidebar/Segment/` |
| Sidebar | Segments accordion already wired in `Sidebar.tsx` | `src/features/editor/components/Sidebar/Sidebar.tsx` |
| Custom fields hook | `useCustomFields()` fetches client + company fields | `src/features/custom-fields/hooks/useCustomFields.ts` |

## What's Missing

| Layer | What's needed |
|-------|---------------|
| Backend | Multi-select options API proxy (`listCustomFieldOptions`). **Update/delete/stats already in PR #96.** |
| Frontend hooks | `useSegments()` hook (TanStack Query). `useSegmentMutations()` for CRUD. `useSegmentStats()` for counts. Hook to fetch multi-select field options. |
| UI — Segment list | Replace dummy `SegmentCard` with real segment rows (colored dot, name, count, overflow menu). |
| UI — Creation initiation | "Segment by" card with custom field dropdown + "Create segment" button. Error/empty states. |
| UI — Create/Edit sidebar | New sidebar view with form: name, assignment rules, OR conditions, action bar. |
| Store | Zustand store for segment sidebar state (active view, editing segment, selected custom field). |

## PR #96 (OUT-3316) — Already Provides

PR #96 (`OUT-3316` branch) adds the following backend pieces that we depend on:

| What | Details |
|------|---------|
| **Segment stats API** | `GET /api/segments/stats` → `{ totalClients, stats: [{ name, color, count }] }` |
| **Update segment** | `PATCH /api/segments/[segmentId]` — updates name and/or conditions |
| **Delete segment** | `DELETE /api/segments/[segmentId]` — soft delete |
| **Repository additions** | `getOne`, `updateOne`, `softDelete` on segments repo; `getBySegmentId`, `updateOne`, `deleteBySegmentId` on conditions repo |
| **DTOs** | `SegmentUpdateDtoSchema`, `SegmentStatSchema`, `SegmentStatsResponseDtoSchema` |
| **Color allocation** | `allocateSegmentColors()` util with categorical color palette |
| **Client matching** | `SegmentsService.clientBelongsToSegment()` — matches clients to segments by custom field values |
| **Routes** | `/api/segments/:segmentId` (PATCH, DELETE) + `/api/segments/stats` (GET) registered in `routes.ts` |

**Action:** Merge PR #96 into this branch (or rebase on top of it) before starting frontend work.

---

## Implementation Phases

### Phase 1: Backend Completion

**Goal:** Complete the remaining API pieces. Most backend is done via PR #96.

#### 1a. Merge PR #96 into this branch

PR #96 provides: update/delete endpoints, stats API, color allocation, client matching.
- Rebase or merge `OUT-3316` branch into current branch

#### 1b. Wire `listCustomFieldOptions` in Assembly client

SDK method: `assembly.listCustomFieldOptions({ id, label? })` → `{ data: [{ id, key, label, color }] }`
- Add `_listCustomFieldOptions` + `listCustomFieldOptions` (with retry) to `AssemblyClient`
- Add Zod response schema: `ListCustomFieldOptionsResponseSchema` in `src/lib/assembly/types.ts`
- Create API route: `/api/custom-fields/[id]/options/route.ts`
- Controller: proxy call to `assembly.listCustomFieldOptions({ id })`

---

### Phase 2: Frontend Hooks + Store

#### 2a. `useSegments()` + `useSegmentStats()` hooks

```
Location: src/features/segments/hooks/useSegments.ts
```
- `useSegments()` — TanStack Query: `GET /api/segments?token=...` → `{ segments, isLoading }`
- `useSegmentStats()` — TanStack Query: `GET /api/segments/stats?token=...` → `{ totalClients, stats: [{ name, color, count }] }`
- Query keys: `['segments']`, `['segments', 'stats']`

#### 2b. `useSegmentMutations()` hook

```
Location: src/features/segments/hooks/useSegmentMutations.ts
```
- `createSegment` mutation (POST)
- `updateSegment` mutation (PUT/PATCH)
- `deleteSegment` mutation (DELETE)
- Invalidate `['segments']` query on success

#### 2c. `useCustomFieldOptions()` hook

```
Location: src/features/custom-fields/hooks/useCustomFieldOptions.ts
```
- Calls `GET /api/custom-fields/[id]/options?token=...`
- SDK: `assembly.listCustomFieldOptions({ id })` → returns `{ data: [{ id, key, label, color }] }`
- Only enabled when a multi-select (TAGS) field is selected
- For non-multi-select fields, returns empty — UI shows a plain text input instead

#### 2d. Segment sidebar store

```
Location: src/features/segments/stores/segmentSidebarStore.ts
```
- `view`: `'list' | 'create' | 'edit'`
- `editingSegmentId`: `string | null`
- `selectedCustomField`: `string | null`
- Actions: `setView()`, `startEditing(id)`, `reset()`

---

### Phase 3: Segment List UI (OUT-3327)

**Goal:** Replace static dummy with real segment list.

#### 3a. Refactor `<Segment />` component

```
Location: src/features/editor/components/Sidebar/Segment/Segment.tsx
```
- Fetch segments via `useSegments()`
- Show description text
- Render `<SegmentList />` with real data
- Show "Segment by" creation card below (Phase 4)

#### 3b. `<SegmentList />` component

```
Location: src/features/segments/components/SegmentList.tsx
```
- Bordered container with segment rows
- Each row: colored dot (8px circle) + name + client count + overflow menu (ellipsis)
- "Default" row always first (grey dot, shows unassigned client count)
- Custom segments show categorical colors (amber, blue, green, etc.)
- Loading skeleton while fetching
- Overflow menu items: "Edit", "Delete" (not on Default)

#### 3c. Reuse from design system

- `IconButton icon="Ellipsis"` — already used in existing `SegmentCard`
- `Button` — for "Create segment" button
- Colors: use Tailwind categorical color classes or CSS variables from Figma tokens

---

### Phase 4: Segment Creation Initiation (OUT-3328)

**Goal:** "Segment by" card with custom field dropdown.

#### 4a. `<SegmentCreationCard />` component

```
Location: src/features/segments/components/SegmentCreationCard.tsx
```
- Grey background card (`bg-surface-secondary` or `bg-[#f8f9fb]`)
- "Segment by" label
- Custom field dropdown (using `useCustomFields()` to populate)
- "Create segment" button
- Hidden when 5+ segments exist

#### 4b. States

- **Default:** Dropdown with placeholder "Select custom field", button enabled
- **Error (no selection):** Red border on dropdown, error text "Start by selecting a custom field"
- **No custom fields:** Dropdown disabled, tooltip: "Use CRM tags to decide who sees this segment." + "Help guide" link
- **Locked:** If segments exist, dropdown shows the locked custom field (disabled), label shows the field name

---

### Phase 5: Create/Edit Sidebar (OUT-3329)

**Goal:** Dedicated sidebar panel for creating/editing segments.

#### 5a. Wire new sidebar view

- Add `'create-segment'` and `'edit-segment'` to `sidebarStore` views
- When user clicks "Create segment" → `setSidebarView('create-segment')`
- When user clicks "Edit" from overflow → `setSidebarView('edit-segment')` + store segment ID

#### 5b. `<SegmentFormPanel />` component

```
Location: src/features/segments/components/SegmentFormPanel.tsx
```
- Header: Back button, title ("Create segment" / "Edit segment"), subtitle
- Statistics bar: total clients, progress bar, default count
- Form:
  - **Name** text input (required)
  - **"Show this segment if"** section:
    - Static custom field name label (e.g. "Tier")
    - Condition is always "is" (no dropdown needed)
    - Value: dropdown (multi-select field) OR text input (other field types)
  - **OR conditions:** Additional value fields with "+ OR rule" button
  - Blank conditions stripped on save
- Footer: "Create" / "Save" primary button + "Cancel" secondary button

#### 5c. Form state management

- Use React `useState` / `useReducer` for local form state (no Zustand needed for the form itself)
- On submit: call `createSegment` or `updateSegment` mutation
- On success: switch back to list view, invalidate segments query

---

## Key Decisions

1. **Condition dropdown not needed** — always "is" for now. Just show the value selector.
2. **Multi-select fields** → dropdown with options from Assembly API. **Other field types** → plain text input.
3. **Client counts** — deferred to separate PR. Segment list shows rows without counts for now.
4. **Max 5 segments** — hide creation UI at limit, enforce in service too.
5. **Single custom field lock** — DB trigger already enforces this. UI should show locked field name when segments exist.
6. **Categorical colors** — assign from a predefined palette based on segment index.

---

## File Changes Summary

### New files (our PR)
| File | Purpose |
|------|---------|
| `src/features/segments/hooks/useSegments.ts` | TanStack Query hooks for segments + stats |
| `src/features/segments/hooks/useSegmentMutations.ts` | Create/update/delete mutations |
| `src/features/custom-fields/hooks/useCustomFieldOptions.ts` | Fetch multi-select options |
| `src/features/segments/stores/segmentSidebarStore.ts` | Sidebar view state |
| `src/features/segments/components/SegmentList.tsx` | List of segment rows |
| `src/features/segments/components/SegmentCreationCard.tsx` | "Segment by" initiation card |
| `src/features/segments/components/SegmentFormPanel.tsx` | Create/edit form sidebar |
| `src/app/api/custom-fields/[id]/options/route.ts` | Custom field options proxy |

### Modified files (our PR)
| File | Change |
|------|--------|
| `src/lib/assembly/assembly-client.ts` | Add `listCustomFieldOptions` method |
| `src/lib/assembly/types.ts` | Add `ListCustomFieldOptionsResponseSchema` |
| `src/features/editor/components/Sidebar/Segment/Segment.tsx` | Wire real data, replace dummy |
| `src/features/editor/components/Sidebar/Sidebar.tsx` | Add create/edit segment sidebar views |
| `src/features/editor/stores/sidebarStore.ts` | Add segment sidebar view types |

### From PR #96 (already done, just merge)
| File | Change |
|------|--------|
| `src/app/api/segments/[segmentId]/route.ts` | PATCH + DELETE routes |
| `src/app/api/segments/stats/route.ts` | Stats API route |
| `src/features/segments/lib/segments.service.ts` | `update()`, `delete()`, `getStats()` |
| `src/features/segments/lib/segments/segments.repository.ts` | `getOne`, `updateOne`, `softDelete` |
| `src/features/segments/lib/conditions/conditions.repository.ts` | `getBySegmentId`, `updateOne`, `deleteBySegmentId` |
| `src/features/segments/lib/segments.controller.ts` | `updateSegment`, `deleteSegment`, `getSegmentStats` |
| `src/features/segments/lib/segments.dto.ts` | `SegmentUpdateDtoSchema`, `SegmentStatsResponseDtoSchema` |
| `src/features/segments/lib/segments.colors.ts` | `allocateSegmentColors()` |

### Files to delete
| File | Reason |
|------|--------|
| `src/features/editor/components/Sidebar/Segment/SegmentCard.tsx` | Replaced by `SegmentList` |

---

## Progress Checklist

### Phase 1: Backend
- [x] Merge PR #96 (`OUT-3316`) into this branch — provides update/delete/stats APIs
- [x] Wire `listCustomFieldOptions` in `AssemblyClient` (with Zod schema + retry)
- [x] Create `/api/custom-fields/[id]/options/route.ts`

### Phase 2: Frontend Hooks + Store
- [x] Create `useSegments()` hook
- [x] Create `useSegmentStats()` hook
- [x] Create `useSegmentMutations()` hook (also invalidates stats)
- [x] Create `useCustomFieldOptions()` hook
- [x] Add segment views to sidebar store (`create-segment`, `edit-segment`, `editingSegmentId`)

### Phase 3: Segment List UI (OUT-3327)
- [x] Refactor `<Segment />` to use real data
- [x] Build `<SegmentList />` with segment rows
- [x] Add colored dot indicators
- [x] Add overflow menu (edit/delete) on segment rows
- [x] Add loading skeleton state
- [x] Delete old `<SegmentCard />` (replaced by SegmentList)

### Phase 4: Creation Initiation (OUT-3328)
- [x] Build `<SegmentCreationCard />`
- [x] Custom field dropdown with `useCustomFields()`
- [x] Error state (no field selected)
- [x] Empty state (no custom fields in workspace)
- [x] Hide when 5+ segments exist
- [x] Lock dropdown when segments already exist

### Phase 5: Create/Edit Sidebar (OUT-3329)
- [x] Add segment views to sidebar store
- [x] Build `<SegmentFormPanel />` layout (header, stats, form, footer)
- [x] Name input field
- [x] Assignment rules section (static field name + value selector)
- [x] Multi-select dropdown OR text input based on field type
- [x] OR conditions with "+ OR rule" button
- [x] Form validation (name required, at least one value)
- [x] Create mutation integration
- [x] Edit mode (pre-populate form)
- [x] Delete confirmation from overflow menu (in SegmentList)
- [x] Wire everything in `Sidebar.tsx`

### Polish
- [ ] Topbar segment selector dropdown (when segments exist)
- [x] Verify typecheck passes (`pnpm typecheck`)
- [x] Verify lint passes (`pnpm lint`)
- [ ] Manual test all states
