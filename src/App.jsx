import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Collection from './pages/CollectionPage';
import Login from './pages/LoginPage';
import FigureDetails from './pages/FigureDetailsPage';
import PreOrders from './pages/PreOrdersPage';
import Wishlist from './pages/WishlistPage';
import Home from './pages/HomePage';
import FigureForm from './components/FigureForm';
import Profile from './pages/ProfilePage';
import Community from './pages/CommunityPage';

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
            <Route path="/add" element={<FigureForm mode="add" />} />
            <Route path="/edit/:id" element={<FigureForm mode="edit" />} />
            <Route path="/figure/:id" element={<FigureDetails />} />
            <Route path="/preorders" element={<PreOrders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
