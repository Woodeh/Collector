import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import {
  Zap,
  ShieldCheck,
  BarChart3,
  Layers,
  ChevronRight,
  Lock,
  Globe,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import FigureCard from '../components/collection/FigureCard';

const generatePlaceholders = () => [
  {
    id: 'p1',
    name: 'Eva Unit-01',
    anime: 'Evangelion',
    price: 180,
    previewImage: 'https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=800',
  },
  {
    id: 'p2',
    name: 'Cyberpunk Edgerunner',
    anime: 'Night City',
    price: 120,
    previewImage: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=800',
  },
  {
    id: 'p3',
    name: 'Ghost in the Shell',
    anime: 'Section 9',
    price: 250,
    previewImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=800',
  },
  {
    id: 'p4',
    name: 'Prototype Asset',
    anime: 'Vault Dev',
    price: 300,
    previewImage: 'https://images.unsplash.com/photo-1560439514-4e9643e39404?q=80&w=800',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [communityFigures, setCommunityFigures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Параллакс логика
  const { scrollYProgress } = useScroll();

  // Фоновые слои: сетка и "плавающий" текст для экстремальной глубины
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const floatingTextY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);

  // Параллакс для контента Hero: заголовок, описание и кнопки улетают с разной скоростью
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const descY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    const fetchTeaser = async () => {
      try {
        setLoading(true);
        // Для "Live Database Scan" и "real-time additions" логично показывать последние добавленные.
        // Убедитесь, что у вас есть индекс для 'createdAt' в Firebase Console,
        // иначе этот запрос может не работать или быть неэффективным.
        const q = query(collection(db, 'figures'), orderBy('createdAt', 'desc'), limit(15));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        if (data.length > 0) {
          setCommunityFigures(data);
        } else {
          // Если в базе пусто, используем демо-данные для красоты
          setCommunityFigures(generatePlaceholders());
        }
      } catch (e) {
        console.warn('Firebase access denied or error, showing placeholders', e);
        setCommunityFigures(generatePlaceholders());
      } finally {
        setLoading(false);
      }
    };
    fetchTeaser();
  }, []);

  const features = [
    {
      icon: <Layers className="text-blue-500" size={24} />,
      title: 'Secure Digital Vault',
      desc: 'Detailed archiving of your collection with condition tracking and box status.',
    },
    {
      icon: <BarChart3 className="text-pink-500" size={24} />,
      title: 'Market Analytics',
      desc: 'Real-time calculation of your total collection value and brand distribution.',
    },
    {
      icon: <Zap className="text-orange-500" size={24} />,
      title: 'Pre-order Matrix',
      desc: 'Manage future releases, multi-currency deposits, and payment deadlines.',
    },
    {
      icon: <Trophy className="text-amber-500" size={24} />,
      title: 'Rank Progression',
      desc: 'Level up your collector status from Novice to Mythic Overlord.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e4e4] font-sans selection:bg-blue-500/30 overflow-x-hidden text-left">
      {/* PARALLAX BACKGROUND LAYERS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Слой с сеткой (Grid) */}
        <Motion.div style={{ y: backgroundY }} className="absolute inset-0 opacity-[0.15]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </Motion.div>

        {/* Декоративный "зафокусный" текст на фоне */}
        <Motion.div
          style={{ y: floatingTextY, opacity: 0.03 }}
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        >
          <div className="text-[15vw] font-black uppercase italic leading-none -rotate-12 translate-x-1/4">
            Secure Archive System 01
          </div>
        </Motion.div>

        {/* Чистый глубокий фон с легким оттенком */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/10" />

        {/* Grain/Noise Overlay to fix banding */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 px-4 z-10">
        <div className="max-w-7xl mx-auto text-center space-y-8 relative">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ y: titleY, opacity: opacityHero }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-full mb-4 mx-auto">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">
                System Status: Ready to Initialize
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] text-white">
              The Ultimate <br />
              <span className="text-blue-600">Collector's</span> Vault.
            </h1>
          </Motion.div>

          <Motion.p
            style={{ y: descY, opacity: opacityHero }}
            className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base font-bold uppercase tracking-widest italic"
          >
            Archiving the world's finest figures. Secure, analytical, and community-driven.
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20"
          >
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase italic tracking-widest text-white transition-all active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 cursor-pointer"
            >
              Initialize My Vault <ChevronRight size={20} />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('community-scan');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-10 py-5 bg-[#1a1a1a] border border-[#333] hover:border-gray-600 rounded-2xl font-black uppercase italic tracking-widest text-gray-400 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              Explore Catalog
            </button>
          </Motion.div>
        </div>
      </section>

      {/* COMMUNITY TEASER */}
      <section
        id="community-scan"
        className="relative py-24 px-4 bg-[#0d0d0d]/80 backdrop-blur-sm border-y border-[#333] z-10"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500">
                <Globe size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Global Network
                </span>
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                Live Database <span className="text-blue-500">Scan.</span>
              </h2>
            </div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest max-w-xs md:text-right italic">
              Scanning real-time additions to the collective vault. Join to contribute your own
              assets.
            </p>
          </div>

          {/* INFINITE MARQUEE CAROUSEL */}
          {!loading && communityFigures.length > 0 ? (
            <div className="relative overflow-hidden py-10 opacity-70 pointer-events-none select-none grayscale-[0.4] blur-[0.3px] min-h-[400px]">
              <Motion.div
                className="flex gap-6 w-max"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                  duration: 80, // Увеличено с 40 до 80 для более медленного движения
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {/* Дублируем элементы 3 раза для более стабильного бесконечного цикла на широких экранах */}
                {[...communityFigures, ...communityFigures, ...communityFigures].map(
                  (figure, idx) => (
                    <div key={`${figure.id}-${idx}`} className="w-48 md:w-64 shrink-0">
                      <FigureCard figure={figure} isCommunity={true} />
                    </div>
                  ),
                )}
              </Motion.div>

              {/* Виньетка по краям для глубины */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent z-10" />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-[#333] rounded-[2rem] opacity-20">
              <p className="font-black uppercase tracking-widest text-xs italic">
                Initialising Data Stream...
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="group text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 hover:text-white transition-colors flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Lock size={14} /> Join to view full database{' '}
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-32 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: 'easeOut' }}
                whileHover={{ y: -10 }}
                className="p-8 bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] space-y-6 hover:border-blue-500/50 transition-all group text-left"
              >
                <div className="w-14 h-14 bg-[#121212] border border-[#333] rounded-2xl flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all">
                  {f.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-xs font-bold leading-relaxed">{f.desc}</p>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative pb-32 px-4 z-10">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 p-[1px] rounded-[3.5rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)]">
          <div className="bg-[#121212] rounded-[3.4rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5 -z-10" />
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
              Your collection <br /> deserves a <span className="text-blue-500">Legendary</span>{' '}
              status.
            </h2>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest italic max-w-lg mx-auto leading-relaxed">
              Start your journey today. Join hundreds of collectors tracking thousands of items in
              the most advanced figure management system.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-12 py-6 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto cursor-pointer shadow-xl"
            >
              Access System <Zap size={20} fill="currentColor" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
