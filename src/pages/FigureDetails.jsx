import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Tag,
  Loader2,
  Box,
  ShoppingCart,
  ExternalLink,
  ShieldCheck,
  User,
  Info,
} from 'lucide-react';

const FigureDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [figure, setFigure] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const getFigure = async () => {
      try {
        const docRef = doc(db, 'figures', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFigure(docSnap.data());
        }
      } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
      } finally {
        setLoading(false);
      }
    };
    getFigure();
  }, [id]);

  useEffect(() => {
    if (figure && !isPaused) {
      const images =
        figure.images?.length > 0 ? figure.images : [figure.previewImage || figure.image];
      if (images.length > 1) {
        timerRef.current = setInterval(() => {
          setActiveImg((prev) => (prev + 1) % images.length);
        }, 5000);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [figure, isPaused]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  if (!figure)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-4 text-center">
        <p className="mb-4 text-gray-500 italic text-lg">Фигурка не найдена...</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
        >
          Вернуться в коллекцию
        </button>
      </div>
    );

  const images = figure.images?.length > 0 ? figure.images : [figure.previewImage || figure.image];
  const displayAuthor = figure.authorName ? figure.authorName.split('@')[0] : 'Неизвестно';

  const nextSlide = () => {
    setIsPaused(true);
    setActiveImg((prev) => (prev + 1) % images.length);
  };
  const prevSlide = () => {
    setIsPaused(true);
    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4]">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase text-xs tracking-widest">Назад к коллекции</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* СЛАЙДЕР */}
          <div className="space-y-6">
            <div
              className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-[#333] shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    idx === activeImg ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                  alt={figure.name}
                />
              ))}

              {images.length > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between px-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={prevSlide}
                      className="bg-black/40 backdrop-blur-xl p-4 rounded-full hover:bg-blue-600 text-white transition-all active:scale-90"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="bg-black/40 backdrop-blur-xl p-4 rounded-full hover:bg-blue-600 text-white transition-all active:scale-90"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ТАМБНЕЙЛЫ */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImg(idx);
                      setIsPaused(true);
                    }}
                    className={`h-20 w-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      activeImg === idx
                        ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20'
                        : 'border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumb" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ИНФО-БЛОК */}
          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] italic">
                <Tag size={12} /> {figure.anime}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter italic uppercase">
                {figure.name}
              </h1>
            </div>

            {/* ХАРАКТЕРИСТИКИ (3 КОЛОНКИ) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333]">
                <p className="text-gray-500 text-[9px] uppercase mb-2 font-black tracking-widest leading-none">
                  Price
                </p>
                <p className="text-4xl font-black text-white leading-none">
                  {figure.price}
                  <span className="text-blue-500 ml-1">$</span>
                </p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333]">
                <p className="text-gray-500 text-[9px] uppercase mb-2 font-black tracking-widest leading-none">
                  Gender
                </p>
                <p className="text-xl font-black text-white uppercase">{figure.gender}</p>
              </div>

              {/* НОВОЕ ПОЛЕ: BRAND */}
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333]">
                <p className="text-gray-500 text-[9px] uppercase mb-2 font-black tracking-widest leading-none">
                  Brand
                </p>
                <p
                  className="text-xl font-black text-white uppercase truncate"
                  title={figure.brand}
                >
                  {figure.brand || 'Original'}
                </p>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] col-span-2 md:col-span-3">
                <p className="text-gray-500 text-[9px] uppercase mb-2 font-black tracking-widest leading-none">
                  Box Integrity
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      figure.hasBox === 'Yes'
                        ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                        : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                    }`}
                  />
                  <p className="text-lg font-black uppercase tracking-tight">
                    {figure.hasBox === 'Yes' ? 'Original Box Included' : 'No Box / Loose'}
                  </p>
                </div>
              </div>
            </div>

            {/* ДОПОЛНИТЕЛЬНО */}
            <div className="space-y-4">
              {figure.conditionGrade && (
                <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-[#333] flex gap-5 items-start">
                  <div className="bg-blue-500/10 p-4 rounded-3xl text-blue-500">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] uppercase font-black mb-1 tracking-widest">
                      Condition Grade
                    </p>
                    <p className="text-white text-xl font-black uppercase tracking-tight">
                      {figure.conditionGrade}
                    </p>
                    {figure.conditionNotes && (
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed border-l-2 border-[#333] pl-4">
                        {figure.conditionNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] flex items-center gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500">
                    <ShoppingCart size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-0.5">
                      Source
                    </p>
                    <p className="text-white font-black uppercase text-sm truncate">
                      {figure.purchasePlace || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] flex items-center gap-4">
                  <div className="bg-green-500/10 p-3 rounded-2xl text-green-500">
                    <User size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest mb-0.5">
                      Collector
                    </p>
                    <p className="text-white font-black uppercase text-sm truncate">
                      {displayAuthor}
                    </p>
                  </div>
                </div>
              </div>

              {figure.auctionUrl && (
                <a
                  href={figure.auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex items-center justify-between bg-white text-black p-6 rounded-[2.5rem] transition-all hover:bg-blue-600 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={20} />
                    <span className="font-black uppercase tracking-widest text-sm">
                      Product Reference
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigureDetails;
