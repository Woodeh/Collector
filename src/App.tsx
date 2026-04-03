import React, { FC, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Home as HomeIcon, Package, Heart, User, PlusCircle } from 'lucide-react';

// Компоненты
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

const BottomNav: FC = () => {
  const { pathname } = useLocation();
  const navItems = [
    { path: '/', icon: <HomeIcon size={20} />, label: 'Home' },
    { path: '/collection', icon: <Package size={20} />, label: 'Collection' },
    { path: '/add', icon: <PlusCircle size={24} className="text-blue-500" />, label: 'Add Figure' },
    { path: '/wishlist', icon: <Heart size={20} />, label: 'Wishlist' },
    { path: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#141416]/95 backdrop-blur-md border-t border-[#232326] flex justify-around items-center py-2 px-1 z-50 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`flex flex-col items-center gap-1 transition-colors ${pathname === item.path ? 'text-blue-500' : 'text-[#848484]'}`}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const App: FC = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверка: запущено ли как PWA
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
                               || (window.navigator as any).standalone 
                               || document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();
    // Слушаем изменения (если вдруг режим изменится без перезагрузки)
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
  }, []);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) { console.log('SW Registered'); },
    onRegisterError(error) { console.error('SW registration error', error); },
  });

  return (
    <Router>
      <ScrollToTop />
      
      <div className="min-h-screen flex flex-col bg-[#0d0d0f] text-[#e4e4e4] selection:bg-blue-500/30">
        
        {/* Показывать Header ТОЛЬКО если это НЕ приложение (т.е. браузер) */}
        {!isStandalone && <Header />}

        {/* Контентная область */}
        <main className={`w-full flex-grow px-4 md:px-0 transition-all ${
          isStandalone 
            ? 'pt-[env(safe-area-inset-top)] pb-24' // В приложении отступ под челку и под BottomNav
            : 'pt-16 pb-8' // В браузере отступ под Header
        }`}>
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

        {/* Футер только для десктопа в браузере */}
        {!isStandalone && (
          <div className="hidden md:block">
            <Footer />
          </div>
        )}

        {/* Нижнее меню ТОЛЬКО в режиме приложения */}
        {isStandalone && <BottomNav />}
      </div>
    </Router>
  );
};

export default App;