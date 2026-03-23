import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutGrid, PlusCircle, Home, Database, Clock } from 'lucide-react';

const Header = () => {
  const linkClass = ({ isActive }) =>
    `hover:text-blue-400 transition flex items-center gap-1.5 ${isActive ? 'text-blue-500' : ''}`;

  const preOrderLinkClass = ({ isActive }) =>
    `hover:text-orange-400 transition flex items-center gap-1.5 ${
      isActive ? 'text-orange-500' : ''
    }`;

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#333] p-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter group">
        <Database className="text-blue-500 group-hover:rotate-12 transition-transform" />
        <span className="uppercase tracking-tighter">
          Figure <span className="text-blue-500">COLLECTOR</span>
        </span>
      </Link>

      <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest">
        <NavLink to="/" className={linkClass}>
          <Home size={16} /> Home
        </NavLink>

        <NavLink to="/collection" className={linkClass}>
          <LayoutGrid size={16} /> Collection
        </NavLink>

        <NavLink to="/preorders" className={preOrderLinkClass}>
          <Clock size={16} /> Pre-Orders
        </NavLink>

        <NavLink
          to="/add"
          className="text-blue-500 hover:text-blue-400 transition flex items-center gap-1.5"
        >
          <PlusCircle size={16} /> Add New
        </NavLink>
      </div>
    </nav>
  );
};

export default Header;
