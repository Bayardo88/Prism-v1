import { createRoot } from 'react-dom/client';
import { Playground } from './screens/Playground.js';

const el = document.getElementById('root');
if (el) createRoot(el).render(<Playground />);
