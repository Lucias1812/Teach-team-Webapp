import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState<string | null>(null);
  return token ? <Dashboard token={token} /> : <Login onLogin={setToken} />;
}

export default App;
