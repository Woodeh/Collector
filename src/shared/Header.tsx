import React, { useState, useEffect, useRef, FC, ChangeEvent, ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Home,
  Clock,
  Heart,
  User as UserIcon,
  LogIn,
  Globe,
  Menu,
  X,
  LogOut,
  Settings,
  Scan,
  Loader2,
} from 'lucide-react';
import { auth, storage } from '../firebase/config';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// @ts-ignore
import faceLogo from '../assets/face.png';


const Header: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      html.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      html.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const storageRef = ref(storage, `temp_scans/${Date.now()}_scan.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(downloadURL)}`;
      window.open(lensUrl, '_blank');

      setTimeout(async () => {
        try {
          await deleteObject(storageRef);
          console.log('Cleanup: Temporary scan removed');
        } catch (cleanupError) {
          console.warn('Cleanup failed:', cleanupError);
        }
      }, 600000); 
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-[100] font-sans selection:bg-blue-500/30">
      <nav className="bg-[#1a1a1a]/80 backdrop-blur-md border-b border-[#333] p-4 px-6 md:px-8 flex items-center justify-between shadow-xl relative z-20">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* LEFT: Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3 group select-none shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full border border-[#333] overflow-hidden group-hover:border-blue-500/50 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <img
              src={faceLogo}
              alt="Logo"
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <span className="uppercase text-white tracking-tighter font-black text-xl italic leading-none">
            Figure.<span className="text-blue-500">Collector</span>
          </span>
        </Link>

        {/* CENTER: Navigation (Desktop) */}
        <div className="hidden lg:flex flex-1 ml-12 gap-8 text-xs font-black uppercase tracking-[0.2em] italic items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 transition-colors cursor-pointer ${
                isActive ? 'text-blue-500' : 'text-gray-500 hover:text-white'
              }`
            }
          >
            <Home size={16} /> <span>Home</span>
          </NavLink>
          <NavLink
            to="/community"
            className={({ isActive }) =>
              `flex items-center gap-2 transition-colors cursor-pointer ${
                isActive ? 'text-blue-500' : 'text-gray-500 hover:text-white'
              }`
            }
          >
            <Globe size={16} /> <span>Catalog</span>
          </NavLink>

          {user && (
            <button
              onClick={handleScanClick}
              disabled={isScanning}
              className={`flex items-center gap-2 transition-colors cursor-pointer text-xs font-black uppercase tracking-[0.2em] italic ${
                isScanning ? 'text-blue-500' : 'text-gray-500 hover:text-white'
              }`}
            >
              {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
              <span>Scan</span>
            </button>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden lg:flex gap-8 text-xs font-black uppercase tracking-[0.2em] italic items-center border-r border-[#333] pr-8 mr-4">
                <NavLink
                  to="/collection"
                  className={({ isActive }) =>
                    `flex items-center gap-2 transition-colors cursor-pointer ${
                      isActive ? 'text-blue-500' : 'text-gray-500 hover:text-white'
                    }`
                  }
                >
                  <LayoutGrid size={16} /> <span>My collection </span>
                </NavLink>
                <NavLink
                  to="/preorders"
                  className={({ isActive }) =>
                    `flex items-center gap-2 transition-colors cursor-pointer ${
                      isActive ? 'text-orange-500' : 'text-gray-500 hover:text-white'
                    }`
                  }
                >
                  <Clock size={16} /> <span>Pre-Orders</span>
                </NavLink>
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    `flex items-center gap-2 transition-colors cursor-pointer ${
                      isActive ? 'text-pink-500' : 'text-gray-500 hover:text-white'
                    }`
                  }
                >
                  <Heart size={16} /> <span>Wishlist</span>
                </NavLink>
              </div>

              <div className="hidden lg:flex items-center gap-4 relative" ref={profileRef}>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.2em] italic leading-none mb-1">
                    Identity
                  </p>
                  <p className="text-white text-xs font-black uppercase italic leading-none truncate max-w-[100px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`w-11 h-11 rounded-2xl bg-[#121212] border overflow-hidden flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
                      isProfileOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-[#333] hover:border-blue-500'
                    }`}
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={20} className="text-blue-500" />
                    )}
                  </button>
                </div>

                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-8 w-64 bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#333] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ease-out origin-top-right">
                    <div className="p-6 border-b border-[#333] bg-[#121212]/50 text-left">
                      <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em] italic mb-1">
                        Collector Identity
                      </p>
                      <p className="text-white font-black italic uppercase text-sm truncate">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group text-left cursor-pointer"
                      >
                        <Settings size={18} className="group-hover:text-blue-500" />
                        <span className="text-[11px] font-black uppercase italic tracking-widest">
                          Profile
                        </span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all group text-left cursor-pointer"
                      >
                        <LogOut size={18} />
                        <span className="text-[11px] font-black uppercase italic tracking-widest">
                          Log Out
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden lg:block">
              <Link
                to="/login"
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-blue-600 text-white font-black uppercase italic text-[11px] tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn size={16} /> <span>Access System</span>
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 text-blue-500 bg-[#121212] border border-[#333] rounded-2xl hover:bg-blue-600/10 transition-all active:scale-90 cursor-pointer"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE DROPDOWN MENU */}
      <div
        className={`lg:hidden fixed inset-0 top-[77px] bg-[#121212]/95 backdrop-blur-2xl transition-all duration-500 z-10 overflow-y-auto overscroll-contain ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        <div className="flex flex-col p-6 gap-2">
          {user && (
            <div className="flex items-center gap-5 p-5 mb-4 bg-[#1a1a1a] border border-[#333] rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.email?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <div className="text-left">
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">
                  Account
                </p>
                <p className="text-white font-black italic uppercase text-lg tracking-tighter">
                  {user.displayName || user.email?.split('@')[0]}
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

            {user ? (
              <>
                <button
                  onClick={() => {
                    closeMenu();
                    handleScanClick();
                  }}
                  disabled={isScanning}
                  className={`flex items-center gap-5 p-5 rounded-2xl transition-all border mb-2 cursor-pointer ${
                    isScanning
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      : 'text-gray-500 border-transparent hover:bg-[#1a1a1a] active:scale-95'
                  }`}
                >
                  <div className="shrink-0">
                    {isScanning ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Scan size={20} />
                    )}
                  </div>
                  <span className="font-bold uppercase tracking-wide text-sm">
                    {isScanning ? 'Processing...' : 'Scan'}
                  </span>
                </button>

                <MobileNavLink
                  to="/collection"
                  icon={<LayoutGrid size={20} />}
                  label="My Collection"
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
                <MobileNavLink
                  to="/profile"
                  icon={<UserIcon size={20} />}
                  label="Profile Settings"
                  activeColor="text-blue-500"
                  onClick={closeMenu}
                />
                <div className="h-px bg-[#333] my-4 mx-4 opacity-50" />
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
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-5 rounded-2xl text-red-500 font-bold uppercase tracking-widest text-xs mt-4 bg-red-500/5 border border-red-500/10 cursor-pointer"
                >
                  <LogOut size={20} /> Log Out
                </button>
              </>
            ) : (
              <>
                <MobileNavLink
                  to="/community"
                  icon={<Globe size={20} />}
                  label="Catalog"
                  activeColor="text-blue-500"
                  onClick={closeMenu}
                />
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600 text-white font-bold uppercase tracking-widest text-sm mt-4 shadow-xl shadow-blue-600/20 cursor-pointer"
                >
                  <LogIn size={20} /> Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

interface MobileNavLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  activeColor: string;
  onClick: () => void;
}

const MobileNavLink: FC<MobileNavLinkProps> = ({ to, icon, label, activeColor, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-5 p-5 rounded-2xl transition-all border cursor-pointer
      ${
        isActive
          ? `bg-[#1a1a1a] border-[#333] ${activeColor}`
          : 'text-gray-500 border-transparent hover:bg-[#1a1a1a]'
      }`
    }
  >
    <div className="shrink-0">{icon}</div>
    <span className="font-bold uppercase tracking-wide text-sm">{label}</span>
  </NavLink>
);

export default Header;