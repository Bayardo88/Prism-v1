import { createRoot } from 'react-dom/client';
import { PageTemplateExample } from './screens/PageTemplate.js';

const el = document.getElementById('root');
if (el) createRoot(el).render(<PageTemplateExample withContent={location.hash === '#content'} />);
