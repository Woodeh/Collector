import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase/config';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FileDown, Camera, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import StatsAndCharts from '../components/charts/StatsAndCharts';
import BrandsSplit from '../components/charts/BrandsSplit';
import GrailModal from '../components/modals/GrailModal';
import { MainGrail, CollectionStream, NextArrival } from '../components/profile/index';

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

  const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#22c55e', '#eab308', '#ef4444'];

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      <style>{`
        @keyframes flashlightFocus {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          33% { transform: translate(-48%, -52%) scale(1.1); opacity: 0.2; }
          66% { transform: translate(-52%, -48%) scale(0.95); opacity: 0.15; }
        }
        .center-flashlight {
          position: fixed; top: 50%; left: 50%; width: 80vw; height: 80vw;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 60%);
          filter: blur(100px); z-index: 0; pointer-events: none; animation: flashlightFocus 12s ease-in-out infinite;
        }
        /* UI Centering & Layout Fixes */
        .next-arrival-widget button, .profile-action-btn {
          display: flex !important; justify-content: center !important;
          align-items: center !important; text-align: center !important;
          width: 100%;
        }

        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="center-flashlight"></div>

      <GrailModal
        isSelectOpen={isSelectOpen}
        setIsSelectOpen={setIsSelectOpen}
        allFigures={allFigures}
        favoriteFigure={favoriteFigure}
        handleSelectFavorite={handleSelectFavorite}
      />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 text-left">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-b border-[#333] pb-12">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full lg:w-auto">
            {/* AVATAR BLOCK */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] border-2 border-[#333] bg-[#1a1a1a] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] group-hover:border-blue-500/50 transition-all relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    className="w-full h-full object-cover"
                    alt="User Avatar"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                    <span className="text-gray-700 font-black text-4xl md:text-5xl uppercase italic leading-none">
                      {user?.displayName?.[0] || user?.email?.[0] || '?'}
                    </span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-30">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              <label
                className="absolute -bottom-2 -right-2 p-3 bg-blue-600 rounded-2xl cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:bg-blue-500 transition-all transform hover:scale-110 border border-white/10 z-20 flex items-center justify-center active:scale-95"
                title="Update Visual ID"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* USER INFO BLOCK */}
            <div className="text-center md:text-left space-y-2">
              <div className="space-y-0.5">
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] italic opacity-60">
                  Authorized Collector
                </p>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {user?.displayName || user?.email?.split('@')[0]}
                </h1>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="h-px w-8 bg-blue-500/30"></div>
                <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={generateReport}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] hover:border-blue-500/50 text-gray-500 hover:text-white px-3 py-2 rounded-xl transition-all font-black uppercase text-[9px] tracking-widest italic group cursor-pointer shrink-0"
          >
            <FileDown
              size={14}
              className="text-blue-500 group-hover:text-white transition-colors"
            />
            <span>Generate Report</span>
          </button>
        </div>

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
            <BrandsSplit brandData={brandData} collectionStats={collectionStats} COLORS={COLORS} />
          </div>
        </div>

        <CollectionStream recentFigures={recentFigures} navigate={navigate} />
      </div>
    </div>
  );
};

export default Profile;
