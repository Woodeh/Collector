import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Collection from './pages/Collection';
import Login from './pages/Login.jsx';
import FigureDetails from './pages/FigureDetails';
import PreOrders from './pages/PreOrders';
import Wishlist from './pages/Wishlist';
import Home from './pages/Home';
import FigureForm from './components/FigureForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#121212] text-[#e4e4e4]">
        <Header />

        <main className="w-full">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/collection" element={<Collection />} />
            <Route path="/login" element={<Login />} />

            {/* Формы добавления и редактирования */}
            <Route path="/add" element={<FigureForm mode="add" />} />
            <Route path="/edit/:id" element={<FigureForm mode="edit" />} />

            {/* Детали и другие страницы */}
            <Route path="/figure/:id" element={<FigureDetails />} />
            <Route path="/preorders" element={<PreOrders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            {/* Проверь путь /favorites или /wishlist — в хедере мы писали /favorites */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
