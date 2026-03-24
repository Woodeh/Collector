import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Home, Clock, Heart, User, LogIn, Globe } from 'lucide-react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import faceLogo from '../assets/face.png';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubAuth();
  }, []);

  return (
    <header className="sticky top-0 z-[100]">
      <nav className="bg-[#1a1a1a] border-b border-[#333] p-4 px-8 flex items-center shadow-xl relative z-20 font-bold">
        {/* ЛЕВАЯ ЧАСТЬ: Логотип и Общие ссылки */}
        <div className="flex-1 flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group select-none w-fit">
            <div className="w-10 h-10 rounded-full border border-[#333] overflow-hidden group-hover:border-blue-500/50 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <img
                src={faceLogo}
                alt="Logo"
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
              />
            </div>
            <span className="uppercase text-white tracking-tighter font-black text-xl hidden md:inline transition-colors">
              Figure.<span className="text-blue-500 group-hover:text-blue-400">Collector</span>
            </span>
          </Link>

          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-1.5 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Home size={16} /> <span className="hidden lg:inline">Home</span>
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `flex items-center gap-1.5 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Globe size={16} /> <span className="hidden lg:inline">Catalog</span>
            </NavLink>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Личная коллекция и Профиль */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Личные разделы коллекции */}
              <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest items-center border-r border-[#333] pr-6">
                <NavLink
                  to="/collection"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 transition-colors ${
                      isActive ? 'text-blue-500' : 'text-gray-400 hover:text-white'
                    }`
                  }
                >
                  <LayoutGrid size={16} /> <span className="hidden lg:inline">My collection</span>
                </NavLink>
                <NavLink
                  to="/preorders"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 transition-colors ${
                      isActive ? 'text-orange-500' : 'text-gray-400 hover:text-white'
                    }`
                  }
                >
                  <Clock size={16} /> <span className="hidden lg:inline">Pre-Orders</span>
                </NavLink>
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 transition-colors ${
                      isActive ? 'text-pink-500' : 'text-gray-400 hover:text-white'
                    }`
                  }
                >
                  <Heart size={16} /> <span className="hidden lg:inline">Wishlist</span>
                </NavLink>
              </div>

              {/* Блок профиля */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block leading-none">
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
            <Link
              to="/login"
              className="flex items-center gap-2 p-2 px-5 rounded-2xl bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 shadow-lg active:scale-95 cursor-pointer"
            >
              <LogIn size={16} /> <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
