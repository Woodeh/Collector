import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  PlusCircle,
  Home,
  Clock,
  Heart,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import faceLogo from '../assets/face.png';

// --- Компонент Тултипа ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333] shadow-2xl text-left backdrop-blur-md">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">
          {payload[0].name}
        </p>
        <p className="text-sm font-black text-blue-500 italic leading-none">
          {payload[0].value} Pcs
        </p>
      </div>
    );
  }
  return null;
};

const Header = () => {
  const [isDashOpen, setIsDashOpen] = useState(false);
  const [collectionStats, setCollectionStats] = useState({ totalValue: 0, count: 0 });
  const [preorderStats, setPreorderStats] = useState({ totalValue: 0, count: 0 });
  const [brandData, setBrandData] = useState([]);

  const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#22c55e', '#eab308', '#ef4444'];

  useEffect(() => {
    const unsubFigures = onSnapshot(collection(db, 'figures'), (snap) => {
      let total = 0;
      const brandsMap = {};
      snap.docs.forEach((doc) => {
        const data = doc.data();
        total += Number(data.price) || 0;
        const brand = data.brand || 'Other';
        brandsMap[brand] = (brandsMap[brand] || 0) + 1;
      });
      const formattedBrands = Object.keys(brandsMap)
        .map((brand) => ({ name: brand, value: brandsMap[brand] }))
        .sort((a, b) => b.value - a.value);
      setBrandData(formattedBrands);
      setCollectionStats({ totalValue: total, count: snap.size });
    });

    const unsubPreorders = onSnapshot(collection(db, 'preorders'), (snap) => {
      let total = 0;
      snap.docs.forEach((doc) => {
        const data = doc.data();
        const priceVal = data.totalPrice || data.price || 0;
        total += Number(priceVal);
      });
      setPreorderStats({ totalValue: total, count: snap.size });
    });

    return () => {
      unsubFigures();
      unsubPreorders();
    };
  }, []);

  return (
    <header className="sticky top-0 z-[100]">
      {/* Навигация */}
      <nav className="bg-[#1a1a1a] border-b border-[#333] p-4 px-8 flex justify-between items-center shadow-xl relative z-20">
        {/* ЛОГОТИП С ИСПРАВЛЕННОЙ АНИМАЦИЕЙ И ОБРЕЗКОЙ */}
        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-xl tracking-tighter group select-none shrink-0"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-[#121212] rounded-full border border-[#333] overflow-hidden group-hover:border-blue-500/50 transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <img
              src={faceLogo}
              alt="Logo"
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
            />
          </div>
          <span className="uppercase text-white tracking-tighter font-black whitespace-nowrap">
            Figure.
            <span className="text-blue-500 group-hover:text-blue-400 transition-colors">
              Collector
            </span>
          </span>
        </Link>

        {/* ССЫЛКИ НАВИГАЦИИ */}
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
            to="/collection"
            className={({ isActive }) =>
              `flex items-center gap-1.5 transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <LayoutGrid size={16} /> <span className="hidden lg:inline">Collection</span>
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
          <NavLink
            to="/add"
            className="text-blue-500 hover:text-blue-400 transition flex items-center gap-1.5 ml-2"
          >
            <PlusCircle size={16} /> <span className="hidden sm:inline">Add New</span>
          </NavLink>

          <button
            onClick={() => setIsDashOpen(!isDashOpen)}
            className={`flex items-center gap-2 p-2 px-3 rounded-xl border transition-all duration-300 ${
              isDashOpen
                ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                : 'border-[#333] text-gray-500 hover:border-gray-600 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} />
            {isDashOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </nav>

      {/* Dashboard Panel */}
      <div
        className={`bg-[#121212]/95 backdrop-blur-xl border-b border-[#333] transition-all duration-500 ease-in-out overflow-hidden ${
          isDashOpen ? 'max-h-[350px] py-8 opacity-100' : 'max-h-0 py-0 opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {/* Секция Финансов */}
          <div className="space-y-4 bg-[#1a1a1a]/50 p-6 rounded-[2rem] border border-[#333] text-left shadow-inner">
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-2">
              Financial Overview
            </h4>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest leading-none">
                  In Collection
                </p>
                <p className="text-2xl font-black text-white italic tracking-tighter mt-1 leading-none">
                  ${collectionStats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-[#333]">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest leading-none">
                  Pre-order Total
                </p>
                <p className="text-2xl font-black text-orange-400 italic tracking-tighter mt-1 leading-none">
                  ${preorderStats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Визуальный график */}
          <div className="h-[220px] relative flex items-center justify-center">
            {brandData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    cornerRadius={10}
                    stroke="none"
                  >
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-700 text-[10px] font-black uppercase tracking-widest italic">
                Inventory empty
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <Package size={22} className="text-gray-700 mb-1" />
              <span className="text-4xl font-black text-white tracking-tighter leading-none">
                {collectionStats.count}
              </span>
              <span className="text-[8px] text-gray-600 uppercase font-black tracking-[0.2em] mt-1">
                Units Total
              </span>
            </div>
          </div>

          {/* Легенда брендов */}
          <div className="bg-[#1a1a1a]/50 p-6 rounded-[2rem] border border-[#333] max-h-[220px] overflow-y-auto text-left scrollbar-hide">
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-4">
              Manufacturers
            </h4>
            <div className="space-y-3">
              {brandData.slice(0, 10).map((entry, index) => (
                <div key={index} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_5px_rgba(0,0,0,0.3)]"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-tight truncate group-hover:text-white transition-colors">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-white font-black italic text-sm ml-2">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
