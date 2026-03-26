import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';

import StatsAndCharts from '../components/charts/StatsAndCharts';
import BrandsSplit from '../components/charts/BrandsSplit';
import GrailModal from '../components/modals/GrailModal';
import {
  ProfileHeader,
  MainGrail,
  CollectionStream,
  NextArrival,
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
        <ProfileHeader user={user} navigate={navigate} />

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
            <NextArrival nextRelease={nextRelease} navigate={navigate} />
            <BrandsSplit brandData={brandData} collectionStats={collectionStats} COLORS={COLORS} />
          </div>
        </div>

        <CollectionStream recentFigures={recentFigures} navigate={navigate} />
      </div>
    </div>
  );
};

export default Profile;
