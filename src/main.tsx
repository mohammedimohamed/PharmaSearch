import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { populateSeoUrlMap } from '@/utils/seoRegistry';
import './styles/index.css';

// The recordId -> clean-URL map (all catalogue records) is a separate lazily loaded chunk.
// It must be ready before first render so links and legacy-hash migration resolve correctly.
import('@/data/seo-url-map.json').then((mod) => {
  populateSeoUrlMap(mod.default as Record<string, string>);
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
