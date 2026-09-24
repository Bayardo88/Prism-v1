import { createRoot } from 'react-dom/client';
import { Gallery } from './screens/Gallery.js';

const el = document.getElementById('root');
if (el) createRoot(el).render(<Gallery />);
