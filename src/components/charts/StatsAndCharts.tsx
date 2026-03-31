import React, { FC, ReactNode } from 'react';
import { DollarSign, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';

/**
 * Interfaces for Data Structures
 */
interface StatItem {
  totalValue: number;
}

interface FranchiseData {
  name: string;
  value: number;
}

interface StatsAndChartsProps {
  collectionStats: StatItem;
  preorderStats: StatItem;
  wishlistStats: StatItem;
  animeData: FranchiseData[];
}

/**
 * Custom Tooltip for the Recharts BarChart
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
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

/**
 * Component for displaying financial metrics and collection distribution charts
 */
const StatsAndCharts: FC<StatsAndChartsProps> = ({
  collectionStats,
  preorderStats,
  wishlistStats,
  animeData,
}) => {
  const financialMetrics = [
    {
      label: 'Total Value',
      val: collectionStats.totalValue,
      color: 'text-white',
      icon: <DollarSign size={18} />,
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Pre-order Debt',
      val: preorderStats.totalValue,
      color: 'text-orange-500',
      icon: <Clock size={18} />,
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Wishlist Budget',
      val: wishlistStats.totalValue,
      color: 'text-pink-500',
      icon: <Target size={18} />,
      bg: 'bg-pink-500/10',
    },
  ];

  return (
    <div className="lg:col-span-4 space-y-8">
      {/* Financial Hub Block */}
      <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] space-y-6 shadow-2xl text-left">
        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic">
          Financial Hub
        </h4>
        <div className="space-y-4">
          {financialMetrics.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-[#121212] rounded-2xl border border-white/5 transition-all hover:border-white/10"
            >
              <div className={`p-3 ${stat.bg} rounded-xl ${stat.color}`}>{stat.icon}</div>
              <div className="text-left">
                <p className="text-[8px] text-gray-500 uppercase font-black mb-1">{stat.label}</p>
                <p className={`text-xl font-black ${stat.color} italic leading-none`}>
                  ${stat.val.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Franchises Block */}
      <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[3rem] shadow-2xl h-[400px] text-left">
        <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic mb-6">
          Top Franchises
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={animeData} layout="vertical" margin={{ left: -20, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 10, fontWeight: 'bold' }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[0, 10, 10, 0]}
                barSize={20}
                className="cursor-pointer outline-none"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsAndCharts;
