import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/Button.js';
import { Icon } from '../icon/Icon.js';
import { icons } from '../icon/index.js';
import { Input } from '../input/Input.js';
import {
  ComboboxOption, ComboboxPanel, CopyField, Dropzone, FloatingLabelInput, FloatingLabelSelect, ImageCropField,
  InlineEdit, InlinePicker, NumberField, RepeatableRow, SelectMenu, SelectMenuOption, ShowMoreRow, Slider, TagInput, TimeField,
  type ComboboxItem,
} from './index.js';

const meta = {
  title: 'Forms/Patterns',
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const FloatingInput: Story = { render: () => <FloatingLabelInput label="Company name" helperText="As filed." /> };
export const FloatingInputError: Story = { render: () => <FloatingLabelInput label="Email" state="error" defaultValue="ana@" helperText="Enter a valid email." /> };
export const FloatingInputDisabled: Story = { render: () => <FloatingLabelInput label="Locked" state="disabled" defaultValue="Read only" /> };
export const FloatingSelect: Story = {
  render: () => (<FloatingLabelSelect label="Currency" defaultValue="usd"><option value="usd">USD</option><option value="eur">EUR</option></FloatingLabelSelect>),
};

function NumberDemo() {
  const [v, setV] = useState<number | ''>(12);
  return <NumberField label="Discount rate" value={v} onChange={setV} min={0} max={100} suffix="%" />;
}
export const Number: Story = { render: () => <NumberDemo /> };
export const NumberStepper: Story = { render: () => <NumberField label="Shares" defaultValue={100} step={10} unitLabel="shares" /> };
export const NumberError: Story = { render: () => <NumberField label="Discount rate" state="error" defaultValue={140} suffix="%" /> };
export const Time: Story = { render: () => <TimeField label="Report time" defaultValue="09:00" /> };

/** Enter or comma adds a tag, Backspace on an empty entry removes the last, pasting a list splits it. */
export const Tags: Story = {
  render: () => (
    <TagInput
      label="Recipients"
      placeholder="Add email"
      defaultValues={['ana@firm.com', 'li@firm.com']}
      helperText="Press Enter to add."
      validate={(v) => (v.includes('@') ? undefined : 'Enter a valid email')}
    />
  ),
};
export const TagsDisabled: Story = { render: () => <TagInput label="Recipients" state="disabled" defaultValues={['ana@firm.com']} /> };
export const Copy: Story = { render: () => <CopyField label="Report URL" value="https://app.example.com/reports/9f2c" /> };
export const CopySecret: Story = { render: () => <CopyField label="API key" secret value="sk_live_1234567890abcdefghij" /> };

const companies: ComboboxItem[] = [
  { value: 'nw', label: 'Northwind Capital', detail: 'Fund III' },
  { value: 'ac', label: 'Acme Robotics', detail: 'Fund II' },
  { value: 'gl', label: 'Globex Health', detail: 'Fund III' },
  { value: 'in', label: 'Initech', detail: 'Fund I', disabled: true },
];
function ComboDemo({ multiple }: { multiple?: boolean }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>(['nw']);
  const items = companies.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <ComboboxPanel
      label="Companies"
      items={items}
      query={q}
      onQueryChange={setQ}
      multiple={multiple}
      value={multiple ? sel : sel[0]}
      onSelect={(v) => setSel(multiple ? (sel.includes(v) ? sel.filter((s) => s !== v) : [...sel, v]) : [v])}
      showMore={{ label: 'Show 24 more companies', onClick: () => undefined }}
      footer={<Button variant="tertiary" size="s">Add new company</Button>}
    />
  );
}
/** Up/Down move the active option, Enter selects, Esc clears the query. */
export const Combobox: Story = { render: () => <ComboDemo /> };
export const ComboboxMulti: Story = { render: () => <ComboDemo multiple /> };
export const ComboboxOptions: Story = {
  render: () => (
    <div role="listbox" aria-label="Options" style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
      <ComboboxOption detail="Fund III">Northwind</ComboboxOption>
      <ComboboxOption selected>Selected</ComboboxOption>
      <ComboboxOption active>Active</ComboboxOption>
      <ComboboxOption disabled>Disabled</ComboboxOption>
      <ComboboxOption selection="multi" selected>Multi</ComboboxOption>
    </div>
  ),
};
export const ShowMore: Story = { render: () => <ShowMoreRow>Show 24 more companies</ShowMoreRow> };

function SelectMenuDemo() {
  const [v, setV] = useState('usd');
  const opts = [['usd', 'US dollar', 'Default'], ['eur', 'Euro', ''], ['gbp', 'Pound sterling', ''], ['chf', 'Swiss franc', '']];
  return (
    <SelectMenu label="Currency">
      {opts.map(([k, n, d]) => (
        <SelectMenuOption key={k} selected={v === k} disabled={k === 'chf'} description={d || undefined} onSelect={() => setV(k!)}>{n}</SelectMenuOption>
      ))}
    </SelectMenu>
  );
}
/** Up/Down move, Home/End jump, type to jump, Enter or Space choose, Esc closes. */
export const SelectMenuStory: Story = { name: 'Select menu', render: () => <SelectMenuDemo /> };

function RepeatDemo() {
  const [rows, setRows] = useState(['ana@firm.com', 'li@firm.com']);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
      {rows.map((r, i) => (
        <RepeatableRow key={r} index={i} removeLabel={`Remove recipient ${r}`} removeDisabled={rows.length === 1} onRemove={() => setRows(rows.filter((x) => x !== r))}>
          <Input aria-label={`Recipient ${i + 1}`} defaultValue={r} />
        </RepeatableRow>
      ))}
      <Button variant="tertiary" onClick={() => setRows([...rows, `new${rows.length}@firm.com`])}>Add recipient</Button>
    </div>
  );
}
export const Repeatable: Story = { render: () => <RepeatDemo /> };

export const DropzoneDefault: Story = { render: () => <Dropzone onFiles={() => undefined} hint="CSV, XLSX or PDF · 15 MB max" accept=".csv,.xlsx,.pdf" /> };
export const DropzoneUploading: Story = { render: () => <Dropzone onFiles={() => undefined} hint="CSV, XLSX or PDF · 15 MB max" state="uploading" progress={45} message="Uploading cap-table.xlsx" /> };
export const DropzoneError: Story = { render: () => <Dropzone onFiles={() => undefined} hint="CSV, XLSX or PDF · 15 MB max" state="error" message="File is larger than 15 MB." /> };
export const DropzoneDisabled: Story = { render: () => <Dropzone onFiles={() => undefined} hint="PDF only" disabled /> };

function SliderDemo() {
  const [v, setV] = useState('1.4');
  return (
    <Slider
      label="Zoom"
      min={1}
      max={3}
      step={0.1}
      value={v}
      onChange={(e) => setV(e.target.value)}
      minIcon={<Icon size="s"><icons.Remove /></Icon>}
      maxIcon={<Icon size="s"><icons.Add /></Icon>}
      readout={`${v}×`}
      aria-valuetext={`${v} times`}
    />
  );
}
/** Arrow keys step, Home/End jump to the ends. */
export const SliderStory: Story = { name: 'Slider', render: () => <SliderDemo /> };

/** Enter or blur commits, Esc cancels. */
export const InlineEditDefault: Story = { render: () => <InlineEdit label="Comp group name" placeholder="Enter name" defaultValue="SaaS peers" /> };
export const InlineEditEmpty: Story = { render: () => <InlineEdit label="Comp group name" placeholder="Enter name" /> };
export const InlineEditReadOnly: Story = { render: () => <InlineEdit label="Comp group name" placeholder="Enter name" defaultValue="Locked" readOnly /> };
export const InlinePickerDefault: Story = { render: () => <InlinePicker label="Previous versions" secondary="V-2">09/21/2026</InlinePicker> };

function CropDemo() {
  const [z, setZ] = useState(1);
  return <ImageCropField label="Firm logo" zoom={z} onZoomChange={setZ} onRemove={() => undefined} />;
}
export const ImageCrop: Story = { render: () => <CropDemo /> };
export const ImageCropWide: Story = { render: () => <ImageCropField label="Wordmark" shape="wide" zoom={1} onZoomChange={() => undefined} /> };
