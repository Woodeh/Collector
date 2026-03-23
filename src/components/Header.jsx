import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  PlusCircle,
  Home,
  Clock,
  Wallet,
  ShoppingBag,
  Package,
  LayoutDashboard,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import faceLogo from '../assets/face.png';

const Header = () => {
  const [stats, setStats] = useState({ totalValue: 0, pending: 0, count: 0 });
  const [isDashOpen, setIsDashOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState(450);

  // --- ЛОГИКА КЕШИРОВАНИЯ КУРСА ---
  useEffect(() => {
    const fetchRate = async () => {
      const cachedData = localStorage.getItem('kzt_rate_data');
      const now = new Date().getTime();
      const dayInMs = 24 * 60 * 60 * 1000; // 24 часа

      if (cachedData) {
        const { rate: savedRate, timestamp } = JSON.parse(cachedData);
        // Если курсу меньше суток — используем его
        if (now - timestamp < dayInMs) {
          setRate(savedRate);
          return;
        }
      }

      // Если кеша нет или он старый — делаем запрос
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=KZT');
        const data = await res.json();
        const newRate = data.rates.KZT;

        setRate(newRate);
        localStorage.setItem(
          'kzt_rate_data',
          JSON.stringify({
            rate: newRate,
            timestamp: now,
          }),
        );
      } catch {
        console.warn('Не удалось обновить курс, используем старый или дефолт');
      }
    };

    fetchRate();
  }, []);

  // Подписка на Firebase (остается без изменений)
  useEffect(() => {
    const unsubCol = onSnapshot(collection(db, 'figures'), (snap) => {
      const colValue = snap.docs.reduce((sum, doc) => sum + (Number(doc.data().price) || 0), 0);
      const colCount = snap.size;

      const unsubPre = onSnapshot(collection(db, 'preorders'), (preSnap) => {
        const preTotalValue = preSnap.docs.reduce(
          (sum, doc) => sum + (Number(doc.data().totalPrice) || 0),
          0,
        );
        const prePaid = preSnap.docs.reduce(
          (sum, doc) => sum + (Number(doc.data().deposit) || 0),
          0,
        );
        const preCount = preSnap.size;

        setStats({
          totalValue: colValue + preTotalValue,
          pending: preTotalValue - prePaid,
          count: colCount + preCount,
        });
      });
      return () => unsubPre();
    });
    return () => unsubCol();
  }, []);

  const formatValue = (val) => {
    const finalVal = currency === 'KZT' ? val * rate : val;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(finalVal);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Навигация */}
      <nav className="bg-[#1a1a1a] border-b border-[#333] p-4 px-8 flex justify-between items-center shadow-xl relative z-20">
        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-xl tracking-tighter group select-none"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-[#121212] rounded-full border border-[#333] group-hover:border-blue-500/30 group-hover:rotate-12 transition-all duration-300 overflow-hidden">
            <img src={faceLogo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="uppercase tracking-tighter text-white">
            Figure <span className="text-blue-500">COLLECTOR</span>
          </span>
        </Link>

        <div className="flex gap-8 text-[11px] font-bold uppercase tracking-widest items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-1.5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`
            }
          >
            <Home size={16} /> Home
          </NavLink>
          <NavLink
            to="/collection"
            className={({ isActive }) =>
              `flex items-center gap-1.5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`
            }
          >
            <LayoutGrid size={16} /> Collection
          </NavLink>
          <NavLink
            to="/preorders"
            className={({ isActive }) =>
              `flex items-center gap-1.5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`
            }
          >
            <Clock size={16} /> Pre-Orders
          </NavLink>

          <button
            onClick={() => setIsDashOpen(!isDashOpen)}
            className={`transition-all flex items-center gap-1.5 p-2 rounded-lg border ${
              isDashOpen
                ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                : 'border-[#333] text-gray-400 hover:border-gray-500'
            }`}
          >
            <LayoutDashboard size={16} />
          </button>

          <NavLink
            to="/add"
            className="text-blue-500 hover:text-blue-400 transition flex items-center gap-1.5 ml-2"
          >
            <PlusCircle size={16} /> Add New
          </NavLink>
        </div>
      </nav>

      {/* DASHBOARD PANEL */}
      <div
        className={`bg-[#121212]/95 backdrop-blur-md border-b border-[#333] px-8 transition-all duration-300 overflow-hidden ${
          isDashOpen ? 'max-h-24 py-3 opacity-100' : 'max-h-0 py-0 opacity-0 border-none'
        }`}
      >
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex gap-12">
            <div className="flex items-center gap-3 cursor-default">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                <Wallet size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                  Total Value
                </span>
                <span className="text-xs font-black text-white">
                  {formatValue(stats.totalValue)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 cursor-default">
              <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
                <ShoppingBag size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                  To Pay
                </span>
                <span className="text-xs font-black text-orange-400">
                  {formatValue(stats.pending)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 cursor-default">
              <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500">
                <Package size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                  Items
                </span>
                <span className="text-xs font-black text-white">{stats.count} Pcs</span>
              </div>
            </div>
          </div>

          {/* CURRENCY TOGGLE */}
          <div className="flex items-center gap-2 border border-[#333] p-1 rounded-xl bg-[#1a1a1a]">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('KZT')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                currency === 'KZT'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              KZT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
