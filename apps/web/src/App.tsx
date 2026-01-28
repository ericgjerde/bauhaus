import React from 'react';
import { PatternCanvas, ControlPanel } from './components';

function App() {
  return (
    <div className="h-screen flex">
      <PatternCanvas />
      <ControlPanel />
    </div>
  );
}

export default App;
