import React, { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Layers } from 'lucide-react';

// Типизация для данных бренда
interface BrandDataItem {
  name: string;
  value: number;
}

// Типизация для общей статистики
interface CollectionStats {
  count: number;
}

// Пропсы для CustomTooltip (используем встроенный тип Recharts)
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-[#333] shadow-2xl text-left backdrop-blur-md">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none italic">
          {payload[0].name}
        </p>
        <p className="text-sm font-black text-blue-500 italic leading-none">
          {payload[0].value} Units
        </p>
      </div>
    );
  }
  return null;
};

interface BrandsSplitProps {
  brandData: BrandDataItem[];
  collectionStats: CollectionStats;
  COLORS: string[];
}

const BrandsSplit: FC<BrandsSplitProps> = ({ brandData, collectionStats, COLORS }) => {
  // Ограничиваем данные топ-5 брендами для визуальной чистоты
  const topBrands = brandData.slice(0, 5);

  return (
    <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] shadow-2xl min-h-[400px] flex flex-col text-left">
      <div className="flex items-center justify-between mb-8 text-left">
        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic text-left">
          Brands Split
        </h4>
        <Layers size={14} className="text-gray-700" />
      </div>

      <div className="flex flex-col gap-6 text-left">
        {/* Секция с кольцевым графиком */}
        <div className="h-40 w-full relative text-left">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topBrands}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {topBrands.map((brand, i) => (
                  <Cell key={`cell-${brand.name}-${i}`} fill={COLORS[i % COLORS.length] || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Центральный текст внутри графика */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[18px] font-black text-white italic leading-none">
              {collectionStats.count}
            </p>
            <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest">Units</p>
          </div>
        </div>

        {/* Список брендов с прогресс-барами */}
        <div className="space-y-4 text-left">
          {topBrands.map((brand, i) => (
            <div key={`brand-list-${i}`} className="space-y-1.5 text-left">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2 text-left">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <p className="text-[10px] font-black text-white uppercase italic truncate max-w-[120px] text-left">
                    {brand.name}
                  </p>
                </div>
                <p className="text-[10px] font-black text-blue-500 italic text-left">
                  {brand.value} Units
                </p>
              </div>

              {/* Линия прогресса */}
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden text-left">
                <div
                  className="h-full transition-all duration-1000 ease-out text-left"
                  style={{
                    width: `${
                      collectionStats.count > 0 ? (brand.value / collectionStats.count) * 100 : 0
                    }%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandsSplit;
