import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';

const startApp = async () => {
  if (Capacitor.getPlatform() === 'web') {
    jeepSqlite(window);
    const jeepSqliteElem = document.createElement('jeep-sqlite');
    document.body.appendChild(jeepSqliteElem);
  }

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

startApp();