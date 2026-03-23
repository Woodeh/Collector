import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutGrid, PlusCircle, Home, Database } from 'lucide-react';
import AddFigure from './pages/AddFigure';
import Collection from './pages/Collection';
import Login from './pages/Login.jsx';
import FigureDetails from './pages/FigureDetails';

const HomePage = () => (
  <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">Добро пожаловать в коллекцию!</h2>
    <p className="text-gray-400">Здесь скоро появятся твои последние фигурки.</p>
    <div className="flex justify-center gap-4 mt-6">
      <Link
        to="/add"
        className="bg-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
      >
        Добавить фигурку
      </Link>
      <Link
        to="/collection"
        className="bg-[#252525] px-6 py-2 rounded-lg font-bold border border-[#333] hover:bg-[#333] transition"
      >
        Смотреть коллекцию
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#121212] text-[#e4e4e4]">
        {/* Навигация */}
        <nav className="bg-[#1a1a1a] border-b border-[#333] p-4 flex justify-between items-center sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Database className="text-blue-500" />
            <span>
              FIGURE <span className="text-blue-500">COLLECTOR</span>
            </span>
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-blue-400 transition flex items-center gap-1">
              <Home size={18} /> Home
            </Link>
            <Link
              to="/collection"
              className="hover:text-blue-400 transition flex items-center gap-1"
            >
              <LayoutGrid size={18} /> Collection
            </Link>
            <Link
              to="/add"
              className="text-blue-500 hover:text-blue-400 transition flex items-center gap-1"
            >
              <PlusCircle size={18} /> Add New
            </Link>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto w-full p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/add" element={<AddFigure />} />
            <Route path="/login" element={<Login />} />
            <Route path="/figure/:id" element={<FigureDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
