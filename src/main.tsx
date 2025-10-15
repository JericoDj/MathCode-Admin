import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // Import BrowserRouter for routing

import App from './App.tsx';  // Your main App component

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>  {/* Wrap your app with BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);
