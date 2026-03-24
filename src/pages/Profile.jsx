import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { User, LogOut, DollarSign, Clock, Heart, Calendar, Target, Package } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333] shadow-2xl text-left backdrop-blur-md">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none italic">
          {payload[0].name}
        </p>
        <p className="text-sm font-black text-blue-500 italic leading-none">
          {payload[0].value} Pcs
        </p>
      </div>
    );
  }
  return null;
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [collectionStats, setCollectionStats] = useState({ totalValue: 0, count: 0 });
  const [preorderStats, setPreorderStats] = useState({ totalValue: 0, count: 0 });
  const [wishlistStats, setWishlistStats] = useState({ totalValue: 0, count: 0 });
  const [nextRelease, setNextRelease] = useState(null);
  const [brandData, setBrandData] = useState([]);

  const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#22c55e', '#eab308', '#ef4444'];

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 1. Фигурки и бренды
        const qFigures = query(collection(db, 'figures'), where('userId', '==', currentUser.uid));
        const unsubFigures = onSnapshot(qFigures, (snap) => {
          let totalValue = 0,
            count = 0;
          const brandsMap = {};
          snap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.conditionGrade?.toLowerCase().trim() !== 'pre-order') {
              totalValue += Number(data.price) || 0;
              count++;
              const brand = data.brand || 'Other';
              brandsMap[brand] = (brandsMap[brand] || 0) + 1;
            }
          });
          setBrandData(
            Object.keys(brandsMap).map((brand) => ({ name: brand, value: brandsMap[brand] })),
          );
          setCollectionStats({ totalValue, count });
        });

        // 2. Предзаказы и Ближайший релиз
        const qPreorders = query(
          collection(db, 'preorders'),
          where('userId', '==', currentUser.uid),
        );
        const unsubPreorders = onSnapshot(qPreorders, (snap) => {
          let totalPreValue = 0;
          const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          items.forEach((item) => (totalPreValue += Number(item.totalPrice) || 0));

          if (items.length > 0) {
            const sorted = [...items].sort(
              (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
            );
            setNextRelease(sorted[0]);
          }

          setPreorderStats({ totalValue: totalPreValue, count: snap.size });
        });

        // 3. Вишлист
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#121212] p-6 md:p-12 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* PROFILE HEADER (БЕЗ SYNC) */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] gap-6 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-600/20">
              <User size={40} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">
                {user.displayName || user.email.split('@')[0]}
              </h1>
              <p className="text-blue-500 font-bold text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          {/* FINANCIAL HUB */}
          <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] space-y-7 shadow-2xl">
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-2">
              Financial Hub
            </h4>
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-[#121212] rounded-2xl border border-white/5">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                    Total Collection
                  </p>
                  <p className="text-2xl font-black text-white italic leading-none">
                    ${collectionStats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[#121212] rounded-2xl border border-white/5">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                    Pre-order Debt
                  </p>
                  <p className="text-2xl font-black text-orange-500 italic leading-none">
                    ${preorderStats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-[#121212] rounded-2xl border border-white/5">
                <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                    Wishlist Budget
                  </p>
                  <p className="text-2xl font-black text-pink-500 italic leading-none">
                    ${wishlistStats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* NEXT RELEASE */}
          <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar size={120} />
            </div>
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-8">
              Next Expected Arrival
            </h4>
            {nextRelease ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-pink-500 font-black uppercase text-[10px] tracking-widest">
                    {nextRelease.anime}
                  </p>
                  <h3 className="text-2xl font-black text-white uppercase italic leading-tight line-clamp-2">
                    {nextRelease.name}
                  </h3>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                      Release Date
                    </p>
                    <p className="text-sm font-black text-white uppercase">
                      {nextRelease.releaseDate}
                    </p>
                  </div>
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Brand</p>
                    <p className="text-sm font-black text-white uppercase">{nextRelease.brand}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/preorders')}
                  className="w-full py-4 bg-orange-600/10 border border-orange-600/20 rounded-2xl text-orange-500 font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 hover:text-white transition-all"
                >
                  View Details
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Package size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  No pending releases
                </p>
              </div>
            )}
          </div>

          {/* DISTRIBUTION */}
          <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] relative shadow-2xl min-h-[350px]">
            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic absolute top-8 left-8">
              Brand Split
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="55%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={12}
                  stroke="none"
                >
                  {brandData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
              <span className="text-5xl font-black text-white italic leading-none">
                {collectionStats.count}
              </span>
              <span className="text-[9px] text-gray-600 uppercase font-black tracking-[0.2em] mt-2">
                Units
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM PORTFOLIO */}
        <div className="bg-[#1a1a1a] border border-[#333] p-10 rounded-[3rem] shadow-2xl text-left">
          <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-8">
            Manufacturer Portfolio
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {brandData
              .sort((a, b) => b.value - a.value)
              .map((entry, index) => (
                <div
                  key={index}
                  className="p-6 bg-[#121212] border border-[#333] rounded-[2rem] hover:border-blue-500/40 transition-all group"
                >
                  <div
                    className="w-2 h-2 rounded-full mb-4"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <p className="text-white font-black italic text-lg leading-none mb-1">
                    {entry.value}
                  </p>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest truncate">
                    {entry.name}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
