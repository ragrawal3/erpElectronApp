import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SelectFirm from './pages/SelectFirm';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  // const [user, setUser] = useState(null);
  // if(!user) { 
  //   return <LoginPage onLogin={(username) => setUser(username)} />;
  // }
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <div style={{ padding: '50px'}}>
  //         <h2>Welcome, {user}</h2>
  //         <button onClick={() => setUser(null)}>Logout</button>
  //       </div>
  //     </header>
  //   </div>
  // );

  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#eee' }}>
        <Link to="/" style = {{ marginRight: '1rem' }}>Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/select-firm" element={<SelectFirm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
