import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard'; // future
import Transactions from './pages/Transactions';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/signup" element={<SignupPage />} />

      </Routes>
    </Router>
  );
}

export default App;
