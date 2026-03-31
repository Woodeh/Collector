import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Boxes, Activity, Shield } from 'lucide-react';

const QuickActionLink = ({ to, icon, label, color }) => {
  const colorClasses =
    color === 'blue'
      ? 'text-blue-500 border-blue-500/20 bg-blue-500/5 hover:bg-blue-600 hover:text-white hover:border-blue-500'
      : 'text-gray-400 border-[#333] bg-[#1a1a1a] hover:bg-white hover:text-black hover:border-white';

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center rounded-[2rem] border transition-all duration-500 group ${colorClasses} shadow-lg`}
    >
      <div className="mb-2 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
        {icon}
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{label}</span>
    </Link>
  );
};

const QuickActions = () => {
  return (
    <div className="lg:col-span-5 grid grid-cols-2 gap-4">
      <QuickActionLink to="/add" icon={<Plus size={24} />} label="Add Asset" color="blue" />
      <QuickActionLink
        to="/collection"
        icon={<Boxes size={24} />}
        label="View Vault"
        color="gray"
      />
      <QuickActionLink to="/community" icon={<Activity size={24} />} label="Network" color="blue" />
      <QuickActionLink to="/profile" icon={<Shield size={24} />} label="Identity" color="gray" />
    </div>
  );
};

export default QuickActions;
