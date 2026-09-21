import { createRoot } from 'react-dom/client';
import { CapTable } from './screens/CapTable.js';

const el = document.getElementById('root');
if (el) createRoot(el).render(<CapTable />);
