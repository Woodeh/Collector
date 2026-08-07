import React, { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './shared/Header';
import Collection from './pages/CollectionPage';
import Login from './pages/LoginPage';
import FigureDetails from './pages/FigureDetailsPage';
import PreOrders from './pages/PreOrdersPage';
import Wishlist from './pages/WishlistPage';
import Home from './pages/HomePage';
import FigureForm from './features/figure-form/FigureForm';
import Profile from './pages/ProfilePage';
import Community from './pages/CommunityPage';
import ScrollToTop from './app/providers/ScrollToTop';
import Footer from './shared/Footer';
import { AuthProvider } from './app/providers/AuthProvider';
import ProtectedRoute from './app/providers/ProtectedRoute';

const App: FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#0d0d0f] text-[#e4e4e4]">
          <Header />

          <main className="w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/figure/:id" element={<FigureDetails />} />
              <Route path="/community" element={<Community />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/collection" element={<Collection />} />
                <Route path="/add" element={<FigureForm mode="add" />} />
                <Route path="/edit/:id" element={<FigureForm mode="edit" />} />
                <Route path="/preorders" element={<PreOrders />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </main>
        </div>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
