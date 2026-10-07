import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../icon/Icon.js';
import { icons } from '../icon/index.js';
import { FormField, Input, Select, Textarea } from './index.js';

const meta = {
  title: 'Forms/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Company name', 'aria-label': 'Company name' },
  argTypes: { state: { control: 'inline-radio', options: ['default', 'error', 'disabled'] } },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: 'Northwind Capital' } };
export const Error: Story = { args: { state: 'error', defaultValue: 'Northwind' } };
export const Disabled: Story = { args: { state: 'disabled', defaultValue: 'Locked' } };
export const WithIcons: Story = {
  args: {
    leadingIcon: <Icon size="s"><icons.Search /></Icon>,
    trailingIcon: <Icon size="s"><icons.Close /></Icon>,
    placeholder: 'Search companies',
    'aria-label': 'Search companies',
  },
};

export const TextareaField: StoryObj<typeof Textarea> = {
  render: () => <div style={{ width: 360 }}><Textarea aria-label="Notes" placeholder="Add valuation notes" rows={4} /></div>,
};
export const TextareaFixed: StoryObj<typeof Textarea> = {
  render: () => <div style={{ width: 360 }}><Textarea aria-label="Notes" resizable={false} defaultValue="Not resizable" /></div>,
};
export const SelectField: StoryObj<typeof Select> = {
  render: () => (
    <div style={{ width: 360 }}>
      <Select aria-label="Currency" defaultValue="usd"><option value="usd">USD</option><option value="eur">EUR</option><option value="gbp">GBP</option></Select>
    </div>
  ),
};
export const SelectDisabled: StoryObj<typeof Select> = {
  render: () => <div style={{ width: 360 }}><Select aria-label="Currency" disabled><option>USD</option></Select></div>,
};

export const FormFieldDefault: StoryObj<typeof FormField> = {
  render: () => (
    <div style={{ width: 360 }}>
      <FormField label="Company name" helperText="As shown on valuation reports." required><Input defaultValue="Northwind" /></FormField>
    </div>
  ),
};
export const FormFieldError: StoryObj<typeof FormField> = {
  render: () => (
    <div style={{ width: 360 }}>
      <FormField label="Email" helperText="Enter a valid email address." state="error"><Input defaultValue="ana@" /></FormField>
    </div>
  ),
};
export const FormFieldTextarea: StoryObj<typeof FormField> = {
  render: () => (
    <div style={{ width: 360 }}>
      <FormField label="Notes" helperText="Visible to your team."><Textarea rows={3} /></FormField>
    </div>
  ),
};
export const FormFieldSelect: StoryObj<typeof FormField> = {
  render: () => (
    <div style={{ width: 360 }}>
      <FormField label="Currency" state="disabled"><Select><option>USD</option></Select></FormField>
    </div>
  ),
};
