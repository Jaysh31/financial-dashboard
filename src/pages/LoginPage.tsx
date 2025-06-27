import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const motivationalQuotes = [
  "Track every penny, grow every dollar.",
  "Your money should work for you — make it accountable.",
  "Analyze, Optimize, Succeed.",
  "Clarity in numbers leads to confidence in decisions.",
  "Let your data tell the story of success."
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSplash, setShowSplash] = useState(false);
  const [quote, setQuote] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      const result = await axios.post('http://localhost:3001/login', {
        email,
        password,
      });
  
      console.log(result.data);
  
      if (result.data.status === "Success") {
        const token = result.data.token;
        const username = result.data.username;

        localStorage.setItem("token", token); // ✅ Store token
        localStorage.setItem("username", username); // ✅ Store token
          console.log("heyy",username)
        // ✅ Splash animation
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setQuote(randomQuote);
        setShowSplash(true);
  
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } else {
        setError(result.data); // Incorrect password / No account
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  
  

  return showSplash ? (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 transition-all animate-fade-in">
      <img
        src="/adobe-analytics-logo.svg" // ✅ remove "/public" from path
        alt="Logo"
        className="w-60 h-60 mb-6 animate-pulse drop-shadow-lg"
      />
      <h1 className="text-4xl font-bold text-center animate-slide-in">{quote}</h1>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Welcome to Penta</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-lg"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>  
      </div>
    </div>
  );
};

export default LoginPage;
