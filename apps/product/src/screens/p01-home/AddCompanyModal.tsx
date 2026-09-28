/**
 * Add Company modal (Figma: "Portfolio Home — Add Company modal"). Opened from
 * the Companies menu → "Add New Company", or Global Search → "Add New Company".
 *
 * Name and FY End are required; Save stays disabled until Name has a value.
 * IRR Currency is optional and defaults to the Financials currency (USD).
 * On Save the new company would open on its Overview; the prototype closes.
 */
import { useState } from 'react';
import {
  Button, Checkbox, FloatingLabelInput, FloatingLabelSelect, Modal, space,
} from '@scalar/design-system';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'JPY'];

export function AddCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [fyEnd, setFyEnd] = useState('12/31');
  const [dailyNav, setDailyNav] = useState(true);
  const valid = name.trim() !== '' && fyEnd.trim() !== '';

  const row = { display: 'grid', gridTemplateColumns: '3fr 2fr', gap: space.m, alignItems: 'start' } as const;

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissOnScrimClick={false}
      title="Add Company"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={onClose}>Save</Button>
        </>
      }
    >
      <form
        onSubmit={(e) => { e.preventDefault(); if (valid) onClose(); }}
        style={{ display: 'flex', flexDirection: 'column', gap: space.l }}
      >
        <div style={row}>
          <FloatingLabelInput label="Name *" required value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <FloatingLabelInput label="FY End *" required value={fyEnd} onChange={(e) => setFyEnd(e.target.value)} />
        </div>
        <div style={row}>
          <FloatingLabelInput label="Legal Company Name" />
          <FloatingLabelSelect label="Captable Currency" defaultValue="USD">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </FloatingLabelSelect>
        </div>
        <div style={row}>
          <FloatingLabelInput label="Website" type="url" />
          <FloatingLabelSelect label="Financials Currency" defaultValue="USD">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </FloatingLabelSelect>
        </div>
        <div style={row}>
          <span />
          <FloatingLabelSelect label="IRR Currency" defaultValue="" helperText="Defaults to USD">
            <option value="" />
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </FloatingLabelSelect>
        </div>
        <Checkbox checked={dailyNav} onChange={(e) => setDailyNav(e.target.checked)}>
          Enable Daily NAV for this company
        </Checkbox>
      </form>
    </Modal>
  );
}
