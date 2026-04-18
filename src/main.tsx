import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// Usando versão DEMO para testes (sem Firebase necessário)
import App from './App.demo.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
