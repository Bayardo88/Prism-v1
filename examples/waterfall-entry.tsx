import { createRoot } from 'react-dom/client';
import { Waterfall } from './screens/Waterfall.js';

const el = document.getElementById('root');
if (el) createRoot(el).render(<Waterfall />);
