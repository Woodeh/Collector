import React, { useState, useEffect, FC, ChangeEvent } from 'react';
import { motion as Motion } from 'framer-motion';
import { auth, storage } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileDown, Camera, Loader2, Award, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Figure } from '../types/figure';
import { useAuth } from '../app/providers/AuthProvider';
import {
  setFavoriteFigure as persistFavoriteFigure,
  subscribeToUserFigures,
} from '../entities/figures/api/figureRepository';
import { subscribeToPreOrders } from '../entities/preorder/preOrderRepository';
import type { PreOrder } from '../entities/preorder/model';
import { subscribeToWishlist } from '../entities/wishlist/wishlistRepository';

import StatsAndCharts from '../widgets/StatsAndCharts';
import BrandsSplit from '../widgets/BrandsSplit';
import GrailModal from '../features/set-main-grail/GrailModal';
import {
  MainGrail,
  CollectionStream,
  NextArrival,
  ProfileHeader,
  RankModal,
  ProfileBackground,
} from '../entities/user/index';

interface ProfileFigure extends Figure {
  isFavorite: boolean;
}

interface Stats {
  totalValue: number;
  count: number;
}

interface ChartData {
  name: string;
  value: number;
}

const Profile: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allFigures, setAllFigures] = useState<ProfileFigure[]>([]);
  const [recentFigures, setRecentFigures] = useState<ProfileFigure[]>([]);
  const [collectionStats, setCollectionStats] = useState<Stats>({ totalValue: 0, count: 0 });
  const [preorderStats, setPreorderStats] = useState<Stats>({ totalValue: 0, count: 0 });
  const [wishlistStats, setWishlistStats] = useState<Stats>({ totalValue: 0, count: 0 });
  const [nextRelease, setNextRelease] = useState<PreOrder | null>(null);
  const [brandData, setBrandData] = useState<ChartData[]>([]);
  const [animeData, setAnimeData] = useState<ChartData[]>([]);
  const [favoriteFigure, setFavoriteFigure] = useState<Figure | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  // Rank Logic based on figure count
  const getRankInfo = (count: number) => {
    if (count >= 500)
      return { name: 'Mythic Overlord', next: 1000, color: 'text-amber-500', bg: 'bg-amber-500' };
    if (count >= 250)
      return { name: 'Legendary Curator', next: 500, color: 'text-rose-500', bg: 'bg-rose-500' };
    if (count >= 100)
      return { name: 'Master Architect', next: 250, color: 'text-purple-500', bg: 'bg-purple-500' };
    if (count >= 50)
      return { name: 'Elite Hunter', next: 100, color: 'text-indigo-500', bg: 'bg-indigo-500' };
    if (count >= 25)
      return { name: 'Veteran Tracker', next: 50, color: 'text-cyan-500', bg: 'bg-cyan-500' };
    if (count >= 10)
      return { name: 'Active Collector', next: 25, color: 'text-blue-500', bg: 'bg-blue-500' };
    if (count >= 5)
      return { name: 'Apprentice', next: 10, color: 'text-emerald-500', bg: 'bg-emerald-500' };
    return { name: 'Novice', next: 5, color: 'text-gray-500', bg: 'bg-gray-500' };
  };
  const rank = getRankInfo(collectionStats.count);

  const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#22c55e', '#eab308', '#ef4444'];

  useEffect(() => {
    if (!user) return;
        const unsubFigures = subscribeToUserFigures(user.uid, (figures) => {
          const figuresList: ProfileFigure[] = [];
          let totalValue = 0,
            count = 0;
          const brandsMap: Record<string, number> = {};
          const animeMap: Record<string, number> = {};

          figures.forEach((figure) => {
            const data = {
              isFavorite: false,
              anime: 'Original',
              ...figure,
            } as ProfileFigure;
            figuresList.push(data);
            if (data.conditionGrade?.toLowerCase().trim() !== 'pre-order') {
              const priceValue = typeof data.price === 'string' ? parseFloat(data.price) : Number(data.price);
              totalValue += Number.isNaN(priceValue) ? 0 : priceValue;
              count++;
              brandsMap[data.brand || 'Other'] = (brandsMap[data.brand || 'Other'] || 0) + 1;
              animeMap[data.anime || 'Original'] = (animeMap[data.anime || 'Original'] || 0) + 1;
            }
          });

          setAllFigures(figuresList);
          setRecentFigures(
            [...figuresList]
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
              .slice(0, 10),
          );
          setAnimeData(
            Object.keys(animeMap)
              .map((n) => ({ name: n, value: animeMap[n] ?? 0 }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5),
          );
          setBrandData(
            Object.keys(brandsMap)
              .map((b) => ({ name: b, value: brandsMap[b] ?? 0 }))
              .sort((a, b) => b.value - a.value),
          );
          setCollectionStats({ totalValue, count });

          const manualFav = figuresList.find((f) => f.isFavorite === true);
          // FIXED: Wrapped the logical OR in parentheses to allow nullish coalescing
          setFavoriteFigure((manualFav || [...figuresList].sort((a, b) => Number(b.price) - Number(a.price))[0]) ?? null);
        }, (error) => console.error('Profile figures subscription failed:', error));

        const unsubPreorders = subscribeToPreOrders(user.uid, (items) => {
          let totalPreValue = 0;
          items.forEach((item) => (totalPreValue += item.totalPrice));
          if (items.length > 0)
            setNextRelease(
              [...items].sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime())[0]!,
            );
          setPreorderStats({ totalValue: totalPreValue, count: items.length });
        }, (error) => console.error('Profile pre-orders subscription failed:', error));

        const unsubWish = subscribeToWishlist(user.uid, (items) => {
          let totalWishValue = 0;
          items.forEach((item) => (totalWishValue += item.price));
          setWishlistStats({ totalValue: totalWishValue, count: items.length });
        }, (error) => console.error('Profile wishlist subscription failed:', error));

    return () => {
          unsubFigures();
          unsubPreorders();
          unsubWish();
    };
  }, [user]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL });
      window.location.reload();
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('System Error: Avatar synchronization failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectFavorite = async (figureId: string) => {
    try {
      const currentFav = allFigures.find((f) => f.isFavorite === true);
      await persistFavoriteFigure(currentFav?.id, figureId);
      setIsSelectOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const generateReport = () => {
    if (allFigures.length === 0) return alert('No data available in the vault.');

    const pdfDoc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const userName = user?.displayName || user?.email?.split('@')[0] || 'Collector';

    pdfDoc.setFillColor(18, 18, 18);
    pdfDoc.rect(0, 0, 210, 40, 'F');

    pdfDoc.setTextColor(59, 130, 246);
    pdfDoc.setFontSize(22);
    pdfDoc.text('FIGURE.COLLECTOR', 15, 22);

    pdfDoc.setTextColor(150, 150, 150);
    pdfDoc.setFontSize(9);
    pdfDoc.text('SYSTEM GENERATED ASSET LOG // SECURE ARCHIVE', 15, 30);

    pdfDoc.setFontSize(8);
    pdfDoc.text(`GENERATED: ${timestamp}`, 140, 22);
    pdfDoc.text(`OWNER: ${userName.toUpperCase()}`, 140, 28);

    const tableData = allFigures
      .filter((f) => f.conditionGrade?.toLowerCase().trim() !== 'pre-order')
      .sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
      .map((f) => [
        f.name || 'Unknown Item',
        f.anime || 'N/A',
        f.brand || 'Original',
        `$${Number(f.price || 0).toLocaleString()}`,
        f.conditionGrade || 'Standard',
      ]);

    autoTable(pdfDoc, {
      startY: 50,
      head: [['DESIGNATION', 'ORIGIN', 'MANUFACTURER', 'EST. VALUE', 'STATUS']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });

    pdfDoc.save(`Collection_Report_${userName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!user) return null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="min-h-screen bg-[#121212] p-4 md:p-12 pb-32 text-left font-sans relative overflow-hidden"
    >
      <ProfileBackground />

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.012] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      </div>

      <GrailModal
        isSelectOpen={isSelectOpen}
        setIsSelectOpen={setIsSelectOpen}
        allFigures={allFigures}
        favoriteFigure={favoriteFigure}
        handleSelectFavorite={handleSelectFavorite}
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 text-left">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          <ProfileHeader
            user={user}
            isUploading={isUploading}
            handleAvatarChange={handleAvatarChange}
            rank={rank}
            count={collectionStats.count}
            onRankClick={() => setIsRankModalOpen(true)}
            onGenerateReport={generateReport}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 text-left">
            <StatsAndCharts
              collectionStats={collectionStats}
              preorderStats={preorderStats}
              wishlistStats={wishlistStats}
              animeData={animeData}
            />

            <MainGrail
              favoriteFigure={favoriteFigure}
              setIsSelectOpen={setIsSelectOpen}
              navigate={navigate}
            />

            <div className="lg:col-span-4 space-y-8 text-left">
              <div className="next-arrival-widget">
                <NextArrival nextRelease={nextRelease} navigate={navigate} />
              </div>
              <BrandsSplit
                brandData={brandData}
                collectionStats={collectionStats}
                COLORS={COLORS}
              />
            </div>
          </div>

          <CollectionStream recentFigures={recentFigures} navigate={navigate} />
        </Motion.div>
      </div>
      <RankModal
        isOpen={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
        count={collectionStats.count}
      />
    </Motion.div>
  );
};

export default Profile;
