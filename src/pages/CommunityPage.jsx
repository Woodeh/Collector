import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LayoutGrid, Users, Search, Info, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Community = () => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Здесь мы НЕ используем where(userId), чтобы видеть ВСЁ
    const q = query(collection(db, 'figures'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const figuresArray = [];
      querySnapshot.forEach((doc) => {
        figuresArray.push({ ...doc.data(), id: doc.id });
      });
      setFigures(figuresArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredFigures = figures.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.anime?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121212]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-500 font-black uppercase text-[10px] tracking-[0.3em]">
            Accessing Global Archive
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-8 text-[#e4e4e4] pb-20">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Заголовок */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#333] pb-10">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3 text-blue-500 mb-2">
              <Users size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Community Hub
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
              Global <span className="text-blue-500">Catalog.</span>
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Exploring {figures.length} unique units across all sectors
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search global database..."
              className="w-full bg-[#1a1a1a] border border-[#333] py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Сетка */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredFigures.map((figure) => (
            <div
              key={figure.id}
              className="group relative bg-[#1a1a1a] rounded-[2rem] border border-[#333] overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-2xl flex flex-col"
            >
              {/* Фото */}
              <div className="aspect-[3/4] overflow-hidden bg-black relative">
                <img
                  src={figure.previewImage || figure.image}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  alt={figure.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-60" />

                {/* Владелец */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
                  <User size={10} className="text-blue-500" />
                  <span className="text-[8px] font-black uppercase text-gray-300 tracking-tighter">
                    {figure.authorName || 'Anon'}
                  </span>
                </div>
              </div>

              {/* Инфо */}
              <div className="p-4 text-left space-y-2 flex-grow">
                <p className="text-[8px] text-blue-500 font-black uppercase tracking-widest truncate italic">
                  {figure.anime}
                </p>
                <h3 className="text-sm font-black text-white uppercase italic leading-tight line-clamp-2 group-hover:text-blue-500 transition-colors">
                  {figure.name}
                </h3>
                <div className="pt-2 flex items-center justify-between border-t border-[#333]">
                  <span className="text-[9px] text-gray-600 font-bold uppercase">
                    {figure.brand}
                  </span>
                  <Link
                    to={`/figure/${figure.id}`}
                    className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors text-gray-500 hover:text-white"
                  >
                    <Info size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;
