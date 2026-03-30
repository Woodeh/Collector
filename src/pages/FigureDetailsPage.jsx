import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, storage } from '../firebase/config';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  deleteDoc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Cpu,
  SearchCode,
  Fingerprint,
  Share2,
  Trash2,
  Pencil,
} from 'lucide-react';

import FigureCard from '../components/collection/FigureCard';
import Modal from '../components/Modal';
import ShareModal from '../components/modals/ShareModal';

const FigureDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [figure, setFigure] = useState(null);
  const [characterData, setCharacterData] = useState(null);
  const [relatedFigures, setRelatedFigures] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const timerRef = useRef(null);

  // Анимационные варианты для слайда
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : direction > 0 ? '-100%' : 0,
      opacity: 0,
    }),
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchFigureAndArt = async () => {
      setLoading(true);
      setImageError(false); // Сброс ошибки при смене ID
      try {
        const docSnap = await getDoc(doc(db, 'figures', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFigure(data);

          // --- ЛОГИКА РЕКОМЕНДАЦИЙ (С FALLBACK) ---
          let finalRelated = [];
          if (data.anime) {
            const sameAnimeQuery = query(
              collection(db, 'figures'),
              where('anime', '==', data.anime),
              limit(10),
            );
            const sameAnimeSnap = await getDocs(sameAnimeQuery);
            finalRelated = sameAnimeSnap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((item) => item.id !== id);
          }

          if (finalRelated.length < 4) {
            const randomQuery = query(collection(db, 'figures'), limit(20));
            const randomSnap = await getDocs(randomQuery);
            const randomFigures = randomSnap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((item) => item.id !== id && !finalRelated.some((r) => r.id === item.id));

            const shuffledRandom = randomFigures.sort(() => 0.5 - Math.random());
            finalRelated = [...finalRelated, ...shuffledRandom].slice(0, 4);
          } else {
            finalRelated = finalRelated.sort(() => 0.5 - Math.random()).slice(0, 4);
          }

          setRelatedFigures(finalRelated);

          // Если изображение персонажа уже есть в базе (кэшировано), используем его
          if (data.characterImage) {
            setCharacterData({
              image: data.characterImage,
              name: data.name,
            });
          }
          // Если изображения нет (старые записи), пробуем подтянуть через API
          else if (data.characterId || data.name) {
            try {
              const endpoint = data.characterId
                ? `https://api.jikan.moe/v4/characters/${data.characterId}`
                : `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(data.name)}&limit=1`;

              const res = await fetch(endpoint);
              const resData = await res.json();
              const char = data.characterId ? resData.data : resData.data?.[0];
              if (char) {
                setCharacterData({
                  image: char.images.jpg.image_url,
                  name: char.name,
                });
              }
            } catch (e) {
              console.error('API Fetch error', e);
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
        setDirection(1);
        setActiveImg((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [images, isHovered, images.length]);

  const handleManualSelect = (idx) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (idx !== activeImg) {
      setDirection(idx > activeImg ? 1 : -1);
      setActiveImg(idx);
    }
  };

  const nextSlide = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDirection(1);
    setActiveImg((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDirection(-1);
    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMarketScan = () => {
    const currentImgUrl = images[activeImg];
    // Используем Google Lens, так как он лучше всего находит товары на eBay и в китайских магазинах
    const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(currentImgUrl)}`;
    window.open(lensUrl, '_blank');
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      // 1. Удаляем документ из базы
      await deleteDoc(doc(db, 'figures', id));

      // 2. Удаляем изображения из хранилища
      const imageUrls = figure.images || (figure.previewImage ? [figure.previewImage] : []);
      for (const url of imageUrls) {
        if (url?.includes('firebasestorage.googleapis.com')) {
          try {
            await deleteObject(ref(storage, url));
          } catch (e) {
            console.warn('Image cleanup skipped or failed:', e);
          }
        }
      }
      navigate('/collection');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error during deletion protocol.');
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  if (!figure) return null;

  // Определяем, какую картинку пытаться показать в аватаре
  const avatarUrl = characterData?.image || images[0];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4] font-sans selection:bg-blue-500/30 overflow-x-hidden text-left"
    >
      {/* Background System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.012] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-white group font-black uppercase text-[10px] tracking-[0.2em] italic transition-all"
          >
            <ArrowLeft size={16} /> Back to Vault
          </button>

          {currentUser?.uid === figure?.userId && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all cursor-pointer shadow-lg shadow-blue-500/10"
              >
                <Share2 size={14} /> Share
              </button>

              <button
                onClick={() => navigate(`/edit/${id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-gray-400 hover:text-blue-500 rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all cursor-pointer"
              >
                <Pencil size={14} /> Edit Unit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] hover:border-red-500/50 text-gray-400 hover:text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest italic transition-all cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* LEFT COLUMN: SLIDER */}
          <div className="flex flex-col items-center lg:items-end w-full">
            <div
              className="relative w-full max-w-md aspect-[4/5] z-10"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <AnimatePresence mode="wait">
                <Motion.div
                  key={`glow-${activeImg}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-0 blur-[60px] rounded-full opacity-50 pointer-events-none scale-110"
                  style={{
                    background: `url(${images[activeImg]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </AnimatePresence>

              <div className="relative w-full h-full bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] overflow-hidden shadow-2xl z-10 group/slider">
                <AnimatePresence custom={direction} initial={false}>
                  <Motion.img
                    key={activeImg}
                    src={images[activeImg]}
                    custom={direction}
                    variants={slideVariants}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, info) => {
                      if (info.offset.x > 50) prevSlide(e);
                      else if (info.offset.x < -50) nextSlide(e);
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-0 w-full h-full object-cover"
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
                    <div className="w-32 h-44 rounded-xl bg-[#121212] border border-[#333] overflow-hidden relative shadow-inner flex flex-col group/id">
                      {/* БЛИК ПОВЕРХ ВСЕГО */}
                      <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                        <Motion.div
                          initial={{ x: '-150%', skewX: -45 }}
                          animate={{ x: '150%', skewX: -45 }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            repeatDelay: 3,
                          }}
                          className="w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                        />
                      </div>

                      <div className="flex-1 overflow-hidden relative z-10 bg-[#0a0a0a] flex items-center justify-center">
                        {avatarUrl && !imageError ? (
                          <img
                            src={avatarUrl}
                            className="w-full h-full object-cover contrast-125 transition-all duration-700"
                            alt="id"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center opacity-30 group-hover/id:opacity-50 transition-opacity">
                            {/* Используем motion для иконки, чтобы оправдать импорт */}
                            <Motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Cpu size={32} className="text-blue-500 mb-2" />
                            </Motion.div>
                            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-center px-2">
                              Data Missing
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="bg-blue-600 py-2 px-2 border-t border-blue-400/50 text-center relative z-20">
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
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none text-left">
                        Designation
                      </p>
                      <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter border-l-4 border-blue-500 pl-4">
                        {figure.fullDisplayName || figure.name}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                      <div className="space-y-1.5 text-left">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                          Origin
                        </p>
                        <p className="text-[13px] font-black text-blue-500 uppercase italic truncate">
                          {figure.anime}
                        </p>
                      </div>
                      <div className="space-y-1.5 text-left">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                          Market Value
                        </p>
                        <p className="text-2xl font-black text-white italic tracking-tighter leading-none">
                          <span className="text-blue-500 mr-0.5">$</span>
                          {Math.round(Number(figure.price) || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1.5 text-left">
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
                      <div className="space-y-1.5 text-left">
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
                      <div className="space-y-1.5 text-left">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">
                          Owner
                        </p>
                        <p className="text-[12px] font-black text-blue-500 uppercase italic">
                          {figure.authorName || 'System Archive'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-10 w-full bg-[#121212] flex items-center px-8 justify-between border-t border-[#333]">
                <div className="flex gap-1.5 h-4 opacity-30">
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className={`bg-white ${i % 3 === 0 ? 'w-2' : 'w-[1px]'} h-full`}
                    ></div>
                  ))}
                </div>
                <p className="text-[8px] font-mono text-white/20 uppercase tracking-[0.8em]">
                  ID-CRYPT-SECURE-VAULT
                </p>
              </div>
            </div>

            {/* МИНИАТЮРЫ */}
            <div className="hidden sm:flex flex-wrap gap-4 justify-start">
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
            <div className="flex flex-col gap-4">
              <button
                onClick={handleMarketScan}
                className="group flex items-center justify-between bg-blue-600/10 border border-blue-500/30 text-blue-500 p-6 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-4 text-left">
                  <SearchCode size={20} />
                  <div className="flex flex-col">
                    <span className="font-black uppercase tracking-[0.2em] text-[11px] italic leading-none">
                      Global Market Scan
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.1em] opacity-60 mt-1">
                      Identify on Taobao / eBay / Proxy
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>

              {figure.auctionUrl && (
                <a
                  href={figure.auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-white text-black p-6 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  <div className="flex items-center gap-4 text-left">
                    <ExternalLink size={20} />
                    <span className="font-black uppercase tracking-[0.2em] text-[11px] italic leading-none">
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
        </div>

        {/* RELATED FIGURES SECTION */}
        {relatedFigures.length > 0 && (
          <div className="mt-24 border-t border-[#333] pt-12 pb-20 text-left">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] italic leading-none text-left">
                  Database Scan
                </p>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter text-left">
                  More from {figure.anime}
                </h2>
              </div>
              <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent ml-10"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedFigures.map((relFigure) => (
                <FigureCard key={relFigure.id} figure={relFigure} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Initialize Deletion"
        message={`Confirm permanent removal of "${figure.name}" from the secure vault? This action cannot be undone.`}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        figure={figure}
      />
    </Motion.div>
  );
};

export default FigureDetailsPage;
