import React, { FC, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from './shared/Header';
import ScrollToTop from './app/providers/ScrollToTop';
import Footer from './shared/Footer';
import { AuthProvider } from './app/providers/AuthProvider';
import ProtectedRoute from './app/providers/ProtectedRoute';
import { I18nProvider } from './app/i18n/I18nProvider';

const Home = lazy(() => import('./pages/HomePage'));
const Login = lazy(() => import('./pages/LoginPage'));
const Collection = lazy(() => import('./pages/CollectionPage'));
const FigureDetails = lazy(() => import('./pages/FigureDetailsPage'));
const PreOrders = lazy(() => import('./pages/PreOrdersPage'));
const Wishlist = lazy(() => import('./pages/WishlistPage'));
const FigureForm = lazy(() => import('./features/figure-form/FigureForm'));
const Profile = lazy(() => import('./pages/ProfilePage'));
const Community = lazy(() => import('./pages/CommunityPage'));

const RouteFallback: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-[#121212]">
    <Loader2 className="animate-spin text-blue-500" size={40} aria-label="Loading page" />
  </div>
);

const App: FC = () => {
  return (
    <Router>
      <I18nProvider>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#0d0d0f] text-[#e4e4e4]">
          <Header />

          <main className="w-full">
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </main>
        </div>
        <Footer />
      </AuthProvider>
      </I18nProvider>
    </Router>
  );
};

export default App;
