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
  type DocumentData, // Added 'type' keyword to prevent Vite import errors
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { motion as Motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import Modal from '../shared/Modal';
import ShareModal from '../features/ShareModal';

import DetailsHeader from '../components/details/DetailsHeader';
import DetailsSlider from '../widgets/DetailsSlider';
import DetailsIdCard from '../widgets/DetailsIdCard';
import DetailsThumbnails from '../components/details/DetailsThumbnails';
import DetailsActionButtons from '../components/details/DetailsActionButtons';
import DetailsRelated from '../widgets/DetailsRelated';

interface Figure extends DocumentData {
  id: string;
  name: string;
  anime?: string;
  brand?: string;
  price?: string | number;
  previewImage?: string;
  image?: string;
  images?: string[];
  characterId?: string;
  characterImage?: string;
  auctionUrl?: string;
  conditionGrade: string;
  hasBox: string | boolean;
  userId?: string;
}

interface CharacterData {
  image: string;
  name: string;
}

const FigureDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [figure, setFigure] = useState<Figure | null>(null);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [relatedFigures, setRelatedFigures] = useState<Figure[]>([]);
  const [activeImg, setActiveImg] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchFigureAndArt = async () => {
      if (!id) return;
      setLoading(true);
      setImageError(false); 
      try {
        const docSnap = await getDoc(doc(db, 'figures', id));
        if (docSnap.exists()) {
          const data = docSnap.data() as Figure;
          setFigure(data);

          // --- RECOMMENDATION LOGIC ---
          let finalRelated: Figure[] = [];
          if (data.anime) {
            const sameAnimeQuery = query(
              collection(db, 'figures'),
              where('anime', '==', data.anime),
              limit(10),
            );
            const sameAnimeSnap = await getDocs(sameAnimeQuery);
            finalRelated = sameAnimeSnap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() } as Figure))
              .filter((item) => item.id !== id);
          }

          if (finalRelated.length < 4) {
            const randomQuery = query(collection(db, 'figures'), limit(20));
            const randomSnap = await getDocs(randomQuery);
            const randomFigures = randomSnap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() } as Figure))
              .filter((item) => item.id !== id && !finalRelated.some((r) => r.id === item.id));

            const shuffledRandom = randomFigures.sort(() => 0.5 - Math.random());
            finalRelated = [...finalRelated, ...shuffledRandom].slice(0, 4);
          } else {
            finalRelated = finalRelated.sort(() => 0.5 - Math.random()).slice(0, 4);
          }

          setRelatedFigures(finalRelated);

          if (data.characterImage) {
            setCharacterData({
              image: data.characterImage,
              name: data.name,
            });
          } else if (data.characterId || data.name) {
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
    return figure.images && figure.images.length > 0
      ? figure.images
      : [figure.previewImage || figure.image || ''];
  }, [figure]);

  useEffect(() => {
    if (images.length > 1 && !isHovered) {
      timerRef.current = setInterval(() => {
        setDirection(1);
        setActiveImg((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images, isHovered]);

  const handleManualSelect = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (idx !== activeImg) {
      setDirection(idx > activeImg ? 1 : -1);
      setActiveImg(idx);
    }
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDirection(1);
    setActiveImg((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDirection(-1);
    setActiveImg((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMarketScan = () => {
    const currentImgUrl = images[activeImg];
    const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(currentImgUrl || '')}`;
    window.open(lensUrl, '_blank');
  };

  const handleConfirmDelete = async () => {
    if (!id || !figure) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'figures', id));

      const imageUrls = figure.images || (figure.previewImage ? [figure.previewImage] : []);
      for (const url of imageUrls) {
        if (url && url.includes('firebasestorage.googleapis.com')) {
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
      <div className="max-w-6xl mx-auto">
        <DetailsHeader
          currentUser={currentUser}
          figure={figure}
          id={id || ''}
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

          <div className="flex flex-col gap-8">
            <DetailsIdCard
              figure={figure}
              characterData={characterData}
              images={images}
              imageError={imageError}
              setImageError={setImageError}
            />

            <DetailsThumbnails 
              images={images} 
              handleManualSelect={handleManualSelect} 
              activeImg={activeImg} 
            />

            <DetailsActionButtons
              handleMarketScan={handleMarketScan}
              auctionUrl={figure.auctionUrl}
            />
          </div>
        </div>

        <DetailsRelated relatedFigures={relatedFigures} anime={figure.anime || ''} />
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