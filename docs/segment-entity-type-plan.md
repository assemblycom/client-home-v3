# Segment Entity Type Support — Implementation Plan

## Goal

Support segments that use custom fields from **both** `CLIENT` and `COMPANY` entities. Currently, segments only work with client custom fields.

## Key Changes

1. **Add `entityType`** to the segments table — indicates whether the segment's custom field belongs to a client or company
2. **Add `customFieldId`** to the segments table — stores the custom field ID for future use
3. **Update the DB trigger** — enforce that all segments in a workspace share the same `entityType` (in addition to `customField`)
4. **Update backend** — service validation, client-matching logic for company custom fields
5. **Update frontend** — group custom fields by entity type (Client / Company) in the creation dropdown

---

## PRs (ordered by dependency)

### PR 1: Database — Add `entityType` and `customFieldId` columns to segments

**Scope:** Schema + migration only. No logic changes.

- [ ] Add `entityType` column (`text`, NOT NULL, default `'CLIENT'`) to `segments.schema.ts`
- [ ] Add `customFieldId` column (`text`, nullable) to `segments.schema.ts`
- [ ] Generate Drizzle migration (`pnpm drizzle-kit generate`)
- [ ] Update DB trigger `enforce_workspace_custom_field()` to also enforce same `entity_type` across segments in a workspace
- [ ] Update `SegmentSchema`, `SegmentCreateSchema` types (auto from drizzle-zod)
- [ ] Run `pnpm typecheck` and `pnpm lint`

**Why first:** All other PRs depend on these columns existing.

---

### PR 2: Backend — Pass and validate `entityType` + `customFieldId` through the stack

**Scope:** DTOs, service, controller, repository updates.

- [ ] Update `SegmentCreateDtoSchema` to accept `entityType` (optional, defaults to `'CLIENT'`) and `customFieldId` (optional)
- [ ] Update `FormattedSegmentDataSchema` to include `entityType` and `customFieldId`
- [ ] Update `SegmentsService.validateCustomField()` to use the provided `entityType` instead of hardcoded `CLIENT`
- [ ] Update `SegmentsService.create()` to pass `entityType` and `customFieldId` to the repository
- [ ] Update `SegmentsService.resolveSettingForClient()` to handle company entity type:
  - If `entityType === 'COMPANY'`, look up the client's company and match against company custom fields
  - If `entityType === 'CLIENT'`, keep existing behavior (match against `client.customFields`)
- [ ] Update `SegmentsService.getStats()` to pre-fetch companies when `entityType === 'COMPANY'`
- [ ] Update `formatSegmentData()` to include `entityType` in the response
- [ ] Run `pnpm typecheck` and `pnpm lint`

**Key consideration:** `resolveSettingForClient` currently receives a `ClientResponse`. For company custom fields, we need the client's company data. Options:
- Pre-fetch all companies and pass a lookup map alongside `allSettings`
- Lookup company from `client.companyIds[0]`

---

### PR 3: Frontend — Group custom fields by entity type in segment creation

**Scope:** UI changes to `SegmentCreationCard` and `SegmentFormPanel`.

- [ ] Update `SegmentCreationCard` to use both `clientCustomFields` and `companyCustomFields` from `useCustomFields()`
- [ ] Group the custom field options in the `Select` dropdown with section headers: **Client** / **Company**
- [ ] When a custom field is selected, track which entity type it belongs to
- [ ] Pass `entityType` and `customFieldId` when creating a segment (`createSegment.mutate(...)`)
- [ ] Update `SegmentFormPanel` to find the custom field in the correct entity type list (client or company)
- [ ] Update the `Select` component to support grouped options (with group label headers)
- [ ] Update `useSegmentMutations` if needed to pass the new fields
- [ ] Run `pnpm typecheck` and `pnpm lint`

---

## Technical Notes

- `entityType` values: `'CLIENT'` | `'COMPANY'` — aligns with `CustomFieldEntityType` enum from `@assembly/types`
- The existing DB trigger enforces all segments in a workspace use the same `customField`. We should also enforce they use the same `entityType` (a workspace can't mix client and company custom fields across segments).
- `customFieldId` is stored for future use but not actively used in matching logic (matching uses `customField` key).
- Both `ClientResponse` and `CompanyResponse` already have `customFields: Record<string, any>` — so the matching logic pattern is the same.
- `CompanyResponse` is already fetched via `assembly.getCompanies()` — we can reuse this for company-based matching.
