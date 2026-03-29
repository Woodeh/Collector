import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { auth, db, storage } from '../firebase/config';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileDown, Camera, Loader2, Award, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import StatsAndCharts from '../components/charts/StatsAndCharts';
import BrandsSplit from '../components/charts/BrandsSplit';
import GrailModal from '../components/modals/GrailModal';
import {
  MainGrail,
  CollectionStream,
  NextArrival,
  ProfileHeader,
  RankModal,
  ProfileBackground,
} from '../components/profile/index';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [allFigures, setAllFigures] = useState([]);
  const [recentFigures, setRecentFigures] = useState([]);
  const [collectionStats, setCollectionStats] = useState({ totalValue: 0, count: 0 });
  const [preorderStats, setPreorderStats] = useState({ totalValue: 0, count: 0 });
  const [wishlistStats, setWishlistStats] = useState({ totalValue: 0, count: 0 });
  const [nextRelease, setNextRelease] = useState(null);
  const [brandData, setBrandData] = useState([]);
  const [animeData, setAnimeData] = useState([]);
  const [favoriteFigure, setFavoriteFigure] = useState(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  // Rank Logic based on figure count
  const getRankInfo = (count) => {
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
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser && !auth.currentUser) {
        // Редирект на лендинг для гостей
        navigate('/');
      }
      if (currentUser) {
        const qFigures = query(collection(db, 'figures'), where('userId', '==', currentUser.uid));
        const unsubFigures = onSnapshot(qFigures, (snap) => {
          const figuresList = [];
          let totalValue = 0,
            count = 0;
          const brandsMap = {};
          const animeMap = {};

          snap.docs.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            figuresList.push(data);
            if (data.conditionGrade?.toLowerCase().trim() !== 'pre-order') {
              totalValue += Number(data.price) || 0;
              count++;
              brandsMap[data.brand || 'Other'] = (brandsMap[data.brand || 'Other'] || 0) + 1;
              animeMap[data.anime || 'Original'] = (animeMap[data.anime || 'Original'] || 0) + 1;
            }
          });

          setAllFigures(figuresList);
          setRecentFigures(
            [...figuresList]
              .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
              .slice(0, 10),
          );
          setAnimeData(
            Object.keys(animeMap)
              .map((n) => ({ name: n, value: animeMap[n] }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5),
          );
          setBrandData(
            Object.keys(brandsMap)
              .map((b) => ({ name: b, value: brandsMap[b] }))
              .sort((a, b) => b.value - a.value),
          );
          setCollectionStats({ totalValue, count });

          const manualFav = figuresList.find((f) => f.isFavorite === true);
          setFavoriteFigure(manualFav || [...figuresList].sort((a, b) => b.price - a.price)[0]);
        });

        const qPreorders = query(
          collection(db, 'preorders'),
          where('userId', '==', currentUser.uid),
        );
        const unsubPreorders = onSnapshot(qPreorders, (snap) => {
          let totalPreValue = 0;
          const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          items.forEach((i) => (totalPreValue += Number(i.totalPrice) || 0));
          if (items.length > 0)
            setNextRelease(
              [...items].sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))[0],
            );
          setPreorderStats({ totalValue: totalPreValue, count: snap.size });
        });

        const qWish = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
        const unsubWish = onSnapshot(qWish, (snap) => {
          let totalWishValue = 0;
          snap.docs.forEach((doc) => (totalWishValue += Number(doc.data().price) || 0));
          setWishlistStats({ totalValue: totalWishValue, count: snap.size });
        });

        return () => {
          unsubFigures();
          unsubPreorders();
          unsubWish();
        };
      }
    });
    return () => unsubAuth();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL });
      window.location.reload();
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('System Error: Avatar synchronization failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectFavorite = async (figureId) => {
    try {
      const currentFav = allFigures.find((f) => f.isFavorite === true);
      if (currentFav) await updateDoc(doc(db, 'figures', currentFav.id), { isFavorite: false });
      await updateDoc(doc(db, 'figures', figureId), { isFavorite: true });
      setIsSelectOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const generateReport = () => {
    if (allFigures.length === 0) return alert('No data available in the vault.');

    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const userName = user?.displayName || user?.email?.split('@')[0] || 'Collector';

    // High-tech Header Styling
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(59, 130, 246); // Blue-500
    doc.setFontSize(22);
    doc.text('FIGURE.COLLECTOR', 15, 22);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text('SYSTEM GENERATED ASSET LOG // SECURE ARCHIVE', 15, 30);

    doc.setFontSize(8);
    doc.text(`GENERATED: ${timestamp}`, 140, 22);
    doc.text(`OPERATOR: ${userName.toUpperCase()}`, 140, 28);

    // Inventory Table Construction
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

    autoTable(doc, {
      startY: 50,
      head: [['DESIGNATION', 'ORIGIN', 'MANUFACTURER', 'EST. VALUE', 'STATUS']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });

    doc.save(`Collection_Report_${userName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-12 pb-32 text-left font-sans relative overflow-hidden">
      <ProfileBackground />

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
    </div>
  );
};

export default Profile;
