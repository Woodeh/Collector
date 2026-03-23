import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header'; // Импортируем новый Header
import AddFigure from './pages/AddFigure';
import Collection from './pages/Collection';
import Login from './pages/Login.jsx';
import FigureDetails from './pages/FigureDetails';
import PreOrders from './pages/PreOrders';
import Wishlist from './pages/Wishlist';

const HomePage = () => (
  <div className="p-12 text-center max-w-2xl mx-auto">
    <h2 className="text-4xl font-black mb-6 italic uppercase tracking-tighter">
      Welcome to your <span className="text-blue-500">COLLECTION</span>
    </h2>
    <p className="text-gray-400 text-lg mb-10 leading-relaxed">
      Manage your figure collection, track pre-orders, and keep your inventory up to date.
    </p>
    <div className="flex justify-center gap-6">
      <Link
        to="/add"
        className="bg-blue-600 px-8 py-3 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
      >
        ADD NEW FIGURE
      </Link>
      <Link
        to="/collection"
        className="bg-[#1a1a1a] px-8 py-3 rounded-2xl font-black border border-[#333] hover:bg-[#252525] transition-all active:scale-95"
      >
        VIEW COLLECTION
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#121212] text-[#e4e4e4]">
        <Header />

        <main className="max-w-7xl mx-auto w-full p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/add" element={<AddFigure />} />
            <Route path="/login" element={<Login />} />
            <Route path="/figure/:id" element={<FigureDetails />} />
            <Route path="/preorders" element={<PreOrders />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
