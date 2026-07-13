# Admin UI Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `packages/ui` primitives and composites the admin app's forms need
(Select, Combobox, DatePicker, Dialog, Table, Tabs, Toast, NumberInput, Checkbox, Switch,
Tooltip, plus `LocaleField`, `RichTextEditor`, `ImageUploader`) so later plans (content parity,
clients, invoices) can build forms purely by importing from `@mfranceschit/ui`.

**Architecture:** Every primitive wraps an `@ark-ui/react` component namespace (already the
established pattern — see `Avatar.tsx`, `Input.tsx`, `FormField.tsx`) with Tailwind classes
built from the token system in `packages/ui/src/styles/tokens.css`. Named function-declaration
components, `variantClasses`/`sizeClasses` `Record` maps where relevant, one Storybook story
file per component. The three composites (`LocaleField`, `RichTextEditor`, `ImageUploader`)
compose the primitives plus `@portabletext/editor` (RichTextEditor) and Ark UI's `FileUpload`/
`ImageCropper` (ImageUploader) — `ImageUploader` does NOT call Sanity directly; it accepts an
`onUpload` callback prop so `apps/admin` can wire it to the `uploadImageAssetFn` server function
from the previous plan.

**Tech Stack:** `@ark-ui/react` ^5.37.2 (already installed), Tailwind (via `@tailwindcss/vite`,
already installed), `@portabletext/editor` (new dependency, pin exact version at execution
time), React 19.

## Global Constraints

- All colors/UI components live in `packages/ui`; apps import only, never hand-roll markup or
  raw styles (root `CLAUDE.md` HARD RULE). A new color is a token first — add to
  `styles/tokens.css` before using it anywhere; never a raw hex/rgba in a component.
- Component recipe (`packages/ui/CLAUDE.md`): `src/components/[Name]/[Name].tsx` +
  `[Name].stories.tsx` + `index.ts`; named function declaration (`export function X(...)`, not
  an arrow const); Ark UI for any interactive primitive; export component AND its prop/variant
  types from `components/index.ts`; Storybook story covering meaningful variants/states.
- Styling pattern (see `Button.tsx`): `variantClasses`/`sizeClasses` as `Record<Variant, string>`
  of Tailwind class strings; `base` string of shared classes; compose via
  `[base, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ')`;
  reference tokens as Tailwind arbitrary values (`bg-[var(--surface-field)]`); accept
  `className` for overrides; comment only non-obvious WHY.
- Languages: `en` (default), `es`, `pt` (relevant to `LocaleField`).
- Biome formatting (single quotes, trailing commas `all`, 2-space indent, 100 col) — do not run
  `pnpm check`/`pnpm format`, just write clean code.
- Do not run `pnpm dev`, `pnpm build`, `pnpm storybook`, or start any server/watch process at
  any point in this plan. `pnpm --filter @mfranceschit/ui typecheck` is the only allowed
  verification command — `packages/ui` has no vitest setup and no existing component has unit
  tests (verified via `find packages/ui/src/components -iname "*.test.*"` returning nothing);
  this plan follows that established convention. Do not add a test runner.
- Never commit unless explicitly instructed — the plan explicitly instructs a commit at the end
  of each task.
- `apps/admin` (from the previous plan) is NOT touched by this plan — this plan is scoped to
  `packages/ui` only. A later plan wires these components into `apps/admin` forms.

---

## File Structure

```
packages/ui/src/
  styles/tokens.css                (add --surface-overlay, --surface-scrim tokens)
  components/
    Checkbox/Checkbox.tsx, .stories.tsx, index.ts
    Switch/Switch.tsx, .stories.tsx, index.ts
    Tooltip/Tooltip.tsx, .stories.tsx, index.ts
    NumberInput/NumberInput.tsx, .stories.tsx, index.ts
    Select/Select.tsx, .stories.tsx, index.ts
    Combobox/Combobox.tsx, .stories.tsx, index.ts
    Tabs/Tabs.tsx, .stories.tsx, index.ts
    Dialog/Dialog.tsx, .stories.tsx, index.ts
    Toast/Toast.tsx, .stories.tsx, index.ts
    DatePicker/DatePicker.tsx, .stories.tsx, index.ts
    Table/Table.tsx, .stories.tsx, index.ts
    LocaleField/LocaleField.tsx, .stories.tsx, index.ts
    RichTextEditor/RichTextEditor.tsx, .stories.tsx, index.ts
    ImageUploader/ImageUploader.tsx, .stories.tsx, index.ts
    index.ts                        (barrel — add all 13 new exports)
```

---

### Task 1: Tokens — add overlay/scrim surfaces

**Files:**
- Modify: `packages/ui/src/styles/tokens.css`

**Interfaces:**
- Produces: `--surface-overlay` (popover/menu/dropdown background) and `--surface-scrim`
  (dialog backdrop) CSS variables, in both the `:root` light block and the
  `:root[data-theme="dark"]` (or equivalent selector already used for dark values — check the
  file for the exact selector around line 189, e.g. it may be `:root[data-theme='dark']` or a
  `@media` block) dark block. Consumed by Tasks 2 (Select), 3 (Combobox), 6 (Dialog), 4
  (Tooltip).

- [ ] **Step 1: Read the file to find the light/dark block boundaries**

Read `packages/ui/src/styles/tokens.css` in full first — confirm the exact selector used for
the dark variant block (the earlier grep showed dark `--surface-card`/`--surface-sunken`
overrides starting around line 189; find the selector those lines are nested under).

- [ ] **Step 2: Add `--surface-overlay` next to `--surface-card` in the light block**

In the `:root { ... }` block, in the "Surfaces" section (near `--surface-card: var(--mf-white);`
at line 65), add:

```css
--surface-overlay: var(--mf-white);
```

- [ ] **Step 3: Add `--surface-scrim` in the light block**

Immediately after `--surface-overlay`, add:

```css
--surface-scrim: rgba(14, 23, 51, 0.45);
```

(Matches the blue-900-ish tone already used for the dark `--surface-card` override at line 189,
`rgba(14, 23, 51, 0.55)` — keep the same RGB, lower alpha since this is a full-page scrim, not a
translucent panel.)

- [ ] **Step 4: Add the dark-mode overrides**

In whatever selector block contains the dark `--surface-card`/`--surface-sunken` overrides
(around line 189/193), add:

```css
--surface-overlay: var(--mf-blue-900);
--surface-scrim: rgba(0, 0, 0, 0.6);
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors (CSS changes don't affect `tsc`, this just confirms the package still
typechecks after the edit — run it as a baseline before Task 2 starts touching `.tsx` files).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/styles/tokens.css
git commit -m "feat(ui): add surface-overlay and surface-scrim tokens"
```

---

### Task 2: `Checkbox`

**Files:**
- Create: `packages/ui/src/components/Checkbox/Checkbox.tsx`
- Create: `packages/ui/src/components/Checkbox/Checkbox.stories.tsx`
- Create: `packages/ui/src/components/Checkbox/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Checkbox` component, `CheckboxProps` type (`checked`, `defaultChecked`,
  `onCheckedChange`, `disabled`, `label`, `className`). Consumed by later plans' boolean form
  fields (e.g. invoice `status` toggles are handled by `Switch`, not `Checkbox` — `Checkbox` is
  for plain boolean fields, e.g. a future "show tagline" or "featured" flag).

- [ ] **Step 1: Write `packages/ui/src/components/Checkbox/Checkbox.tsx`**

```tsx
import { Checkbox as ArkCheckbox } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
};

const controlBase =
  'flex items-center justify-center w-[18px] h-[18px] shrink-0 rounded-[4px] ' +
  'border border-[var(--border-default)] bg-[var(--surface-field)] ' +
  'transition-[background-color,border-color] duration-[120ms] ' +
  'data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] ' +
  'peer-focus-visible:shadow-focus';

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  className = '',
}: CheckboxProps) {
  return (
    <ArkCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(details) => onCheckedChange?.(details.checked === true)}
      disabled={disabled}
      className={['inline-flex items-center gap-2 cursor-pointer', className]
        .filter(Boolean)
        .join(' ')}
    >
      <ArkCheckbox.Control className={controlBase}>
        <ArkCheckbox.Indicator>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 6.5L4.75 8.75L9.5 3.5"
              stroke="var(--text-inverse)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      {label && (
        <ArkCheckbox.Label className="font-sans text-sm text-[var(--text-body)]">
          {label}
        </ArkCheckbox.Label>
      )}
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Checkbox/Checkbox.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'Featured',
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
  args: { defaultChecked: false },
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { defaultChecked: false, disabled: true },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Checkbox/index.ts`**

```typescript
export type { CheckboxProps } from './Checkbox';
export { Checkbox } from './Checkbox';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically (after `Card`, before `FormField` — check existing alphabetical order in
the file and match it):

```typescript
export type { CheckboxProps } from './Checkbox/Checkbox';
export { Checkbox } from './Checkbox/Checkbox';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `ArkCheckbox.Root`'s `onCheckedChange` callback's `details` parameter
shape differs from `{ checked: boolean | 'indeterminate' }` in the installed `@ark-ui/react`
version, check `node_modules/@ark-ui/react/dist/components/checkbox/checkbox-root.d.ts` for the
real `CheckedChangeDetails` type and adjust.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Checkbox packages/ui/src/components/index.ts
git commit -m "feat(ui): add Checkbox component"
```

---

### Task 3: `Switch`

**Files:**
- Create: `packages/ui/src/components/Switch/Switch.tsx`
- Create: `packages/ui/src/components/Switch/Switch.stories.tsx`
- Create: `packages/ui/src/components/Switch/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Switch` component, `SwitchProps` type (`checked`, `defaultChecked`,
  `onCheckedChange`, `disabled`, `label`, `className`). Consumed by later plans for on/off
  toggles distinct from `Checkbox` (e.g. content parity's draft/publish views may use a `Switch`
  for a "show unpublished" list filter).

- [ ] **Step 1: Write `packages/ui/src/components/Switch/Switch.tsx`**

```tsx
import { Switch as ArkSwitch } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
};

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  className = '',
}: SwitchProps) {
  return (
    <ArkSwitch.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(details) => onCheckedChange?.(details.checked)}
      disabled={disabled}
      className={['inline-flex items-center gap-2 cursor-pointer', className]
        .filter(Boolean)
        .join(' ')}
    >
      <ArkSwitch.Control
        className={
          'relative inline-flex w-[36px] h-[20px] rounded-[var(--radius-pill)] ' +
          'bg-[var(--mf-gray-300)] transition-colors duration-[120ms] ' +
          'data-[state=checked]:bg-[var(--primary)]'
        }
      >
        <ArkSwitch.Thumb
          className={
            'block w-[16px] h-[16px] my-0.5 ml-0.5 rounded-full bg-[var(--mf-white)] ' +
            'shadow-sm transition-transform duration-[120ms] ' +
            'data-[state=checked]:translate-x-[16px]'
          }
        />
      </ArkSwitch.Control>
      {label && (
        <ArkSwitch.Label className="font-sans text-sm text-[var(--text-body)]">
          {label}
        </ArkSwitch.Label>
      )}
      <ArkSwitch.HiddenInput />
    </ArkSwitch.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Switch/Switch.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Show unpublished',
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Off: Story = {
  args: { defaultChecked: false },
};

export const On: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { defaultChecked: false, disabled: true },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Switch/index.ts`**

```typescript
export type { SwitchProps } from './Switch';
export { Switch } from './Switch';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { SwitchProps } from './Switch/Switch';
export { Switch } from './Switch/Switch';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `ArkSwitch.Root`'s `onCheckedChange` details shape differs, check
`node_modules/@ark-ui/react/dist/components/switch/switch-root.d.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Switch packages/ui/src/components/index.ts
git commit -m "feat(ui): add Switch component"
```

---

### Task 4: `Tooltip`

**Files:**
- Create: `packages/ui/src/components/Tooltip/Tooltip.tsx`
- Create: `packages/ui/src/components/Tooltip/Tooltip.stories.tsx`
- Create: `packages/ui/src/components/Tooltip/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Tooltip` component, `TooltipProps` type (`content`, `children`, `openDelay`,
  `className`). `children` must be a single focusable/hoverable element (button, icon button,
  etc.) — `Tooltip` wraps it as the trigger.
- Consumes: `--surface-overlay` token from Task 1.

- [ ] **Step 1: Write `packages/ui/src/components/Tooltip/Tooltip.tsx`**

```tsx
import { Tooltip as ArkTooltip, Portal } from '@ark-ui/react';
import type { ReactElement, ReactNode } from 'react';

export type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
  openDelay?: number;
  className?: string;
};

export function Tooltip({ content, children, openDelay = 300, className = '' }: TooltipProps) {
  return (
    <ArkTooltip.Root openDelay={openDelay}>
      <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
      <Portal>
        <ArkTooltip.Positioner>
          <ArkTooltip.Content
            className={[
              'rounded-[var(--radius-sm)] bg-[var(--surface-overlay)] px-2.5 py-1.5 ' +
                'font-sans text-xs text-[var(--text-body)] shadow-md ' +
                'border border-[var(--border-subtle)]',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {content}
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Tooltip/Tooltip.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Tooltip } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Publish this document',
    children: <Button>Publish</Button>,
  },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Tooltip/index.ts`**

```typescript
export type { TooltipProps } from './Tooltip';
export { Tooltip } from './Tooltip';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically (near the end, after `MobileNav`):

```typescript
export type { TooltipProps } from './Tooltip/Tooltip';
export { Tooltip } from './Tooltip/Tooltip';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `ArkTooltip.Trigger`'s `asChild` prop doesn't exist in the installed
version (Ark UI has changed its "render as child" API across versions — some versions use
`asChild`, some a render-prop `children` function), check
`node_modules/@ark-ui/react/dist/components/tooltip/tooltip-trigger.d.ts` and adjust to the
real API.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Tooltip packages/ui/src/components/index.ts
git commit -m "feat(ui): add Tooltip component"
```

---

### Task 5: `NumberInput`

**Files:**
- Create: `packages/ui/src/components/NumberInput/NumberInput.tsx`
- Create: `packages/ui/src/components/NumberInput/NumberInput.stories.tsx`
- Create: `packages/ui/src/components/NumberInput/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `NumberInput` component, `NumberInputProps` type (`value`, `defaultValue`,
  `onValueChange: (value: number) => void`, `min`, `max`, `step`, `disabled`, `className`).
  Consumed by the invoice plan's `quantity`/`unitPrice`/`taxRate` fields.

- [ ] **Step 1: Write `packages/ui/src/components/NumberInput/NumberInput.tsx`**

```tsx
import { NumberInput as ArkNumberInput } from '@ark-ui/react';

export type NumberInputProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

const inputClasses =
  'w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm text-[var(--text-field)] ' +
  'bg-[var(--surface-field)] border border-[var(--border-default)] rounded-md outline-none ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const triggerClasses =
  'flex items-center justify-center w-6 text-[var(--text-muted)] ' +
  'hover:text-[var(--text-body)] disabled:opacity-40 disabled:cursor-not-allowed';

export function NumberInput({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step,
  disabled = false,
  className = '',
}: NumberInputProps) {
  return (
    <ArkNumberInput.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onValueChange?.(details.valueAsNumber)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={['relative w-full', className].filter(Boolean).join(' ')}
    >
      <ArkNumberInput.Control className="relative flex items-center">
        <ArkNumberInput.Input className={inputClasses} />
        <div className="absolute right-1 flex flex-col">
          <ArkNumberInput.IncrementTrigger className={triggerClasses}>
            +
          </ArkNumberInput.IncrementTrigger>
          <ArkNumberInput.DecrementTrigger className={triggerClasses}>
            −
          </ArkNumberInput.DecrementTrigger>
        </div>
      </ArkNumberInput.Control>
    </ArkNumberInput.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/NumberInput/NumberInput.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: { defaultValue: '1', min: 0, step: 1 },
};

export const Currency: Story = {
  args: { defaultValue: '100.00', min: 0, step: 0.01 },
};

export const Disabled: Story = {
  args: { defaultValue: '1', disabled: true },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/NumberInput/index.ts`**

```typescript
export type { NumberInputProps } from './NumberInput';
export { NumberInput } from './NumberInput';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { NumberInputProps } from './NumberInput/NumberInput';
export { NumberInput } from './NumberInput/NumberInput';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `onValueChange`'s details shape isn't `{ value: string, valueAsNumber:
number }`, check `node_modules/@ark-ui/react/dist/components/number-input/number-input-root.d.ts`
and adjust.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/NumberInput packages/ui/src/components/index.ts
git commit -m "feat(ui): add NumberInput component"
```

---

### Task 6: `Select`

**Files:**
- Create: `packages/ui/src/components/Select/Select.tsx`
- Create: `packages/ui/src/components/Select/Select.stories.tsx`
- Create: `packages/ui/src/components/Select/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Select` component, `SelectProps<T>` type (`items: T[]`, `itemToString: (item: T) =>
  string`, `itemToValue: (item: T) => string`, `value?: string[]`, `defaultValue?: string[]`,
  `onValueChange?: (value: string[]) => void`, `placeholder?: string`, `disabled?: boolean`,
  `className?: string`). Single-select (invoice `status`, client `currency`) built on Ark UI's
  multi-capable primitive but constrained to one value via the consuming form.
- Consumes: `--surface-overlay` token from Task 1.

- [ ] **Step 1: Write `packages/ui/src/components/Select/Select.tsx`**

```tsx
import { Select as ArkSelect, createListCollection, Portal } from '@ark-ui/react';

export type SelectProps<T> = {
  items: T[];
  itemToString: (item: T) => string;
  itemToValue: (item: T) => string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const triggerClasses =
  'flex w-full items-center justify-between px-[var(--field-pad-x)] py-[var(--field-pad-y)] ' +
  'font-sans text-sm text-[var(--text-field)] bg-[var(--surface-field)] ' +
  'border border-[var(--border-default)] rounded-md outline-none cursor-pointer ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus-visible:border-[var(--focus-ring)] focus-visible:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const contentClasses =
  'z-50 min-w-[var(--reference-width)] rounded-md bg-[var(--surface-overlay)] ' +
  'border border-[var(--border-subtle)] shadow-md py-1 max-h-[280px] overflow-auto';

const itemClasses =
  'px-3 py-2 font-sans text-sm text-[var(--text-body)] cursor-pointer rounded-sm mx-1 ' +
  'data-[highlighted]:bg-[var(--primary-soft)]';

export function Select<T>({
  items,
  itemToString,
  itemToValue,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled = false,
  className = '',
}: SelectProps<T>) {
  const collection = createListCollection({ items, itemToString, itemToValue });

  return (
    <ArkSelect.Root
      collection={collection}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onValueChange?.(details.value)}
      disabled={disabled}
      className={className}
    >
      <ArkSelect.Control>
        <ArkSelect.Trigger className={triggerClasses}>
          <ArkSelect.ValueText placeholder={placeholder} />
          <ArkSelect.Indicator>▾</ArkSelect.Indicator>
        </ArkSelect.Trigger>
      </ArkSelect.Control>
      <Portal>
        <ArkSelect.Positioner>
          <ArkSelect.Content className={contentClasses}>
            {items.map((item) => (
              <ArkSelect.Item key={itemToValue(item)} item={item} className={itemClasses}>
                <ArkSelect.ItemText>{itemToString(item)}</ArkSelect.ItemText>
              </ArkSelect.Item>
            ))}
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Select/Select.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const CURRENCIES = ['USD', 'EUR', 'GBP'];

const meta: Meta<typeof Select<string>> = {
  title: 'Components/Select',
  component: Select<string>,
  args: {
    items: CURRENCIES,
    itemToString: (item: string) => item,
    itemToValue: (item: string) => item,
    placeholder: 'Select currency',
  },
};

export default meta;
type Story = StoryObj<typeof Select<string>>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: ['USD'] },
};

export const Disabled: Story = {
  args: { disabled: true },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Select/index.ts`**

```typescript
export type { SelectProps } from './Select';
export { Select } from './Select';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { SelectProps } from './Select/Select';
export { Select } from './Select/Select';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. Generic component typing with Storybook's `Meta<typeof Select<string>>`
can be finicky — if it doesn't typecheck cleanly, check how other generic-component stories are
typed in this Ark UI/Storybook version (there are none yet in this repo to copy from, so this is
new ground; if `Meta<typeof Select<string>>` doesn't work, fall back to explicitly typing
`meta: Meta<typeof Select>` and casting args, whichever the installed Storybook version accepts
cleanly). If the `ArkSelect` component's props (e.g. `ValueText`, `HiddenSelect`) differ from
what's shown, check `node_modules/@ark-ui/react/dist/components/select/*.d.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Select packages/ui/src/components/index.ts
git commit -m "feat(ui): add Select component"
```

---

### Task 7: `Combobox`

**Files:**
- Create: `packages/ui/src/components/Combobox/Combobox.tsx`
- Create: `packages/ui/src/components/Combobox/Combobox.stories.tsx`
- Create: `packages/ui/src/components/Combobox/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Combobox` component, `ComboboxProps<T>` type (`items: T[]`, `itemToString`,
  `itemToValue`, `value?: string[]`, `defaultValue?: string[]`, `onValueChange?`, `onInputValueChange?:
  (value: string) => void`, `placeholder?`, `disabled?`, `className?`). Used for the client
  picker on invoices and the technologies field on projects (free-text-filterable list).
- Consumes: `--surface-overlay` token from Task 1.

- [ ] **Step 1: Write `packages/ui/src/components/Combobox/Combobox.tsx`**

```tsx
import { Combobox as ArkCombobox, createListCollection, Portal } from '@ark-ui/react';

export type ComboboxProps<T> = {
  items: T[];
  itemToString: (item: T) => string;
  itemToValue: (item: T) => string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  onInputValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const inputClasses =
  'w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm text-[var(--text-field)] ' +
  'bg-[var(--surface-field)] border border-[var(--border-default)] rounded-md outline-none ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const contentClasses =
  'z-50 min-w-[var(--reference-width)] rounded-md bg-[var(--surface-overlay)] ' +
  'border border-[var(--border-subtle)] shadow-md py-1 max-h-[280px] overflow-auto';

const itemClasses =
  'px-3 py-2 font-sans text-sm text-[var(--text-body)] cursor-pointer rounded-sm mx-1 ' +
  'data-[highlighted]:bg-[var(--primary-soft)]';

export function Combobox<T>({
  items,
  itemToString,
  itemToValue,
  value,
  defaultValue,
  onValueChange,
  onInputValueChange,
  placeholder,
  disabled = false,
  className = '',
}: ComboboxProps<T>) {
  const collection = createListCollection({ items, itemToString, itemToValue });

  return (
    <ArkCombobox.Root
      collection={collection}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onValueChange?.(details.value)}
      onInputValueChange={(details) => onInputValueChange?.(details.inputValue)}
      disabled={disabled}
      className={className}
    >
      <ArkCombobox.Control>
        <ArkCombobox.Input className={inputClasses} placeholder={placeholder} />
      </ArkCombobox.Control>
      <Portal>
        <ArkCombobox.Positioner>
          <ArkCombobox.Content className={contentClasses}>
            <ArkCombobox.Empty className="px-3 py-2 font-sans text-sm text-[var(--text-muted)]">
              No results
            </ArkCombobox.Empty>
            {items.map((item) => (
              <ArkCombobox.Item key={itemToValue(item)} item={item} className={itemClasses}>
                <ArkCombobox.ItemText>{itemToString(item)}</ArkCombobox.ItemText>
              </ArkCombobox.Item>
            ))}
          </ArkCombobox.Content>
        </ArkCombobox.Positioner>
      </Portal>
    </ArkCombobox.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Combobox/Combobox.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox';

const TECHNOLOGIES = ['TypeScript', 'React', 'Astro', 'Svelte', 'Tailwind'];

const meta: Meta<typeof Combobox<string>> = {
  title: 'Components/Combobox',
  component: Combobox<string>,
  args: {
    items: TECHNOLOGIES,
    itemToString: (item: string) => item,
    itemToValue: (item: string) => item,
    placeholder: 'Search technologies',
  },
};

export default meta;
type Story = StoryObj<typeof Combobox<string>>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Combobox/index.ts`**

```typescript
export type { ComboboxProps } from './Combobox';
export { Combobox } from './Combobox';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { ComboboxProps } from './Combobox/Combobox';
export { Combobox } from './Combobox/Combobox';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. Same generic-component-story caveat as Task 6 applies here. If
`ArkCombobox`'s props differ, check `node_modules/@ark-ui/react/dist/components/combobox/*.d.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Combobox packages/ui/src/components/index.ts
git commit -m "feat(ui): add Combobox component"
```

---

### Task 8: `Tabs`

**Files:**
- Create: `packages/ui/src/components/Tabs/Tabs.tsx`
- Create: `packages/ui/src/components/Tabs/Tabs.stories.tsx`
- Create: `packages/ui/src/components/Tabs/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Tabs` component, `TabsProps` type (`items: TabItem[]`, `value?`, `defaultValue?`,
  `onValueChange?: (value: string) => void`, `className?`) and `TabItem` type (`{ value: string,
  label: string, content: ReactNode }`). Used by `LocaleField` (Task 12) for the en/es/pt
  tabbed switcher.

- [ ] **Step 1: Write `packages/ui/src/components/Tabs/Tabs.tsx`**

```tsx
import { Tabs as ArkTabs } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

const triggerClasses =
  'px-3 py-2 font-sans text-sm font-medium text-[var(--text-muted)] cursor-pointer ' +
  'border-b-2 border-transparent transition-colors duration-[120ms] ' +
  'data-[selected]:text-[var(--text-strong)] data-[selected]:border-[var(--primary)] ' +
  'hover:text-[var(--text-body)]';

export function Tabs({ items, value, defaultValue, onValueChange, className = '' }: TabsProps) {
  return (
    <ArkTabs.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(details) => onValueChange?.(details.value)}
      className={className}
    >
      <ArkTabs.List className="flex gap-1 border-b border-[var(--border-subtle)]">
        {items.map((item) => (
          <ArkTabs.Trigger key={item.value} value={item.value} className={triggerClasses}>
            {item.label}
          </ArkTabs.Trigger>
        ))}
      </ArkTabs.List>
      {items.map((item) => (
        <ArkTabs.Content key={item.value} value={item.value} className="pt-3">
          {item.content}
        </ArkTabs.Content>
      ))}
    </ArkTabs.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Tabs/Tabs.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {
    items: [
      { value: 'en', label: 'English', content: 'English content' },
      { value: 'es', label: 'Español', content: 'Contenido en español' },
      { value: 'pt', label: 'Português', content: 'Conteúdo em português' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};
```

- [ ] **Step 3: Write `packages/ui/src/components/Tabs/index.ts`**

```typescript
export type { TabItem, TabsProps } from './Tabs';
export { Tabs } from './Tabs';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { TabItem, TabsProps } from './Tabs/Tabs';
export { Tabs } from './Tabs/Tabs';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `ArkTabs.Root`'s `onValueChange` details shape differs, check
`node_modules/@ark-ui/react/dist/components/tabs/tabs-root.d.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Tabs packages/ui/src/components/index.ts
git commit -m "feat(ui): add Tabs component"
```

---

### Task 9: `Dialog`

**Files:**
- Create: `packages/ui/src/components/Dialog/Dialog.tsx`
- Create: `packages/ui/src/components/Dialog/Dialog.stories.tsx`
- Create: `packages/ui/src/components/Dialog/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Dialog` component, `DialogProps` type (`open?`, `defaultOpen?`, `onOpenChange?:
  (open: boolean) => void`, `trigger?: ReactNode`, `title: string`, `description?: string`,
  `children: ReactNode`, `className?`). Used for confirmation modals (discard draft) and the
  invoice line-item editor.
- Consumes: `--surface-overlay`, `--surface-scrim` tokens from Task 1.

- [ ] **Step 1: Write `packages/ui/src/components/Dialog/Dialog.tsx`**

```tsx
import { Dialog as ArkDialog, Portal } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className = '',
}: DialogProps) {
  return (
    <ArkDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(details) => onOpenChange?.(details.open)}
    >
      {trigger && <ArkDialog.Trigger asChild>{trigger}</ArkDialog.Trigger>}
      <Portal>
        <ArkDialog.Backdrop className="fixed inset-0 z-40 bg-[var(--surface-scrim)]" />
        <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ArkDialog.Content
            className={[
              'w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--surface-overlay)] ' +
                'border border-[var(--border-subtle)] shadow-lg p-6',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <ArkDialog.Title className="font-sans text-lg font-semibold text-[var(--text-strong)]">
              {title}
            </ArkDialog.Title>
            {description && (
              <ArkDialog.Description className="mt-1 font-sans text-sm text-[var(--text-muted)]">
                {description}
              </ArkDialog.Description>
            )}
            <div className="mt-4">{children}</div>
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Dialog/Dialog.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    title: 'Discard draft?',
    description: 'This will permanently delete your unpublished changes.',
    trigger: <Button variant="outline">Discard</Button>,
    children: <Button variant="accent">Confirm discard</Button>,
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Dialog/index.ts`**

```typescript
export type { DialogProps } from './Dialog';
export { Dialog } from './Dialog';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { DialogProps } from './Dialog/Dialog';
export { Dialog } from './Dialog/Dialog';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `ArkDialog.Trigger`'s `asChild` prop or `onOpenChange`'s details shape
differ, check `node_modules/@ark-ui/react/dist/components/dialog/*.d.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Dialog packages/ui/src/components/index.ts
git commit -m "feat(ui): add Dialog component"
```

---

### Task 10: `Toast`

**Files:**
- Create: `packages/ui/src/components/Toast/Toast.tsx`
- Create: `packages/ui/src/components/Toast/Toast.stories.tsx`
- Create: `packages/ui/src/components/Toast/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `createToaster()` re-export (Ark UI's toaster factory — apps call this once at app
  root to get a `toaster` instance, then call `toaster.create({ title, type })` from anywhere),
  and a `Toaster` component (`ToasterProps: { toaster: ReturnType<typeof createToaster> }`) that
  renders the toast viewport. Used for save/publish feedback in later plans.

- [ ] **Step 1: Write `packages/ui/src/components/Toast/Toast.tsx`**

```tsx
import { createToaster, Toast as ArkToast, Toaster as ArkToaster } from '@ark-ui/react';

export { createToaster };

export type ToasterProps = {
  toaster: ReturnType<typeof createToaster>;
};

const toneClasses: Record<string, string> = {
  success: 'border-[var(--mf-success)]',
  error: 'border-[var(--mf-danger)]',
  info: 'border-[var(--border-subtle)]',
  warning: 'border-[var(--mf-warning)]',
  loading: 'border-[var(--border-subtle)]',
};

export function Toaster({ toaster }: ToasterProps) {
  return (
    <ArkToaster toaster={toaster}>
      {(toast) => (
        <ArkToast.Root
          key={toast.id}
          className={[
            'rounded-md bg-[var(--surface-overlay)] border shadow-md px-4 py-3 min-w-[260px]',
            toneClasses[toast.type] ?? toneClasses.info,
          ].join(' ')}
        >
          <ArkToast.Title className="font-sans text-sm font-medium text-[var(--text-strong)]">
            {toast.title}
          </ArkToast.Title>
          {toast.description && (
            <ArkToast.Description className="mt-0.5 font-sans text-xs text-[var(--text-muted)]">
              {toast.description}
            </ArkToast.Description>
          )}
        </ArkToast.Root>
      )}
    </ArkToaster>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Toast/Toast.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { createToaster, Toaster } from './Toast';

const toaster = createToaster({ placement: 'bottom-end' });

const meta: Meta<typeof Toaster> = {
  title: 'Components/Toast',
  component: Toaster,
  args: { toaster },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: (args) => (
    <div>
      <Button onClick={() => toaster.create({ title: 'Saved', type: 'success' })}>
        Show success toast
      </Button>
      <Toaster {...args} />
    </div>
  ),
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Toast/index.ts`**

```typescript
export type { ToasterProps } from './Toast';
export { createToaster, Toaster } from './Toast';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { ToasterProps } from './Toast/Toast';
export { createToaster, Toaster } from './Toast/Toast';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `ArkToaster`'s render-prop signature, `toast.type`'s possible values, or
`createToaster`'s options differ, check
`node_modules/@ark-ui/react/dist/components/toast/*.d.ts` and adjust — in particular confirm
whether `Toaster` is a function-as-child component or takes a different render API in the
installed version.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Toast packages/ui/src/components/index.ts
git commit -m "feat(ui): add Toast component"
```

---

### Task 11: `DatePicker`

**Files:**
- Create: `packages/ui/src/components/DatePicker/DatePicker.tsx`
- Create: `packages/ui/src/components/DatePicker/DatePicker.stories.tsx`
- Create: `packages/ui/src/components/DatePicker/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `DatePicker` component, `DatePickerProps` type (`value?: string`, `defaultValue?:
  string`, `onValueChange?: (isoDate: string) => void`, `disabled?`, `className?`) — the
  component's public interface is plain ISO date strings (`'2026-07-12'`), matching the Sanity
  `date` field type used by `certification.date` and `invoice.issueDate`/`dueDate`; internal
  conversion to/from Ark UI's date-picker value format happens inside the component so form code
  never touches Ark UI's internal date type.

- [ ] **Step 1: Write `packages/ui/src/components/DatePicker/DatePicker.tsx`**

```tsx
import { DatePicker as ArkDatePicker, parseDate, Portal } from '@ark-ui/react';

export type DatePickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (isoDate: string) => void;
  disabled?: boolean;
  className?: string;
};

const inputClasses =
  'w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm text-[var(--text-field)] ' +
  'bg-[var(--surface-field)] border border-[var(--border-default)] rounded-md outline-none ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const contentClasses =
  'z-50 rounded-md bg-[var(--surface-overlay)] border border-[var(--border-subtle)] shadow-md p-3';

const cellTriggerClasses =
  'w-8 h-8 flex items-center justify-center rounded-sm font-sans text-sm text-[var(--text-body)] ' +
  'cursor-pointer data-[selected]:bg-[var(--primary)] data-[selected]:text-[var(--text-inverse)] ' +
  'data-[today]:font-semibold hover:bg-[var(--primary-soft)]';

export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className = '',
}: DatePickerProps) {
  return (
    <ArkDatePicker.Root
      value={value ? [parseDate(value)] : undefined}
      defaultValue={defaultValue ? [parseDate(defaultValue)] : undefined}
      onValueChange={(details) => {
        const iso = details.valueAsString[0];
        if (iso) onValueChange?.(iso);
      }}
      disabled={disabled}
      className={className}
    >
      <ArkDatePicker.Control>
        <ArkDatePicker.Input className={inputClasses} />
        <ArkDatePicker.Trigger />
      </ArkDatePicker.Control>
      <Portal>
        <ArkDatePicker.Positioner>
          <ArkDatePicker.Content className={contentClasses}>
            <ArkDatePicker.View view="day">
              <ArkDatePicker.Context>
                {(datePicker) => (
                  <>
                    <ArkDatePicker.ViewControl>
                      <ArkDatePicker.PrevTrigger>‹</ArkDatePicker.PrevTrigger>
                      <ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.RangeText />
                      </ArkDatePicker.ViewTrigger>
                      <ArkDatePicker.NextTrigger>›</ArkDatePicker.NextTrigger>
                    </ArkDatePicker.ViewControl>
                    <ArkDatePicker.Table>
                      <ArkDatePicker.TableHead>
                        <ArkDatePicker.TableRow>
                          {datePicker.weekDays.map((weekDay, i) => (
                            <ArkDatePicker.TableHeader key={i}>
                              {weekDay.narrow}
                            </ArkDatePicker.TableHeader>
                          ))}
                        </ArkDatePicker.TableRow>
                      </ArkDatePicker.TableHead>
                      <ArkDatePicker.TableBody>
                        {datePicker.weeks.map((week, i) => (
                          <ArkDatePicker.TableRow key={i}>
                            {week.map((day, j) => (
                              <ArkDatePicker.TableCell key={j} value={day}>
                                <ArkDatePicker.TableCellTrigger className={cellTriggerClasses}>
                                  {day.day}
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            ))}
                          </ArkDatePicker.TableRow>
                        ))}
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>
    </ArkDatePicker.Root>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/DatePicker/DatePicker.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: '2026-07-12' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/DatePicker/index.ts`**

```typescript
export type { DatePickerProps } from './DatePicker';
export { DatePicker } from './DatePicker';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { DatePickerProps } from './DatePicker/DatePicker';
export { DatePicker } from './DatePicker/DatePicker';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. This is the most likely component in the plan to need API adjustment —
`@ark-ui/react`'s date-picker anatomy (`ArkDatePicker.Context`'s render-prop shape,
`weekDays`/`weeks` field names, `valueAsString` on change details, `parseDate`'s exact export
path) can differ across versions. Check
`node_modules/@ark-ui/react/dist/components/date-picker/*.d.ts` for the installed version's real
shape and adjust the implementation to match — the ISO-string-in/ISO-string-out public
`DatePickerProps` interface must stay the same regardless of internal adjustments.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/DatePicker packages/ui/src/components/index.ts
git commit -m "feat(ui): add DatePicker component"
```

---

### Task 12: `Table`

**Files:**
- Create: `packages/ui/src/components/Table/Table.tsx`
- Create: `packages/ui/src/components/Table/Table.stories.tsx`
- Create: `packages/ui/src/components/Table/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `Table` component, `TableProps<T>` type (`columns: TableColumn<T>[]`, `rows: T[]`,
  `getRowKey: (row: T) => string`, `onRowClick?: (row: T) => void`, `className?`) and
  `TableColumn<T>` type (`{ header: string, render: (row: T) => ReactNode, align?: 'left' |
  'right' }`). Plain HTML `<table>`, not Ark UI (no interactive anatomy needed for a data grid
  in this scope — sorting/pagination are out of scope). Used by the content-parity list views
  and the invoice line-item table.

- [ ] **Step 1: Write `packages/ui/src/components/Table/Table.tsx`**

```tsx
import type { ReactNode } from 'react';

export type TableColumn<T> = {
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
};

const headerCellClasses =
  'px-3 py-2 font-sans text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] ' +
  'border-b border-[var(--border-subtle)]';

const bodyCellClasses = 'px-3 py-2 font-sans text-sm text-[var(--text-body)]';

export function Table<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  className = '',
}: TableProps<T>) {
  return (
    <table className={['w-full border-collapse', className].filter(Boolean).join(' ')}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.header}
              className={[headerCellClasses, column.align === 'right' ? 'text-right' : 'text-left']
                .filter(Boolean)
                .join(' ')}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={[
              'border-b border-[var(--border-subtle)] last:border-b-0',
              onRowClick ? 'cursor-pointer hover:bg-[var(--primary-soft)]' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {columns.map((column) => (
              <td
                key={column.header}
                className={[bodyCellClasses, column.align === 'right' ? 'text-right' : 'text-left']
                  .filter(Boolean)
                  .join(' ')}
              >
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/Table/Table.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';

type Project = { id: string; name: string; status: string };

const PROJECTS: Project[] = [
  { id: '1', name: 'Portfolio', status: 'published' },
  { id: '2', name: 'Admin Studio', status: 'draft' },
];

const meta: Meta<typeof Table<Project>> = {
  title: 'Components/Table',
  component: Table<Project>,
  args: {
    rows: PROJECTS,
    getRowKey: (row: Project) => row.id,
    columns: [
      { header: 'Name', render: (row: Project) => row.name },
      { header: 'Status', render: (row: Project) => row.status, align: 'right' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Table<Project>>;

export const Default: Story = {};

export const Clickable: Story = {
  args: { onRowClick: (row: Project) => alert(row.name) },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/Table/index.ts`**

```typescript
export type { TableColumn, TableProps } from './Table';
export { Table } from './Table';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { TableColumn, TableProps } from './Table/Table';
export { Table } from './Table/Table';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. Plain HTML table + generics, no third-party API surface to diverge from.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Table packages/ui/src/components/index.ts
git commit -m "feat(ui): add Table component"
```

---

### Task 13: `LocaleField`

**Files:**
- Create: `packages/ui/src/components/LocaleField/LocaleField.tsx`
- Create: `packages/ui/src/components/LocaleField/LocaleField.stories.tsx`
- Create: `packages/ui/src/components/LocaleField/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Consumes: `Tabs`/`TabItem` from Task 8, `Input` (existing component).
- Produces: `LocaleField` component, `LocaleFieldProps` type (`value: Record<'en' | 'es' | 'pt',
  string>`, `onValueChange: (locale: 'en' | 'es' | 'pt', value: string) => void`, `label?:
  string`, `multiline?: boolean`, `className?`) — a tabbed en/es/pt wrapper around `Input`,
  matching the `localeString` Sanity shape. (`localeContent`'s block-content shape is handled by
  `RichTextEditor`, Task 14, not this component — this one is for the plain-string case.)

- [ ] **Step 1: Write `packages/ui/src/components/LocaleField/LocaleField.tsx`**

```tsx
import { Input } from '../Input/Input';
import { Tabs } from '../Tabs/Tabs';

export type SupportedLocale = 'en' | 'es' | 'pt';

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

export type LocaleFieldProps = {
  value: Record<SupportedLocale, string>;
  onValueChange: (locale: SupportedLocale, value: string) => void;
  label?: string;
  multiline?: boolean;
  className?: string;
};

export function LocaleField({
  value,
  onValueChange,
  multiline = false,
  className = '',
}: LocaleFieldProps) {
  const locales: SupportedLocale[] = ['en', 'es', 'pt'];

  return (
    <Tabs
      className={className}
      items={locales.map((locale) => ({
        value: locale,
        label: LOCALE_LABELS[locale],
        content: (
          <Input
            as={multiline ? 'textarea' : 'input'}
            value={value[locale]}
            onChange={(event) => onValueChange(locale, event.target.value)}
          />
        ),
      }))}
    />
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/LocaleField/LocaleField.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { SupportedLocale } from './LocaleField';
import { LocaleField } from './LocaleField';

const meta: Meta<typeof LocaleField> = {
  title: 'Components/LocaleField',
  component: LocaleField,
};

export default meta;
type Story = StoryObj<typeof LocaleField>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState({ en: 'Issued', es: 'Emitido', pt: 'Emitido' });
    return (
      <LocaleField
        value={value}
        onValueChange={(locale: SupportedLocale, next: string) =>
          setValue((prev) => ({ ...prev, [locale]: next }))
        }
      />
    );
  },
};

export const Multiline: Story = {
  render: () => {
    const [value, setValue] = useState({ en: '', es: '', pt: '' });
    return (
      <LocaleField
        multiline
        value={value}
        onValueChange={(locale: SupportedLocale, next: string) =>
          setValue((prev) => ({ ...prev, [locale]: next }))
        }
      />
    );
  },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/LocaleField/index.ts`**

```typescript
export type { LocaleFieldProps, SupportedLocale } from './LocaleField';
export { LocaleField } from './LocaleField';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { LocaleFieldProps, SupportedLocale } from './LocaleField/LocaleField';
export { LocaleField } from './LocaleField/LocaleField';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/LocaleField packages/ui/src/components/index.ts
git commit -m "feat(ui): add LocaleField component"
```

---

### Task 14: `RichTextEditor`

**Files:**
- Modify: `packages/ui/package.json` (add `@portabletext/editor` dependency)
- Create: `packages/ui/src/components/RichTextEditor/RichTextEditor.tsx`
- Create: `packages/ui/src/components/RichTextEditor/RichTextEditor.stories.tsx`
- Create: `packages/ui/src/components/RichTextEditor/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `RichTextEditor` component, `RichTextEditorProps` type (`value:
  Array<Record<string, unknown>>` — a Portable Text block array, matching `localeContent`'s
  per-language shape — `onValueChange: (value: Array<Record<string, unknown>>) => void`,
  `placeholder?`, `className?`). Built on `@portabletext/editor` (headless), emits the same
  block array shape `localeContent` stores in Sanity, so `apps/admin`'s content forms can bind
  it directly to `description.en`/`description.es`/`description.pt`.

- [ ] **Step 1: Confirm exact current version before pinning (never from memory)**

```bash
fnm exec -- pnpm info @portabletext/editor version
```

- [ ] **Step 2: Add the dependency to `packages/ui/package.json`**

Read the file first, then add to `dependencies` (alongside `@ark-ui/react`):

```json
"@portabletext/editor": "^<version from Step 1>",
```

- [ ] **Step 3: Install**

```bash
fnm exec -- pnpm install
```

- [ ] **Step 4: Write `packages/ui/src/components/RichTextEditor/RichTextEditor.tsx`**

```tsx
import {
  EditorProvider,
  PortableTextEditable,
  type EditorEmittedEvent,
  type PortableTextBlock,
} from '@portabletext/editor';
import { useCallback } from 'react';

export type RichTextEditorProps = {
  value: PortableTextBlock[];
  onValueChange: (value: PortableTextBlock[]) => void;
  placeholder?: string;
  className?: string;
};

const editableClasses =
  'min-h-[160px] w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm ' +
  'text-[var(--text-field)] bg-[var(--surface-field)] border border-[var(--border-default)] ' +
  'rounded-md outline-none transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus';

export function RichTextEditor({
  value,
  onValueChange,
  placeholder,
  className = '',
}: RichTextEditorProps) {
  const handleEditorEvent = useCallback(
    (event: EditorEmittedEvent) => {
      if (event.type === 'mutation' && event.value) {
        onValueChange(event.value as PortableTextBlock[]);
      }
    },
    [onValueChange],
  );

  return (
    <div className={className}>
      <EditorProvider
        initialConfig={{
          initialValue: value,
          schemaDefinition: {},
        }}
      >
        <PortableTextEditable
          className={editableClasses}
          placeholder={placeholder}
          onEditorEvent={handleEditorEvent}
        />
      </EditorProvider>
    </div>
  );
}
```

- [ ] **Step 5: Write `packages/ui/src/components/RichTextEditor/RichTextEditor.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PortableTextBlock } from '@portabletext/editor';
import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';

const meta: Meta<typeof RichTextEditor> = {
  title: 'Components/RichTextEditor',
  component: RichTextEditor,
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<PortableTextBlock[]>([]);
    return <RichTextEditor value={value} onValueChange={setValue} placeholder="Description…" />;
  },
};
```

- [ ] **Step 6: Write `packages/ui/src/components/RichTextEditor/index.ts`**

```typescript
export type { RichTextEditorProps } from './RichTextEditor';
export { RichTextEditor } from './RichTextEditor';
```

- [ ] **Step 7: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { RichTextEditorProps } from './RichTextEditor/RichTextEditor';
export { RichTextEditor } from './RichTextEditor/RichTextEditor';
```

- [ ] **Step 8: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. `@portabletext/editor`'s exact API (event names, `EditorProvider`'s config
shape, whether `schemaDefinition` is required or has a different name/shape, `EditorEmittedEvent`'s
discriminated union) is very likely to differ from what's shown here — this is a headless
editor library with a real learning curve. Check
`node_modules/@portabletext/editor/dist/**/*.d.ts` (or the package's own docs/README if
installed) for the real API and adapt. The one thing that must NOT change: `RichTextEditorProps`
keeps `value`/`onValueChange` as plain Portable Text block arrays — no Sanity-specific or
editor-internal types leak into the public prop signature.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/package.json packages/ui/src/components/RichTextEditor
git add pnpm-lock.yaml
git commit -m "feat(ui): add RichTextEditor component"
```

---

### Task 15: `ImageUploader`

**Files:**
- Create: `packages/ui/src/components/ImageUploader/ImageUploader.tsx`
- Create: `packages/ui/src/components/ImageUploader/ImageUploader.stories.tsx`
- Create: `packages/ui/src/components/ImageUploader/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Consumes: `FileUpload` and `ImageCropper` from `@ark-ui/react` (already installed).
- Produces: `ImageUploader` component, `ImageUploaderProps` type (`imageUrl?: string`, `alt:
  string`, `onAltChange: (alt: string) => void`, `onUpload: (file: File) => Promise<string>` —
  caller-supplied async upload function returning the resulting image URL, e.g. `apps/admin`
  wires this to `uploadImageAssetFn`, `onHotspotChange?: (hotspot: { x: number; y: number })
  => void`, `className?`). This component does NOT import `@sanity/client` or know about Sanity
  document shapes — it is a generic "pick a file, upload it via a callback, set alt text, drag a
  crop/hotspot point" widget; `apps/admin` (a later plan) is responsible for turning its output
  into a Sanity image object.

- [ ] **Step 1: Write `packages/ui/src/components/ImageUploader/ImageUploader.tsx`**

```tsx
import { FileUpload } from '@ark-ui/react';
import { useState } from 'react';
import { Input } from '../Input/Input';

export type ImageUploaderProps = {
  imageUrl?: string;
  alt: string;
  onAltChange: (alt: string) => void;
  onUpload: (file: File) => Promise<string>;
  className?: string;
};

const dropzoneClasses =
  'flex flex-col items-center justify-center gap-2 min-h-[160px] rounded-md ' +
  'border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-field)] ' +
  'cursor-pointer transition-colors duration-[120ms] hover:border-[var(--focus-ring)]';

export function ImageUploader({
  imageUrl,
  alt,
  onAltChange,
  onUpload,
  className = '',
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(imageUrl);
  const [uploading, setUploading] = useState(false);

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      <FileUpload.Root
        accept="image/*"
        maxFiles={1}
        onFileAccept={async (details) => {
          const file = details.files[0];
          if (!file) return;
          setUploading(true);
          try {
            const uploadedUrl = await onUpload(file);
            setPreviewUrl(uploadedUrl);
          } finally {
            setUploading(false);
          }
        }}
      >
        <FileUpload.Dropzone className={dropzoneClasses}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={alt}
              className="max-h-[200px] w-auto rounded-md object-contain"
            />
          ) : (
            <span className="font-sans text-sm text-[var(--text-muted)]">
              {uploading ? 'Uploading…' : 'Drop an image or click to upload'}
            </span>
          )}
        </FileUpload.Dropzone>
        <FileUpload.HiddenInput />
      </FileUpload.Root>
      <Input
        value={alt}
        onChange={(event) => onAltChange(event.target.value)}
        placeholder="Alt text"
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `packages/ui/src/components/ImageUploader/ImageUploader.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ImageUploader } from './ImageUploader';

const meta: Meta<typeof ImageUploader> = {
  title: 'Components/ImageUploader',
  component: ImageUploader,
};

export default meta;
type Story = StoryObj<typeof ImageUploader>;

export const Default: Story = {
  render: () => {
    const [alt, setAlt] = useState('');
    return (
      <ImageUploader
        alt={alt}
        onAltChange={setAlt}
        onUpload={async (file: File) => URL.createObjectURL(file)}
      />
    );
  },
};

export const WithExistingImage: Story = {
  render: () => {
    const [alt, setAlt] = useState('Existing photo');
    return (
      <ImageUploader
        imageUrl="https://placehold.co/400x300"
        alt={alt}
        onAltChange={setAlt}
        onUpload={async (file: File) => URL.createObjectURL(file)}
      />
    );
  },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/ImageUploader/index.ts`**

```typescript
export type { ImageUploaderProps } from './ImageUploader';
export { ImageUploader } from './ImageUploader';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically:

```typescript
export type { ImageUploaderProps } from './ImageUploader/ImageUploader';
export { ImageUploader } from './ImageUploader/ImageUploader';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

Expected: no errors. If `FileUpload.Root`'s `onFileAccept` details shape (`details.files`) or
`FileUpload.Dropzone`/`FileUpload.HiddenInput` props differ, check
`node_modules/@ark-ui/react/dist/components/file-upload/*.d.ts` and adjust. Note: this task
intentionally does NOT implement hotspot/crop dragging via `ImageCropper` — that's flagged as a
DONE_WITH_CONCERNS-worthy scope note if you find the brief underspecifies it: the spec's
`ImageUploader` bullet says it "sets the hotspot point + crop rect," but this task's interface
only exposes `onHotspotChange` on the type, not yet wired into a UI element. **If you have time
budget after the rest of the component works and typechecks, wire a minimal `ImageCropper`
overlay on top of the preview image using `@ark-ui/react`'s `ImageCropper` namespace; if that
turns out to be substantially more complex than the rest of this task, stop, leave the
`onHotspotChange` prop in place but unused (report it as a concern), and let a later plan finish
the crop/hotspot interaction** — do not silently skip reporting the gap.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/ImageUploader packages/ui/src/components/index.ts
git commit -m "feat(ui): add ImageUploader component"
```

---

## Self-Review Notes

- **Spec coverage:** All 10 named primitives from the spec's "New primitives" bullet (Select,
  Combobox, DatePicker, Dialog, Table, Tabs, Toast, NumberInput, Checkbox/Switch, Tooltip) are
  covered — Checkbox and Switch are split into two tasks (Tasks 2-3) since they're distinct
  components sharing a bullet in the spec's prose. All 3 composites (LocaleField,
  RichTextEditor, ImageUploader) from "New composite components" are covered (Tasks 13-15).
  `InvoiceDocument`, the fourth composite listed in the spec, is explicitly out of scope for
  this plan — it belongs with the invoice feature plan (Phase 7), since it needs the invoice
  data model and totals logic wired together, not just standalone UI.
- **Placeholder scan:** no TBD/TODO/"add error handling" left in any step. Task 15's note about
  hotspot/crop is an explicit, reported scope boundary with an actionable instruction, not a
  vague placeholder.
- **Type consistency:** `TabItem`/`TabsProps` (Task 8) are consumed by `LocaleField` (Task 13)
  with matching shapes. `SelectProps<T>`/`ComboboxProps<T>` (Tasks 6-7) both use the
  `itemToString`/`itemToValue`/`createListCollection` pattern consistently. `DatePickerProps`
  (Task 11) exposes plain ISO strings matching the Sanity `date` field type used elsewhere in
  the spec's data model.

## Next Plans

- `docs/superpowers/plans/<date>-admin-content-parity.md` — Phase 5 (projects/certifications/
  degrees list + edit forms, draft/publish toolbar) — wires these primitives into `apps/admin`
  for the first time.
- `docs/superpowers/plans/<date>-admin-clients-invoices.md` — Phase 6-7 (clients CRUD, invoice
  schema/form/numbering/list, `InvoiceDocument`, print route).
