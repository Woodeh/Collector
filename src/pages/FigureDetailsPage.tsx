import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../firebase/config';
import { ref, deleteObject } from 'firebase/storage';
import { motion as Motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider';
import { useI18n } from '../app/i18n/I18nProvider';

import Modal from '../shared/Modal';
import ShareModal from '../features/ShareModal';

import DetailsHeader from '../components/details/DetailsHeader';
import DetailsSlider from '../widgets/DetailsSlider';
import DetailsIdCard from '../widgets/DetailsIdCard';
import DetailsThumbnails from '../components/details/DetailsThumbnails';
import DetailsActionButtons from '../components/details/DetailsActionButtons';
import DetailsRelated from '../widgets/DetailsRelated';
import type { Figure } from '../types/figure';
import FigureDnaCard from '../widgets/FigureDnaCard';
import FigureHistoryTimeline from '../widgets/FigureHistoryTimeline';
import {
  deleteFigure,
  getFigureById,
  getRelatedPublicFigures,
} from '../entities/figures/api/figureRepository';

interface CharacterData {
  image: string;
  name: string;
}

const FigureDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { t } = useI18n();
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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchFigureAndArt = async () => {
      if (!id) return;
      setLoading(true);
      setImageError(false); 
      try {
        const data = await getFigureById(id);
        if (data) {
          setFigure(data);

          setRelatedFigures(await getRelatedPublicFigures(id, data.anime));

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
      await deleteFigure(id);

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
      alert(t('details.deleteError'));
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  if (!figure) return <div className="min-h-[70vh] flex items-center justify-center text-gray-500">{t('details.notFound')}</div>;

  const historyEvents = figure.history?.length
    ? figure.history
    : figure.createdAt
      ? [{ id: `legacy-created-${figure.id}`, type: 'created' as const, createdAt: figure.createdAt.toDate().toISOString() }]
      : [];

  return (
    <Motion.main
      role="main"
      aria-label="Figure details"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4] font-sans selection:bg-blue-500/30 overflow-x-hidden text-left"
    >
      <div className="max-w-7xl mx-auto">
        <DetailsHeader
          currentUser={currentUser}
          figure={figure}
          id={id || ''}
          onShare={() => setIsShareModalOpen(true)}
          onDelete={() => setIsDeleteModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-12 xl:gap-16 items-start lg:items-stretch">
          <div className="w-full min-w-0">
            <DetailsSlider
              images={images}
              activeImg={activeImg}
              direction={direction}
              nextSlide={nextSlide}
              prevSlide={prevSlide}
              setIsHovered={setIsHovered}
            />

            <div className="mt-5">
              <DetailsThumbnails
                images={images}
                handleManualSelect={handleManualSelect}
                activeImg={activeImg}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:h-full lg:[&>*:first-child]:flex-1">
            <DetailsIdCard
              figure={figure}
              characterData={characterData}
              images={images}
              imageError={imageError}
              setImageError={setImageError}
            />

            <DetailsActionButtons
              handleMarketScan={handleMarketScan}
              auctionUrl={figure.auctionUrl || null}
            />

            <FigureDnaCard figure={figure} />

          </div>
        </div>

        <DetailsRelated relatedFigures={relatedFigures} anime={figure.anime || ''} />
        {currentUser?.uid === figure.userId && <FigureHistoryTimeline events={historyEvents} />}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t('details.deleteTitle')}
        message={t('details.deleteMessage', { name: figure.name })}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        figure={figure}
      />
    </Motion.main>
  );
};

export default FigureDetailsPage;
