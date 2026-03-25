import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Home, Clock, Heart, User, LogIn, Globe, Menu, X } from 'lucide-react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import faceLogo from '../assets/face.png';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubAuth();
  }, []);

  // Закрываем меню при смене страницы
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-[100]">
      <nav className="bg-[#1a1a1a] border-b border-[#333] p-4 px-6 md:px-8 flex items-center justify-between shadow-xl relative z-20 font-bold">
        {/* ЛЕВАЯ ЧАСТЬ: Логотип */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3 group select-none w-fit"
        >
          <div className="w-10 h-10 rounded-full border border-[#333] overflow-hidden group-hover:border-blue-500/50 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <img
              src={faceLogo}
              alt="Logo"
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
            />
          </div>
          <span className="uppercase text-white tracking-tighter font-black text-xl transition-colors">
            Figure.<span className="text-blue-500 group-hover:text-blue-400">Collector</span>
          </span>
        </Link>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Десктопные ссылки */}
        <div className="hidden lg:flex flex-1 ml-10 gap-6 text-[11px] font-bold uppercase tracking-widest items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-1.5 transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Home size={16} /> <span>Home</span>
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) =>
              `flex items-center gap-1.5 transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Globe size={16} /> <span>Catalog</span>
          </NavLink>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Десктопные личные разделы или кнопка меню */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Скрываем личные ссылки на мобилках */}
              <div className="hidden lg:flex gap-6 text-[11px] font-bold uppercase tracking-widest items-center border-r border-[#333] pr-6">
                <NavLink
                  to="/collection"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 transition-colors ${
                      isActive ? 'text-blue-500' : 'text-gray-400 hover:text-white'
                    }`
                  }
                >
                  <LayoutGrid size={16} /> <span>My collection</span>
                </NavLink>
                <NavLink
                  to="/preorders"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 transition-colors ${
                      isActive ? 'text-orange-500' : 'text-gray-400 hover:text-white'
                    }`
                  }
                >
                  <Clock size={16} /> <span>Pre-Orders</span>
                </NavLink>
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 transition-colors ${
                      isActive ? 'text-pink-500' : 'text-gray-400 hover:text-white'
                    }`
                  }
                >
                  <Heart size={16} /> <span>Wishlist</span>
                </NavLink>
              </div>

              {/* Профиль (только на десктопе) */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right leading-none">
                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">
                    Collector
                  </p>
                  <p className="text-white font-black italic text-[13px] uppercase tracking-tighter">
                    {user.displayName || user.email.split('@')[0]}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-11 h-11 rounded-2xl bg-[#121212] border border-[#333] flex items-center justify-center text-blue-500 hover:border-blue-500 hover:bg-blue-500 transition-all hover:text-white shadow-lg active:scale-95 cursor-pointer"
                >
                  <User size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="hidden lg:block">
              <Link
                to="/login"
                className="flex items-center gap-2 p-2 px-5 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 shadow-lg active:scale-95"
              >
                <LogIn size={16} /> <span>Login</span>
              </Link>
            </div>
          )}

          {/* МОБИЛЬНАЯ КНОПКА МЕНЮ */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-blue-500 bg-[#121212] border border-[#333] rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-90"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* МОБИЛЬНОЕ ВЫПАДАЮЩЕЕ МЕНЮ */}
      <div
        className={`
        lg:hidden fixed inset-0 top-[73px] bg-[#121212]/95 backdrop-blur-xl transition-all duration-300 z-10
        ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none translate-x-full'
        }
      `}
      >
        <div className="flex flex-col p-6 gap-4">
          {user && (
            <div className="flex items-center gap-4 p-4 mb-4 bg-[#1a1a1a] border border-[#333] rounded-[2rem]">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-xl italic">
                {user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest">
                  Logged as
                </p>
                <p className="text-white font-black italic uppercase">
                  {user.displayName || user.email.split('@')[0]}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <MobileNavLink
              to="/"
              icon={<Home size={20} />}
              label="Home"
              activeColor="text-blue-500"
              onClick={closeMenu}
            />
            <MobileNavLink
              to="/community"
              icon={<Globe size={20} />}
              label="Catalog"
              activeColor="text-blue-500"
              onClick={closeMenu}
            />

            {user ? (
              <>
                <div className="h-px bg-[#333] my-2" />
                <MobileNavLink
                  to="/collection"
                  icon={<LayoutGrid size={20} />}
                  label="My Collection"
                  activeColor="text-blue-500"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  to="/preorders"
                  icon={<Clock size={20} />}
                  label="Pre-Orders"
                  activeColor="text-orange-500"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  to="/wishlist"
                  icon={<Heart size={20} />}
                  label="Wishlist"
                  activeColor="text-pink-500"
                  onClick={closeMenu}
                />
                <MobileNavLink
                  to="/profile"
                  icon={<User size={20} />}
                  label="Profile Settings"
                  activeColor="text-blue-500"
                  onClick={closeMenu}
                />
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-blue-600 text-white font-black uppercase text-sm tracking-widest"
              >
                <LogIn size={20} /> <span>Login to System</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const MobileNavLink = ({ to, icon, label, activeColor, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-4 p-5 rounded-[1.5rem] transition-all border border-transparent
      ${
        isActive ? `bg-[#1a1a1a] border-[#333] ${activeColor}` : 'text-gray-400 hover:bg-[#1a1a1a]'
      }`
    }
  >
    {icon}
    <span className="font-black uppercase italic tracking-wider text-sm">{label}</span>
  </NavLink>
);

export default Header;
