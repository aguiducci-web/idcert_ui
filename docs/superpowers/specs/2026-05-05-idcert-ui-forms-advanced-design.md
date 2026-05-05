# Plan 4b — Forms Advanced (DatePicker, DateRangePicker, TimePicker, FileUpload)

**Status**: Design approved
**Date**: 2026-05-05
**Author**: Andrea Alunni Guiducci
**Target version**: `@idcert/ui` v0.5.0
**Branch**: `feat/forms-advanced` (off `main` after Plan 4a v0.4.0 + Slider scalar fix)
**Predecessor**: Plan 4a — Forms Base (`feat/forms-base`, v0.4.0)

---

## Overview

Plan 4b is the second half of the Form avanzati category from the master spec. It covers the four heavy custom components that Plan 4a deferred:

- **DatePicker** — single-date picker built on Base UI Popover + `react-day-picker` `<DayPicker mode="single">`.
- **DateRangePicker** — range-date picker built on the same primitives with `<DayPicker mode="range">`, value shape `{ from, to }`.
- **TimePicker** — minimal styled wrapper around the native `<input type="time">`.
- **FileUpload** compound — drag-drop zone + click-to-browse, with built-in size/type/count validation and image thumbnail previews. The compound exposes `FileUploadDropzone`, `FileUploadPrompt`, `FileUploadButton`, `FileUploadList`, and `FileUploadItem`.

After Plan 4b, the Form avanzati category from the master inventory is fully delivered.

---

## Goals

- Provide a date-input layer that feels native (popover + calendar) without locking consumers into a specific date library beyond `date-fns` (which `react-day-picker` already requires).
- Keep DatePicker and DateRangePicker as **two distinct public components** (not one with a `mode` prop), with a shared internal helper module to avoid duplicating popover/trigger/calendar styling.
- Ship a TimePicker that's a thin, well-styled wrapper around the native HTML time input — accessibility, mobile UX, and parsing all delegated to the browser.
- Ship a FileUpload compound that handles drag-drop, validation, and previews internally, while leaving upload transport entirely to the consumer.
- Keep `react-day-picker` and `date-fns` as peer dependencies, mirroring the RHF/zod model from Plan 4a.

## Non-goals (out of scope for Plan 4b)

- **Time range picker** (start + end orario): consumer composes two `<TimePicker>`.
- **DateTimePicker combinato** (date + time in one trigger): consumer composes `<DatePicker>` + `<TimePicker>`.
- **Calendar component standalone** (inline always-visible calendar): future export of the raw `DayPicker` wrapper.
- **DatePicker localized strings** (Today / Clear / placeholder): consumer passes localized strings via props.
- **FileUpload upload transport** (progress / cancel / retry / chunked / S3 multipart): consumer logic.
- **FileUpload server-side validation feedback**: consumer wraps with own `Alert` / toast.
- **FileUpload paste from clipboard** (CMD+V image): future additive feature.
- **Async disabled days** (e.g. "these days are full" from API): consumer passes through to `<DayPicker disabled={...}>`.
- **i18n preset locale bundle**: consumer imports `date-fns/locale/it` etc. directly.

---

## Architecture

### New peer + dev dependencies

In `packages/ui/package.json`:

```json
{
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19",
    "react-hook-form": "^7",
    "zod": "^3",
    "date-fns": "^3 || ^4",
    "react-day-picker": "^9"
  },
  "peerDependenciesMeta": {
    "react-hook-form": { "optional": false },
    "zod": { "optional": false },
    "date-fns": { "optional": false },
    "react-day-picker": { "optional": false }
  },
  "devDependencies": {
    "date-fns": "^4",
    "react-day-picker": "^9"
  }
}
```

`date-fns` and `react-day-picker` are runtime concerns of the consumer's app; the date locales the consumer chooses determine bundle size, so we deliberately don't bundle them into `@idcert/ui`. `react-day-picker` itself already declares `date-fns` as a peer, so this is the natural model.

No changes to `@idcert/tokens` or `@idcert/tailwind-config`. `tailwindcss-animate` (added in Plan 3) supplies the popover open/close animation utilities.

### Base primitive mapping

| Component         | Base primitive                                          | Custom logic |
|-------------------|---------------------------------------------------------|--------------|
| DatePicker        | `Base UI Popover.*` (anchor + popup)                    | Trigger button styled like `Input` with trailing `Calendar` icon (lucide); `<DayPicker mode="single">` rendered inside `Popover.Popup`; formatted display via `date-fns/format` |
| DateRangePicker   | `Base UI Popover.*`                                     | Same trigger pattern; `<DayPicker mode="range" numberOfMonths={2}>`; trigger renders `format(from)` − `format(to)` (or `format(from) − ?` for partial range) |
| TimePicker        | Native `<input type="time">`                            | cva styling matching `Input` (h-10, border-input, focus ring, disabled state) |
| FileUpload        | Custom `<div>` drop zone + hidden `<input type="file">` | React drag-drop event handlers, size/type/count validation, preview generation via `URL.createObjectURL` (auto-revoked on unmount/remove), internal context for sub-parts |

### Internal `_shared.tsx` for DatePicker / DateRangePicker

Both date components share:
- The trigger button (styled like `Input`, with `Calendar` lucide icon at right).
- The popover wrapper (Base UI `Popover` with our standard popup styling — same classes as `Select` content).
- The `<DayPicker>` `classNames` mapping that themes the calendar with our Tailwind tokens.

We extract these into `packages/ui/src/components/date-picker/_shared.tsx`:

```ts
// internal — not exported from package barrel
export function DatePopoverTrigger({ ... }: ...): JSX.Element
export function DatePopoverContent({ ... }: ...): JSX.Element
export const dayPickerClassNames: DayPicker['props']['classNames']
```

`DateRangePicker` imports from `'../date-picker/_shared.js'`. The underscore prefix marks the file as private; `index.ts` does not re-export it.

This avoids ~150 lines of duplicated styling and keeps the public API surface honest (two components, one shared internal).

### CSS for `react-day-picker`

`react-day-picker` v9 ships an optional `react-day-picker/style.css`. **We do not use it.** The calendar is themed entirely via the `classNames` prop using Tailwind utility classes that match our tokens. This:
- Saves ~3 KB of CSS the consumer would otherwise import.
- Prevents drift between our design tokens and the bundled stylesheet.
- Keeps customization in one place (the `dayPickerClassNames` constant in `_shared.tsx`).

The consumer does not need to import any CSS for date components to look correct.

---

## Component APIs

### 1. DatePicker (single)

```tsx
import { it } from 'date-fns/locale'

<DatePicker
  value={date}                  // Date | undefined
  onValueChange={setDate}        // (date: Date | undefined) => void
  defaultValue
  placeholder="Scegli data…"
  locale={it}                   // optional, default = en-US (date-fns default)
  format="dd/MM/yyyy"           // optional, date-fns format string, default "PPP" (long localized)
  disabled
  fromDate                      // Date — min selectable
  toDate                        // Date — max selectable
  aria-label
/>
```

**Public surface**: monolithic. No exported sub-parts. Internal structure (Popover.Trigger / Popover.Content / DayPicker) is hidden because the integration is highly opinionated: the calendar always lives in the popover, the trigger is always the styled button. Consumers who need a custom layout can compose `Popover` + `Calendar` directly in a future Plan.

**Trigger**: a button with `flex` layout, `Input`-matching height (`h-10`), border-input, focus ring, and a trailing `Calendar` icon (lucide, `h-4 w-4 opacity-50`). When no value: shows `placeholder` (muted). When value set: shows `format(value, formatString, { locale })`.

**Popover content**: themed `<DayPicker mode="single" selected={value} onSelect={onValueChange} ...>` with our `classNames` mapping. Closes on day click. ESC closes. Click-outside closes (Base UI Popover backdrop).

**Locale**: optional. If omitted, `date-fns/format` uses `en-US` by default. Consumers who need localized day names / month names / first day of week pass `locale` from `date-fns/locale`.

**fromDate / toDate**: pass-through to `<DayPicker>` for min/max selectable date constraint.

**Form integration**: `DatePicker` accepts `value`/`onValueChange` and is fully controllable. With `<FormField>` and `<FormControl>`, the consumer wraps `<DatePicker>` directly inside `<FormControl>` — the Slot will inject `id` / `aria-describedby` / `aria-invalid` onto the trigger button (since `DatePicker` is a `forwardRef`'d component that propagates props to its trigger).

### 2. DateRangePicker

```tsx
import { it } from 'date-fns/locale'

<DateRangePicker
  value={{ from: Date, to: Date | undefined }}    // DateRange | undefined
  onValueChange={setRange}                         // (range: DateRange | undefined) => void
  defaultValue
  placeholder="Scegli range…"
  locale={it}
  format="dd/MM/yyyy"           // applied to both from and to
  disabled
  fromDate
  toDate
  numberOfMonths={2}            // default 2 for range UX, override allowed
  aria-label
/>
```

**Public surface**: monolithic, no sub-parts.

**Type re-export**: `export type { DateRange } from 'react-day-picker'` from `date-range-picker/index.tsx`. Consumer imports `DateRange` from `@idcert/ui`, not from `react-day-picker`, for ergonomic consistency.

**Trigger display**:
- Both dates set: `format(from) − format(to)`.
- Only `from` set: `format(from) − ?`.
- Empty: `placeholder`.

**Popover content**: `<DayPicker mode="range" selected={value} onSelect={onValueChange} numberOfMonths={2} ...>`. Two months side-by-side by default for clarity. Mobile UX could collapse to one — addressed by future responsive prop, out of scope.

**Form integration**: same as `DatePicker`. `<FormControl><DateRangePicker .../></FormControl>` works out of the box.

### 3. TimePicker

```tsx
<TimePicker
  value="14:30"                // string in HH:mm (or HH:mm:ss when step < 60)
  onValueChange={setTime}        // (time: string) => void
  defaultValue
  step={300}                   // seconds; controls native input precision
  min="08:00"                  // optional, native input min
  max="20:00"                  // optional, native input max
  disabled
  aria-label
/>
```

**Public surface**: monolithic. No sub-parts.

**Implementation**: a `forwardRef` wrapping `<input type="time">` with cva styling identical to `Input`. The `onValueChange` wraps the native `onChange` to extract `event.target.value` (the time string). All other props (`required`, `name`, `id`, ARIA, etc.) pass through.

**Locale awareness**: native HTML time inputs handle 12h vs 24h display based on the user's locale. We don't override; the consumer gets browser-native behavior.

**Mobile**: native time picker (iOS / Android wheel UI) is invoked automatically.

**Form integration**: `<FormControl><TimePicker {...field} /></FormControl>` works directly — `field.value` is a string, `field.onChange` accepts the string.

### 4. FileUpload (compound)

```tsx
<FileUpload
  value={files}                      // File[]
  onValueChange={setFiles}            // (files: File[]) => void
  defaultValue={[]}
  accept="image/*,.pdf"               // standard input accept
  maxSize={5 * 1024 * 1024}           // bytes; optional
  maxFiles={3}                        // optional; 0/undefined = no limit
  multiple={true}                     // single vs multi
  disabled
  onError={(error) => ...}            // optional; fired on validation failure
>
  <FileUploadDropzone>
    <FileUploadPrompt>
      Trascina qui i file o <FileUploadButton>scegli</FileUploadButton>
    </FileUploadPrompt>
  </FileUploadDropzone>
  <FileUploadList />                   {/* renders preview thumbnails + remove */}
</FileUpload>
```

**Sub-parts** (all exported):

- `FileUpload` — root. Maintains controlled/uncontrolled state of `File[]`. Provides internal `FileUploadContext` ({ value, setValue, accept, maxSize, maxFiles, multiple, disabled, onError }). Renders nothing visible itself — children compose the visible UI.
- `FileUploadDropzone` — the visible drop area. `<div>` with `forwardRef`. Listens for `onDragEnter`/`onDragLeave`/`onDragOver`/`onDrop`. Sets `data-dragging` while drag is hovering for styling (`data-[dragging]:border-primary`). On drop: validates files, calls `setValue(merged)`, fires `onError` on rejection.
- `FileUploadPrompt` — semantic `<p>` styling for the prompt text. Renders `children` (consumer composes `FileUploadButton` inside).
- `FileUploadButton` — actual `<button>` that triggers a hidden `<input type="file">` with current `accept`/`multiple`. Click bubbles to input click. Internal hidden input is mounted by `FileUploadDropzone` (one per FileUpload root) and the button forwards `onClick` to it.
- `FileUploadList` — `<ul>` listing current files. Renders one `FileUploadItem` per file. Auto-renders the standard layout: thumbnail (image preview or icon), name, size, X-remove button.
- `FileUploadItem` — exported for consumer custom layout. Default rendering is what `FileUploadList` produces; consumer can map manually if they want custom item layout.

**Validation errors** (custom union type):

```ts
export type FileUploadError =
  | { type: 'size'; file: File; max: number }
  | { type: 'count'; max: number }
  | { type: 'accept'; file: File }
```

The `onError` callback fires once per rejected file (or once for `count` with the limit). When `onError` is omitted, rejected files are silently dropped — there's no global toast/alert UI from the component.

**Preview generation**:
- `file.type.startsWith('image/')`: `URL.createObjectURL(file)` → `<img>` thumbnail at 48×48 with `object-cover`.
- Other types: lucide `File` icon at 48×48.
- Object URLs are tracked in a ref-keyed `Map<File, string>` and revoked on unmount or item removal to avoid memory leaks.

**Accept attribute**: passes through to the native input. When validating drops, we manually re-check against the accept pattern (the native input already enforces it for click-browse, but drag-drop bypasses native validation).

**Multiple = false**: each new selection replaces the existing array. UI hides "drag multiple" affordance via the dropzone's prompt text (consumer-controlled).

**Form integration**: `<FormControl><FileUpload .../></FormControl>` — `FormControl`'s Slot injects `id` / `aria-describedby` / `aria-invalid` onto the root, which propagates to the dropzone via context if needed. Initial integration relies on Slot cloning the `FileUpload` root; details refined during implementation.

---

## File structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── date-picker/
│   │   │   ├── index.tsx                  # DatePicker (single)
│   │   │   ├── _shared.tsx                # internal: DatePopoverTrigger, DatePopoverContent, dayPickerClassNames
│   │   │   ├── date-picker.test.tsx
│   │   │   └── date-picker.stories.tsx
│   │   ├── date-range-picker/
│   │   │   ├── index.tsx                  # DateRangePicker (uses _shared)
│   │   │   ├── date-range-picker.test.tsx
│   │   │   └── date-range-picker.stories.tsx
│   │   ├── time-picker/
│   │   │   ├── index.tsx                  # TimePicker (native input wrapper)
│   │   │   ├── time-picker.test.tsx
│   │   │   └── time-picker.stories.tsx
│   │   └── file-upload/
│   │       ├── index.tsx                  # FileUpload + Dropzone + Prompt + Button + List + Item + context + validation
│   │       ├── file-upload.test.tsx
│   │       └── file-upload.stories.tsx
│   └── index.ts                           # barrel: 4 module exports + DateRange type re-export
├── package.json                           # +peer deps + +dev deps
└── (no other changes)
```

The barrel `packages/ui/src/index.ts` adds:

```ts
export * from './components/date-picker'
export * from './components/date-range-picker'   // includes type DateRange re-export
export * from './components/time-picker'
export * from './components/file-upload'
```

`_shared.tsx` is **not** re-exported. It lives next to `date-picker/index.tsx` because that's where the Calendar styling is defined; `date-range-picker/index.tsx` imports from `'../date-picker/_shared.js'`.

**Storybook** (`apps/storybook`) auto-indexes the four new `*.stories.tsx` files via the existing glob. Stories live under categories `Form/DatePicker`, `Form/DateRangePicker`, `Form/TimePicker`, `Form/FileUpload`.

**Playground**: extend `apps/playground/app/forms/page.tsx` to include `DatePicker`, `DateRangePicker`, `TimePicker`, and `FileUpload` fields wired through RHF. Alternatively, create `apps/playground/app/forms-advanced/page.tsx` to keep the original Plan 4a smoke separate. Plan 4b implementation will choose; default is **extend** to keep one consolidated form smoke.

---

## Test scope

Stack unchanged from Plans 1–4a: `vitest` + `@testing-library/react` + `@testing-library/user-event`.

| Component       | Tests | Coverage |
|-----------------|------:|----------|
| DatePicker      | 8     | renders trigger placeholder, opens popover on click, click day fires onValueChange, controlled mode shows formatted date, custom locale formats correctly (e.g. Italian "5 maggio 2026"), `fromDate`/`toDate` disable out-of-range days, disabled prevents popover open, ref forwarding |
| DateRangePicker | 8     | renders trigger, opens popover, sequential click on two days fires onValueChange with `{from, to}`, partial range (only `from` set) shows correctly, controlled mode reflects passed range, two months rendered by default, disabled, ref forwarding |
| TimePicker      | 6     | renders styled native input, accepts HH:mm value, fires onValueChange on input, min/max attributes propagate to native input, disabled, ref forwarding |
| FileUpload      | 12    | renders dropzone + button, click button triggers hidden input, drop file calls onValueChange, multi-file drop, maxFiles limit fires count error, maxSize limit fires size error, accept rejects mismatched type and fires accept error, FileUploadList renders item with size, remove button removes file, image preview thumbnail (mocked URL.createObjectURL), non-image icon fallback, controlled mode reflects passed files |

**Plan 4b total**: ~34 tests.

**Test setup notes**:
- DatePicker tests use `vi.setSystemTime(new Date('2026-05-05'))` for stability when asserting "today" highlighting.
- FileUpload tests mock `URL.createObjectURL` and `URL.revokeObjectURL` in the test setup file (`vitest setup.ts`) since jsdom doesn't implement them by default.
- TimePicker tests are minimal — it's largely a styling pass-through, so we trust the browser to handle parsing.

Coverage target: 100% public API. No visual regression in this plan (cross-cutting concern).

---

## Versioning + release

Single changeset `.changeset/v0.5.0-forms-advanced.md`:

```markdown
---
'@idcert/ui': minor
---

Add 4 new components in the Form avanzati category (second half — completes the form layer).

Components:
- `DatePicker` — single-date picker built on Base UI Popover + react-day-picker. Props: `value`, `onValueChange`, `placeholder`, `locale`, `format`, `disabled`, `fromDate`, `toDate`.
- `DateRangePicker` — range-date picker. Same primitives, value is `DateRange` (`{ from, to? }`). Re-exports `DateRange` type.
- `TimePicker` — styled wrapper around native `<input type="time">`. Props: `value` (HH:mm string), `onValueChange`, `step`, `min`, `max`, `disabled`.
- `FileUpload` compound — drag-drop + click-to-browse with built-in `maxSize` / `accept` / `maxFiles` validation and image thumbnail previews. Sub-parts: `FileUploadDropzone`, `FileUploadPrompt`, `FileUploadButton`, `FileUploadList`, `FileUploadItem`. Validation error type: `FileUploadError` ({ type: 'size' | 'count' | 'accept' }). No upload logic — consumer owns transport.

New peer dependencies (consumer must install when using DatePicker / DateRangePicker):
- `date-fns` ^3 || ^4
- `react-day-picker` ^9

Out of scope (deferred):
- DateTimePicker combinato, Calendar standalone, Time range picker, FileUpload upload progress/transport, FileUpload paste-from-clipboard.
```

`@idcert/tailwind-config` and `@idcert/tokens` do not bump.

Consumers who only use TimePicker or FileUpload do not need `date-fns` or `react-day-picker` installed (those are imported only by the date-picker and date-range-picker modules, which are tree-shakeable).

---

## Risks and mitigations

- **react-day-picker v9 styling parity**: v9 changed `classNames` API from v8. We base the `dayPickerClassNames` mapping on v9 docs. If a class name doesn't exist or has changed semantics, we adapt during implementation and document.
- **Locale bundle size if consumer imports all date-fns**: documented in changeset note. Consumer imports only the locale they need (e.g. `import { it } from 'date-fns/locale'`).
- **DatePicker + FormControl Slot**: like Plan 4a Select, wrapping `DatePicker` in `FormControl` clones the `DatePicker` function component. We need to ensure the trigger button receives `id` / `aria-describedby` / `aria-invalid`. Test covers this. If Slot doesn't propagate cleanly, we add explicit prop forwarding inside `DatePicker`.
- **FileUpload object URL leaks**: aggressively revoke URLs on unmount and per-file removal. Test verifies `revokeObjectURL` is called.
- **FileUpload accessibility for drag-drop**: drag-drop is mouse-only by default; the `FileUploadButton` provides keyboard-accessible alternative. ARIA `role="button"` + `aria-describedby` for the dropzone explains the click-to-browse fallback.
- **TimePicker locale rendering**: native input UI is browser-locale-driven; we can't override 12h vs 24h. Documented as expected behavior, not a bug.
- **react-day-picker SSR**: v9 supports SSR but emits warnings if `today` is a moving target. We pass an explicit `today` prop or accept default behavior. Tested in jsdom only; production SSR (Next.js App Router) is the consumer's problem if any warning surfaces — we'll triage in playground smoke test.

---

## Acceptance criteria

- All 4 components pass `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` from the monorepo root.
- `publint` passes for `@idcert/ui`.
- Storybook builds; 4 new stories visible under `Form/*` categories.
- Playground form smoke page (extended or new) renders all 4 fields wired through RHF + zod, all interactions work end-to-end (DatePicker opens calendar, picks date, formats; DateRangePicker picks range; TimePicker accepts time; FileUpload drag-drop + size/type/count validation + previews + remove).
- Bundle analysis confirms `react-day-picker` and `date-fns` are external, not inlined into consumer bundles that import only TimePicker / FileUpload.
- Changeset added; `pnpm exec changeset status` shows `@idcert/ui` minor bump 0.4.0 → 0.5.0.
- Branch `feat/forms-advanced` clean, ~7–9 commits (deps + 4 components + final validation/changeset).
