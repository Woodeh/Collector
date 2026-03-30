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
import { motion as Motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import Modal from '../components/Modal';
import ShareModal from '../components/modals/ShareModal';

import DetailsHeader from '../components/details/DetailsHeader';
import DetailsSlider from '../components/details/DetailsSlider';
import DetailsIdCard from '../components/details/DetailsIdCard';
import DetailsThumbnails from '../components/details/DetailsThumbnails';
import DetailsActionButtons from '../components/details/DetailsActionButtons';
import DetailsRelated from '../components/details/DetailsRelated';

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
        <DetailsHeader
          currentUser={currentUser}
          figure={figure}
          id={id}
          onShare={() => setIsShareModalOpen(true)}
          onDelete={() => setIsDeleteModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <DetailsSlider
            images={images}
            activeImg={activeImg}
            direction={direction}
            nextSlide={nextSlide}
            prevSlide={prevSlide}
            setIsHovered={setIsHovered}
          />

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-8">
            <DetailsIdCard
              figure={figure}
              characterData={characterData}
              images={images}
              activeImg={activeImg}
              imageError={imageError}
              setImageError={setImageError}
            />

            <DetailsThumbnails images={images} handleManualSelect={handleManualSelect} />

            <DetailsActionButtons
              handleMarketScan={handleMarketScan}
              auctionUrl={figure.auctionUrl}
            />
          </div>
        </div>

        <DetailsRelated relatedFigures={relatedFigures} anime={figure.anime} />
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
