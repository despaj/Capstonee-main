import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import iFranchiseForm from './components/ApplyFranchise';
import IPharmaForm from './components/iPharmaForm';
import AdminDashboard from './components/AdminDashboard';
import ApplyFranchise from './components/ApplyFranchise';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/apply-pharma" element={<IPharmaForm/>}/>
           <Route path="/admin-dashboard" element={<AdminDashboard />} />
           <Route path="/apply-franchise" element={<ApplyFranchise/>} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;