# Plan 4a — Forms Base (Select, MultiSelect, Slider, Form/FormField)

**Status**: Design approved
**Date**: 2026-05-05
**Author**: Andrea Alunni Guiducci
**Target version**: `@idcert/ui` v0.4.0
**Branch**: `feat/forms-base` (off `main` after `feat/feedback` v0.3.0 is merged)
**Predecessor**: Plan 3 — Feedback (`feat/feedback`, v0.3.0)

---

## Overview

Plan 4a is the first half of the Form avanzati category from the master spec. It covers four components that together unlock real form workflows in idcert applications:

- **Select** — single-value dropdown built on Base UI `Select`, composition API.
- **MultiSelect** — multi-value combobox with chip-style trigger and search filter, built on Base UI `Combobox` (`mode="multiple"`).
- **Slider** — numeric range input with single- or dual-thumb support, built on Base UI `Slider`.
- **Form / FormField** — `react-hook-form` + `zod` integration following the shadcn/ui pattern: `<Form>` wrapper, `<FormField>` controller, and sub-parts `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`.

Plan 4b (separate plan, future) will cover DatePicker, DateRangePicker, TimePicker, and FileUpload.

This split avoids a single oversized branch, isolates heavy custom components (date/time/file) from headless-primitive wrappers, and lets Plan 4a ship as a self-contained `v0.4.0` release that already enables most idcert forms.

---

## Goals

- Provide composition-style Select and MultiSelect compounds consistent with Dialog/AlertDialog API style from Plan 3.
- Ship a Slider that supports both single value and range with the same component (Base UI primitive accepts an array `value`).
- Offer a tight `react-hook-form` + `zod` integration via the canonical shadcn pattern (5 sub-parts inside `FormField`), so consumer apps can copy-paste community examples with no adaptation.
- Keep `react-hook-form` and `zod` as peer dependencies (no runtime bundling) to avoid React-context duplication and version mismatches.
- Land all four components with full unit-test coverage (~34 tests) and Storybook stories.

## Non-goals (out of scope for Plan 4a)

- DatePicker / DateRangePicker (Plan 4b).
- TimePicker (Plan 4b).
- FileUpload (Plan 4b).
- Slider value label on thumb / marks / ticks (future, additive props).
- Async Combobox with loading state (future, additive prop on MultiSelect).
- `useFieldArray` wrapper helper (consumer uses RHF directly).
- i18n of zod error messages (consumer wires `errorMap`).
- Visual regression testing infrastructure (cross-cutting concern, separate plan).

---

## Architecture

### New dependencies

In `packages/ui/package.json`:

```json
{
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19",
    "react-hook-form": "^7",
    "zod": "^3"
  },
  "peerDependenciesMeta": {
    "react-hook-form": { "optional": false },
    "zod": { "optional": false }
  },
  "devDependencies": {
    "react-hook-form": "^7",
    "zod": "^3",
    "@hookform/resolvers": "^3"
  }
}
```

`@hookform/resolvers` is a devDependency only (used in tests and stories to wire `zodResolver`); consumer apps install it themselves alongside `react-hook-form` and `zod`.

No changes to `@idcert/tokens` or `@idcert/tailwind-config`. The `tailwindcss-animate` plugin already added in Plan 3 supplies the `animate-in` / `animate-out` / `fade-*` / `zoom-*` utilities used by the Combobox/Select dropdown panels.

### Base primitive mapping

| Component   | Base primitive                          | Custom logic |
|-------------|-----------------------------------------|--------------|
| Select      | `Base UI Select.*`                      | cva styles, chevron icon (lucide `ChevronDown`), check icon on selected item (lucide `Check`) |
| MultiSelect | `Base UI Combobox.*` (`mode="multiple"`) | Chip rendering (selected items as removable badges inside trigger), filter input wired to Combobox input, X-button per chip, backspace-removes-last-chip handler |
| Slider      | `Base UI Slider.*`                      | Track + Range + Thumb styling (cva). Range support via array-length detection on `value` |
| Form        | `react-hook-form` `FormProvider`        | Thin wrapper; consumer still owns the `<form>` element + `handleSubmit` |
| FormField   | RHF `Controller` + two React Contexts   | `FormFieldContext` (carries `name`); `FormItemContext` (carries `id`); `useFormField()` hook merges both with `getFieldState()` |

### Internal `Slot` helper

`FormControl` clones its single child and injects `id`, `aria-describedby`, and `aria-invalid`. We introduce a small internal `Slot` utility at `src/lib/slot.tsx` (~30 lines, implementation styled after the Radix Slot pattern using `React.cloneElement`). Not a new dependency. Not exported publicly.

The Slot helper is generic enough to be reused by future compound components.

---

## Component APIs

### 1. Select

```tsx
<Select value={v} onValueChange={setV} defaultValue disabled name>
  <SelectTrigger className aria-label>
    <SelectValue placeholder="Scegli…" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Europa</SelectLabel>
      <SelectItem value="it">Italia</SelectItem>
      <SelectItem value="fr">Francia</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectItem value="us">USA</SelectItem>
  </SelectContent>
</Select>
```

**Sub-parts** (all exported):

- `Select` — root, controlled or uncontrolled; wraps Base UI `Select.Root`.
- `SelectTrigger` — `Select.Trigger`; styled like `Input` (border, focus ring, h-10), chevron auto-rendered as trailing icon.
- `SelectValue` — `Select.Value`; renders selected label or placeholder.
- `SelectContent` — `Select.Positioner` + `Select.Popup` combined into one stylable surface; uses Base UI `data-state="open"` for `animate-in fade-in zoom-in-95`.
- `SelectItem` — `Select.Item`; check icon auto-rendered when `data-checked`.
- `SelectGroup` — `Select.Group`.
- `SelectLabel` — `Select.GroupLabel`; small caps style.
- `SelectSeparator` — internally re-uses the `Separator` primitive from Plan 2.

**Styling notes**: `SelectTrigger` matches `Input` height and focus ring exactly so it composes cleanly with `<FormControl>` and sibling `Input` fields. The dropdown panel is `bg-popover text-popover-foreground rounded-md border shadow-md`.

### 2. MultiSelect

`MultiSelect` is **data-driven**: the consumer supplies an `items` array (the filter source), and the rendered list is produced via a render-prop on `MultiSelectList`. This deviates from Select's pure composition API because Base UI `Combobox` requires an items array to perform built-in filtering. The trade-off is intentional and documented.

Item shape (TypeScript-generic):

```ts
type MultiSelectOption<TValue extends string = string> = {
  value: TValue;
  label: React.ReactNode;
  disabled?: boolean;
};
```

Usage:

```tsx
const items = [
  { value: "it", label: "Italia" },
  { value: "fr", label: "Francia" },
  { value: "es", label: "Spagna" },
];

<MultiSelect
  items={items}
  value={vals}
  onValueChange={setVals}
  defaultValue
  placeholder="Seleziona paesi…"
>
  <MultiSelectTrigger>
    <MultiSelectChips />            {/* chip area + inline filter input */}
  </MultiSelectTrigger>
  <MultiSelectContent>
    <MultiSelectEmpty>Nessun risultato</MultiSelectEmpty>
    <MultiSelectList>
      {(item) => (
        <MultiSelectItem value={item.value} disabled={item.disabled}>
          {item.label}
        </MultiSelectItem>
      )}
    </MultiSelectList>
  </MultiSelectContent>
</MultiSelect>
```

**Sub-parts** (all exported):

- `MultiSelect` — root, wraps Base UI `Combobox.Root` with `multiple` enabled. Required prop `items: MultiSelectOption[]` is the filter source.
- `MultiSelectTrigger` — interactive container styled like `SelectTrigger` but with `flex-wrap` to host chips.
- `MultiSelectChips` — renders one chip per selected value plus the inline filter input. Chip = `Badge`-like span with label + X button (`aria-label="Rimuovi"`). Click on X removes the value without closing the popup. Backspace inside the input when the input value is empty removes the last chip (standard combobox UX). Chip label is resolved by looking up the value in `items`.
- `MultiSelectContent` — `Combobox.Positioner` + `Combobox.Popup`. Same dropdown styling as `SelectContent`.
- `MultiSelectList` — wraps Base UI `Combobox.List`; its single child is a render-prop `(item: MultiSelectOption) => React.ReactNode` invoked once per filtered item.
- `MultiSelectItem` — `Combobox.Item`. Renders inside the `MultiSelectList` render-prop. Check icon shown when selected.
- `MultiSelectEmpty` — `Combobox.Empty`. Renders only when filter yields zero items.

**Filter behaviour**: Base UI Combobox handles filtering natively against the `items` array (matching against `label` when it is a string; consumer can provide a custom `filter` prop for non-string labels — pass-through to Base UI). The inline input value is bidirectionally bound to Combobox's filter state. After selecting an item the filter clears automatically.

**Overflow guard**: chip area uses `flex-wrap` plus `max-h-32 overflow-y-auto` so 20+ chips degrade gracefully. A future variant prop `chipsBelow` could move chips out of the trigger; not in scope for v1.

### 3. Slider

```tsx
<Slider
  value={[20]}                  // single thumb
  onValueChange={setV}
  min={0} max={100} step={1}
  disabled
  aria-label="Volume"
/>

<Slider
  value={[20, 80]}              // range, two thumbs
  onValueChange={setV}
  min={0} max={100}
/>
```

**API**: monolithic. Always accepts a `number[]` value. The number of thumbs equals the array length (Base UI handles this natively). No public sub-parts in v1; `Slider.Root`, `Slider.Track`, `Slider.Range`, `Slider.Thumb` are all wrapped internally.

**Styling**: Track is `h-2 rounded-full bg-secondary`; Range is `bg-primary`; Thumb is `h-5 w-5 rounded-full border-2 border-primary bg-background` with focus-visible ring. Disabled state lowers opacity and prevents pointer.

### 4. Form / FormField

```tsx
const schema = z.object({
  email: z.string().email("Email non valida"),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: "" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField control={form.control} name="email" render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" {...field} />
        </FormControl>
        <FormDescription>Mai condivisa.</FormDescription>
        <FormMessage />
      </FormItem>
    )} />

    <Button type="submit">Invia</Button>
  </form>
</Form>
```

**Sub-parts** (all exported):

- `Form` — wraps `FormProvider` from RHF. Consumer spreads `useForm()` return on it (`<Form {...form}>`).
- `FormField` — wraps RHF `Controller`. Provides `FormFieldContext` (`{ name }`) for descendants. Render-prop signature mirrors RHF Controller exactly.
- `FormItem` — generates a unique `id` via `useId()` and provides `FormItemContext`. Renders `<div className="space-y-2">`. Override via `className` prop.
- `FormLabel` — wraps the existing `Label` primitive from Plan 1. Reads `id` from context to set `htmlFor` automatically. If RHF reports an error, applies `text-destructive` styling.
- `FormControl` — uses internal `Slot` helper to clone its child element and inject:
  - `id` (from `FormItemContext`)
  - `aria-describedby` (description id and/or message id, when present)
  - `aria-invalid` (from RHF field state)
- `FormDescription` — renders `<p>` with id `${id}-description`. Muted text style.
- `FormMessage` — renders the RHF error message if present, otherwise renders `null`. Optional `children` can override the default message text.

**Internal hook**: `useFormField()` reads both contexts and calls `getFieldState(name, formState)` from RHF. Returns `{ id, name, formItemId, formDescriptionId, formMessageId, error, invalid, isDirty, isTouched }`. Throws if used outside `<FormField>` (matches shadcn behaviour).

**Compatibility**: `FormControl` works with any `forwardRef` input. All existing primitives (`Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `MultiSelect`, `Slider`) already use `forwardRef`, so they slot in without changes.

---

## File structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── select/
│   │   │   ├── index.tsx
│   │   │   ├── select.test.tsx
│   │   │   └── select.stories.tsx
│   │   ├── multi-select/
│   │   │   ├── index.tsx
│   │   │   ├── multi-select.test.tsx
│   │   │   └── multi-select.stories.tsx
│   │   ├── slider/
│   │   │   ├── index.tsx
│   │   │   ├── slider.test.tsx
│   │   │   └── slider.stories.tsx
│   │   └── form/
│   │       ├── index.tsx              # Form + FormField + 5 sub-parts + useFormField
│   │       ├── form.test.tsx
│   │       └── form.stories.tsx
│   ├── lib/
│   │   └── slot.tsx                    # internal Slot helper, NOT exported from package barrel
│   └── index.ts                        # barrel: 4 new exports
└── package.json                        # +peerDeps + +devDeps
```

The barrel `packages/ui/src/index.ts` adds:

```ts
export * from "./components/select";
export * from "./components/multi-select";
export * from "./components/slider";
export * from "./components/form";
```

Storybook (`apps/storybook`) auto-indexes the four new `*.stories.tsx` files via the existing glob pattern. No config change.

The playground app (`apps/playground`) gets a new page `app/forms/page.tsx` that renders an end-to-end login form: email + password (`Input`), remember-me (`Switch`), country (`Select`), languages (`MultiSelect`), volume (`Slider`), all wrapped in `FormField` with a zod schema and submit handler. Used as the manual smoke test target.

---

## Test scope

Stack is unchanged: `vitest` + `@testing-library/react` + `@testing-library/user-event`. Same `vitest.config.ts` and `setup.ts` as Plans 1–3.

| Component   | Test count | Coverage |
|-------------|-----------:|----------|
| Select      | 8          | render trigger + value, open on click, item click updates value, controlled mode, disabled disables trigger, placeholder shown when empty, ref forwarding on trigger, group + separator render |
| MultiSelect | 10         | render, open on click, select multiple values, chip remove via X, backspace removes last chip, filter input narrows items, empty state visible, controlled mode, disabled, ref forwarding |
| Slider      | 6          | render single thumb, render range (two thumbs), keyboard arrow updates value, controlled mode, disabled, ref forwarding |
| Form        | 2          | renders FormProvider context, handleSubmit fires on submit |
| FormField   | 8          | renders FormItem, FormLabel auto htmlFor, FormControl propagates aria-describedby + aria-invalid, FormMessage shows zod error after submit, FormDescription rendered, useFormField throws outside context, controlled value via field, default value applied |

**Plan 4a total**: ~34 tests.

After Plan 4a, the cumulative test count target across all plans is approximately **152** (Plans 1+2 = 70, Plan 3 = 39, Plan 4a = 34, plus existing dialog and combobox-related delta). The plan file will reconcile the exact total at the validation step; the changeset note records the actual number.

Coverage target: 100% of public API surface. Visual regression is not in scope.

---

## Versioning + release

Single changeset `.changeset/v0.4.0-forms-base.md`:

```markdown
---
'@idcert/ui': minor
---

Add 4 new components in the Form avanzati category (first half of the form layer).

Components:
- `Select` compound — single-value dropdown built on Base UI Select. Sub-parts: `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`.
- `MultiSelect` compound — multi-value combobox with chip trigger and search filter, built on Base UI Combobox (`multiple`). Data-driven: consumer supplies `items` array; rendered list via `MultiSelectList` render-prop. Sub-parts: `MultiSelectTrigger`, `MultiSelectChips`, `MultiSelectContent`, `MultiSelectList`, `MultiSelectItem`, `MultiSelectEmpty`. Type: `MultiSelectOption`.
- `Slider` — numeric input with single or range support (array `value`), built on Base UI Slider.
- `Form` + `FormField` compound — react-hook-form + zod integration following the shadcn pattern. Sub-parts: `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`. Hook: `useFormField()`.

New peer dependencies (consumer must install):
- `react-hook-form` ^7
- `zod` ^3

Out of scope (deferred to Plan 4b):
- DatePicker, DateRangePicker, TimePicker, FileUpload.
```

`@idcert/tailwind-config` and `@idcert/tokens` do not bump.

The peer dependency addition is documented in the changeset note and in the package README; consumers must add `react-hook-form` and `zod` to their own `package.json` to use `Form` and `FormField`. Consumers who only use Select / MultiSelect / Slider do not need `react-hook-form` or `zod` installed (those imports are only pulled by the `form` module, which is tree-shakeable).

---

## Risks and mitigations

- **Slot pattern complexity**: cloning children to inject ARIA attributes can fail if the child is a fragment or text node. Mitigation: Slot throws a clear development-mode error when given a non-element child, matching Radix Slot behaviour.
- **Combobox + chip overflow**: large multi-selections could blow up the trigger height. Mitigation: `flex-wrap` + `max-h-32 overflow-y-auto`. Documented in Storybook story with a 30-item example.
- **RHF version drift**: peer dep `^7` accepts the entire 7.x line. Mitigation: changeset notes the tested minor; CI runs against the lockfile-pinned version. Future consumer issues with 7.x patch bumps surface as bug reports.
- **Tree-shaking the form module**: consumers who don't use `Form`/`FormField` should not pay the bundle cost of `react-hook-form`. Mitigation: peer deps + per-component subpath exports keep RHF imports out of any consumer bundle that doesn't use the form module. Verify with `tsup` analyse step.
- **Backwards compat of existing primitives with FormControl**: all primitives already `forwardRef`, but `Slot` requires the child to accept arbitrary props. Mitigation: integration tests in `form.test.tsx` cover Input, Textarea, Checkbox, Switch, Select, MultiSelect, Slider as `FormControl` children.

---

## Acceptance criteria

- All 4 new components pass `pnpm test`, `pnpm lint`, `pnpm typecheck` from the monorepo root.
- `publint` passes for `@idcert/ui`.
- Storybook builds; 4 new component stories visible.
- Playground app `apps/playground/app/forms/page.tsx` renders the smoke test form, all interactions work (Select opens, MultiSelect chips add/remove, Slider drags, Form submits with zod validation showing inline errors).
- Bundle analysis confirms `react-hook-form` is not pulled into consumer bundles that import only Select/MultiSelect/Slider.
- Changeset added; `pnpm exec changeset status` shows `@idcert/ui` minor bump 0.3.0 → 0.4.0.
- Branch `feat/forms-base` clean, ~10–12 commits (deps + 4 components + Slot helper + playground page + changeset).
