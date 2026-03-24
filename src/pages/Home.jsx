import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  PlusCircle,
  Clock,
  Loader2,
  DollarSign,
  Heart,
  ChevronRight,
} from 'lucide-react';

const Home = () => {
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [recentFigures, setRecentFigures] = useState([]);
  const [nextPreorder, setNextPreorder] = useState(null);
  const [stats, setStats] = useState({ totalValue: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ЗАГРУЖАЕМ ФОТО ДЛЯ ФОНА
        const allFiguresSnap = await getDocs(collection(db, 'figures'));
        const allImages = allFiguresSnap.docs
          .map((doc) => doc.data().previewImage || doc.data().image)
          .filter(Boolean);
        setBackgroundImages(allImages.sort(() => 0.5 - Math.random()).slice(0, 15));

        // 2. ПОСЛЕДНИЕ 5 ФИГУРОК
        const recentQ = query(collection(db, 'figures'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentFigures(recentSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

        // 3. БЛИЖАЙШИЙ ПРЕДЗАКАЗ (Берем из коллекции preorders)
        const preorderSnap = await getDocs(collection(db, 'preorders'));
        if (!preorderSnap.empty) {
          const preorders = preorderSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          // Сортируем по дате релиза (упрощенно)
          setNextPreorder(preorders[0]);
        }

        // 4. СТАТИСТИКА
        let val = 0;
        allFiguresSnap.docs.forEach((doc) => (val += Number(doc.data().price) || 0));
        setStats({ totalValue: val, count: allFiguresSnap.size });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#121212] text-[#e4e4e4] overflow-hidden font-sans">
      {/* ДИНАМИЧЕСКИЙ ФОН ИЗ ТВОИХ ФОТО */}
      <div className="absolute inset-0 z-0 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 opacity-[0.05] blur-[80px] scale-110 pointer-events-none">
        {backgroundImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className="w-full h-full object-cover animate-pulse"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-[#121212] via-transparent to-[#121212]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-24">
        {/* HERO SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] text-white">
              Your <span className="text-blue-500">Universe</span> <br /> In One Place
            </h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.4em] max-w-xl mx-auto lg:mx-0">
              Track your grail figures, manage pre-orders, and control your collection value.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                to="/add"
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-600/20 flex items-center gap-3"
              >
                <PlusCircle size={20} /> Add New
              </Link>
              <Link
                to="/collection"
                className="bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest transition-all"
              >
                Shelf View
              </Link>
            </div>
          </div>

          {/* QUICK STATS WIDGET */}
          <div className="bg-[#1a1a1a] border border-[#333] p-10 rounded-[3rem] shadow-2xl min-w-[340px] relative overflow-hidden group transition-all hover:border-blue-500/30">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign size={120} className="text-white" />
            </div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-8 italic">
              Financial Overview
            </h4>
            <div className="space-y-8">
              <div>
                <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">
                  Portfolio Value
                </p>
                <p className="text-5xl font-black text-white italic tracking-tighter">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="pt-8 border-t border-[#333] flex justify-between items-end">
                <div>
                  <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-1">
                    Items on hand
                  </p>
                  <p className="text-3xl font-black text-white italic">
                    {stats.count} <span className="text-sm not-italic text-blue-500">PCS</span>
                  </p>
                </div>
                <div className="text-right text-green-500 font-black italic text-xs uppercase">
                  + Active Tracking
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECENTLY ADDED */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-[#333] pb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
              <LayoutGrid className="text-blue-500" /> Recently Added
            </h2>
            <Link
              to="/collection"
              className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              Full Library <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {recentFigures.map((figure) => (
              <Link
                key={figure.id}
                to={`/figure/${figure.id}`}
                className="group bg-[#1a1a1a] rounded-3xl border border-[#333] overflow-hidden hover:border-blue-500/40 transition-all flex flex-col h-full"
              >
                <div className="aspect-[3/4] overflow-hidden bg-[#121212]">
                  <img
                    src={figure.previewImage || figure.image}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt=""
                  />
                </div>
                <div className="p-4 text-left">
                  <p className="text-[8px] text-blue-500 font-black uppercase tracking-widest truncate mb-1 italic">
                    {figure.anime}
                  </p>
                  <h3 className="text-xs font-black text-white uppercase italic truncate group-hover:text-blue-500 transition-colors">
                    {figure.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          {/* Pre-order Widget */}
          {nextPreorder ? (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] border border-[#333] p-8 rounded-[2.5rem] flex items-center gap-8 group hover:border-orange-500/30 transition-all">
              <div className="w-24 h-32 rounded-xl overflow-hidden border border-[#333] shrink-0">
                <img src={nextPreorder.screenshot} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2 text-orange-500 animate-pulse">
                  <Clock size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Incoming Item
                  </span>
                </div>
                <h3 className="text-xl font-black text-white uppercase italic truncate leading-tight">
                  {nextPreorder.name}
                </h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  Release: {nextPreorder.releaseDate}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2.5rem] flex items-center justify-center italic text-gray-600 font-bold uppercase text-[10px] tracking-widest">
              No active pre-orders tracked
            </div>
          )}

          {/* Wishlist Shortcut */}
          <Link
            to="/favorites"
            className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[2.5rem] flex items-center justify-between hover:bg-blue-600/10 transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-blue-500 rounded-2xl text-white shadow-xl shadow-blue-600/20">
                <Heart size={24} fill="currentColor" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                  Your Wishlist
                </h3>
                <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest">
                  Hunt for new grails
                </p>
              </div>
            </div>
            <ChevronRight className="text-blue-500 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
