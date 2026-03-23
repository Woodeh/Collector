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
  Calendar,
  Box,
  ShoppingCart,
  ExternalLink,
  ShieldCheck,
  User,
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
          <span className="font-medium">Назад к коллекции</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ОБНОВЛЕННЫЙ СЛАЙДЕР */}
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
                  alt={`${figure.name} - ${idx + 1}`}
                />
              ))}

              {images.length > 1 && (
                <>
                  <div className="absolute inset-0 flex items-center justify-between px-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={prevSlide}
                      className="bg-black/40 backdrop-blur-xl p-4 rounded-full hover:bg-blue-600 text-white shadow-2xl transition-all active:scale-90"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="bg-black/40 backdrop-blur-xl p-4 rounded-full hover:bg-blue-600 text-white shadow-2xl transition-all active:scale-90"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 transition-all duration-500 rounded-full ${
                          idx === activeImg ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImg(idx);
                      setIsPaused(true);
                    }}
                    className={`h-20 w-16 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                      activeImg === idx
                        ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20'
                        : 'border-transparent opacity-30 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumb" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-3">
                <Tag size={14} /> {figure.anime}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter italic uppercase">
                {figure.name}
              </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333]">
                <p className="text-gray-500 text-[10px] uppercase mb-1 font-bold tracking-widest leading-none">
                  Price
                </p>
                <p className="text-4xl font-black text-white">
                  {figure.price}
                  <span className="text-blue-500 ml-1">$</span>
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333]">
                <p className="text-gray-500 text-[10px] uppercase mb-1 font-bold tracking-widest leading-none">
                  Gender
                </p>
                <p className="text-2xl font-black text-white">
                  {figure.gender === 'Male' ? 'MALE' : 'FEMALE'}
                </p>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] col-span-2 md:col-span-1 flex flex-col justify-center">
                <p className="text-gray-500 text-[10px] uppercase mb-2 font-bold tracking-widest leading-none">
                  Box
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      figure.hasBox === 'Yes' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <p className="text-xl font-bold uppercase">
                    {figure.hasBox === 'Yes' ? 'Original' : 'No Box'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {figure.conditionGrade && (
                <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] flex gap-5">
                  <div className="bg-blue-500/10 p-4 rounded-3xl h-fit text-blue-500 flex-shrink-0">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1 tracking-widest">
                      Condition Grade
                    </p>
                    <p className="text-white text-xl font-bold uppercase tracking-tight truncate">
                      {figure.conditionGrade}
                    </p>
                    {figure.conditionNotes && (
                      <p className="text-gray-400 text-sm mt-2 italic leading-relaxed">
                        "{figure.conditionNotes}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {figure.purchasePlace && (
                  <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] flex items-center gap-4 min-w-0 shadow-inner">
                    <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500 flex-shrink-0">
                      <ShoppingCart size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                        Source
                      </p>
                      <p className="text-white font-bold truncate uppercase">
                        {figure.purchasePlace}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] flex items-center gap-4 min-w-0 shadow-inner">
                  <div className="bg-green-500/10 p-3 rounded-2xl text-green-500 flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">
                      Added by
                    </p>
                    <p
                      className="text-white font-bold truncate text-lg uppercase tracking-tight"
                      title={displayAuthor}
                    >
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
                  className="group w-full flex items-center justify-between bg-white text-black p-6 rounded-[2rem] transition-all hover:bg-blue-600 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={20} />
                    <span className="font-black uppercase tracking-widest text-sm">
                      View Listing
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
