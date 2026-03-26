import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  Tag,
  Loader2,
  ShoppingCart,
  ExternalLink,
  ShieldCheck,
  User,
  ChevronRight,
} from 'lucide-react';

import FigureSlider from '../components/FigureSlider';

const FigureDetailsPage = () => {
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
        const docSnap = await getDoc(doc(db, 'figures', id));
        if (docSnap.exists()) setFigure(docSnap.data());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getFigure();
  }, [id]);

  const images = useMemo(() => {
    if (!figure) return [];
    return figure.images?.length > 0 ? figure.images : [figure.previewImage || figure.image];
  }, [figure]);

  useEffect(() => {
    if (images.length > 1 && !isPaused) {
      timerRef.current = setInterval(() => {
        setActiveImg((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [images, isPaused]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  if (!figure)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white bg-[#121212]">
        <p className="mb-4 text-gray-500 italic">Not found...</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 px-6 py-2 rounded-xl">
          Back
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4]">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 group font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
          to collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
          <FigureSlider
            images={images}
            activeImg={activeImg}
            setActiveImg={setActiveImg}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            nextSlide={() => {
              setIsPaused(true);
              setActiveImg((prev) => (prev + 1) % images.length);
            }}
            prevSlide={() => {
              setIsPaused(true);
              setActiveImg((prev) => (prev - 1 + images.length) % images.length);
            }}
          />

          <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] italic">
                <Tag size={12} /> {figure.anime}
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter italic uppercase">
                {figure.name}
              </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* PRICE */}
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333]">
                <p className="text-gray-500 text-[9px] uppercase mb-2 font-black tracking-widest leading-none">
                  Price
                </p>
                <p className="text-4xl font-black text-white leading-none">
                  {figure.price}
                  <span className="text-blue-500 ml-1">$</span>
                </p>
              </div>

              {/* GENDER */}
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333]">
                <p className="text-gray-500 text-[9px] uppercase mb-2 font-black tracking-widest leading-none">
                  Gender
                </p>
                <p className="text-xl font-black text-white uppercase">{figure.gender}</p>
              </div>

              {/* BRAND */}
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

              {/* BOX INTEGRITY */}
              <div className="bg-[#1a1a1a] p-6 rounded-[2rem] border border-[#333] col-span-2 md:col-span-3">
                <p className="text-gray-500 text-[9px] uppercase mb-2 font-black tracking-widest leading-none">
                  Box Integrity
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      figure.hasBox === 'Yes' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <p
                    className={`text-lg font-black uppercase tracking-tight ${
                      figure.hasBox === 'Yes' ? 'text-white' : 'text-red-500'
                    }`}
                  >
                    {figure.hasBox === 'Yes' ? 'Original Box Included' : 'No Box / Loose'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {figure.conditionGrade && (
                <div className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-[#333] flex gap-5">
                  <div className="bg-blue-500/10 p-4 rounded-3xl text-blue-500">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1 leading-none">
                      Condition Grade
                    </p>
                    <p className="text-white text-xl font-black uppercase tracking-tight">
                      {figure.conditionGrade}
                    </p>
                    {figure.conditionNotes && (
                      <p className="text-gray-400 text-sm mt-2 leading-relaxed border-l-2 border-[#333] pl-4 italic">
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
                    <p className="text-gray-500 text-[9px] uppercase font-black leading-none mb-1 tracking-widest">
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
                    <p className="text-gray-500 text-[9px] uppercase font-black leading-none mb-1 tracking-widest">
                      Collector
                    </p>
                    <p className="text-white font-black uppercase text-sm truncate">
                      {figure.authorName?.split('@')[0] || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {figure.auctionUrl && (
                <a
                  href={figure.auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between bg-white text-black p-6 rounded-[2.5rem] hover:bg-blue-600 hover:text-white transition-all shadow-lg"
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

export default FigureDetailsPage;
