import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  ExternalLink,
  ShieldCheck,
  User,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Fingerprint,
} from 'lucide-react';

// Импортируем твою карточку
import FigureCard from '../components/collection/FigureCard';

const FigureDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [figure, setFigure] = useState(null);
  const [characterData, setCharacterData] = useState(null);
  const [relatedFigures, setRelatedFigures] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchFigureAndArt = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'figures', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFigure(data);

          // РАНДОМНЫЙ ONE PIECE
          const q = query(collection(db, 'figures'), where('anime', '==', 'One Piece'), limit(25));

          const relatedSnap = await getDocs(q);
          let allRelated = relatedSnap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((item) => item.id !== id);

          for (let i = allRelated.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allRelated[i], allRelated[j]] = [allRelated[j], allRelated[i]];
          }

          setRelatedFigures(allRelated.slice(0, 4));

          if (data.name) {
            const res = await fetch(`https://api.jikan.moe/v4/characters?q=${data.name}&limit=1`);
            const resData = await res.json();
            if (resData.data && resData.data.length > 0) {
              setCharacterData({
                image: resData.data[0].images.jpg.image_url,
                name: resData.data[0].name,
              });
            }
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFigureAndArt();
  }, [id]);

  const images = useMemo(() => {
    if (!figure) return [];
    return figure.images?.length > 0 ? figure.images : [figure.previewImage || figure.image];
  }, [figure]);

  useEffect(() => {
    if (images.length > 1 && !isHovered) {
      timerRef.current = setInterval(() => {
        setActiveImg((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [images, isHovered]);

  const handleManualSelect = (idx) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveImg(idx);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setActiveImg((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  if (!figure) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4] font-sans selection:bg-blue-500/30 overflow-x-hidden text-left">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-white mb-8 group font-black uppercase text-[10px] tracking-[0.2em] italic transition-all"
        >
          <ArrowLeft size={16} /> Back to Vault
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* LEFT COLUMN: SLIDER (УМЕНЬШЕННЫЙ) */}
          <div className="flex flex-col items-center lg:items-end w-full">
            <div
              className="relative w-full max-w-md aspect-[4/5] z-10"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`glow-${activeImg}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-[-20px] z-0 blur-[60px] rounded-full opacity-50 pointer-events-none"
                  style={{
                    background: `url(${images[activeImg]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </AnimatePresence>

              <div className="relative w-full h-full bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] overflow-hidden shadow-2xl z-10 group/slider">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={images[activeImg]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="w-full h-full object-cover"
                    alt="Display"
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 border border-white/5 hover:bg-blue-600 transition-all opacity-0 group-hover/slider:opacity-100 z-20"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 border border-white/5 hover:bg-blue-600 transition-all opacity-0 group-hover/slider:opacity-100 z-20"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-8">
            <div className="relative bg-[#1a1a1a] border border-[#333] rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:border-blue-500/30 text-left">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
                  <div className="space-y-0.5 text-left">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic leading-none">
                      Security Protocol: Active
                    </p>
                    <h2 className="text-sm font-black text-white uppercase italic tracking-tighter leading-none">
                      Collector ID Card
                    </h2>
                  </div>
                  <Cpu size={24} className="text-blue-500/30" />
                </div>

                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-32 h-44 rounded-xl bg-[#121212] border border-[#333] overflow-hidden relative shadow-inner flex flex-col">
                      <div className="flex-1 overflow-hidden">
                        <img
                          src={characterData?.image || images[0]}
                          className="w-full h-full object-cover contrast-125 transition-all"
                          alt="id"
                        />
                      </div>
                      <div className="bg-blue-600 py-2 px-2 border-t border-blue-400/50 text-center">
                        <p className="text-[9px] font-black text-white uppercase italic truncate">
                          {characterData?.name || figure.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center opacity-20 mt-3">
                      <Fingerprint size={20} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 text-left">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                        Designation
                      </p>
                      <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter border-l-4 border-blue-500 pl-4">
                        {figure.fullDisplayName || figure.name}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                          Origin
                        </p>
                        <p className="text-[13px] font-black text-blue-500 uppercase italic truncate">
                          {figure.anime}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                          Market Value
                        </p>
                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none">
                          <span className="text-blue-500 mr-0.5">$</span>
                          {Number(figure.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                          Condition
                        </p>
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-blue-500" />
                          <p className="text-[12px] font-black text-white uppercase italic">
                            {figure.conditionGrade}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                          Packaging
                        </p>
                        <p
                          className={`text-[12px] font-black uppercase italic ${
                            figure.hasBox === 'Yes' ? 'text-white' : 'text-red-500'
                          }`}
                        >
                          {figure.hasBox === 'Yes' ? 'Box: Intact' : 'Loose / No Box'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* МИНИАТЮРЫ */}
            <div className="flex flex-wrap gap-4 justify-start">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleManualSelect(idx)}
                  className={`w-20 aspect-[4/5] rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                    activeImg === idx
                      ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105'
                      : 'border-[#333] opacity-40 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumb" />
                </button>
              ))}
            </div>

            {/* EXTERNAL LINK */}
            {figure.auctionUrl && (
              <a
                href={figure.auctionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between bg-white text-black p-6 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <ExternalLink size={20} />
                  <span className="font-black uppercase tracking-[0.2em] text-[11px] italic leading-none text-left">
                    Launch System Link
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

        {/* RELATED FIGURES SECTION */}
        {relatedFigures.length > 0 && (
          <div className="mt-24 border-t border-[#333] pt-12 pb-20 text-left">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic leading-none">
                  Database Scan
                </p>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                  More from One Piece
                </h2>
              </div>
              <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent ml-10"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedFigures.map((relFigure) => (
                <FigureCard
                  key={relFigure.id}
                  figure={relFigure}
                  // Не передаем onEdit и onDelete, чтобы скрыть кнопки
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FigureDetailsPage;
