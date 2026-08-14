import React, { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Boxes, Activity, Shield } from 'lucide-react';
import { useI18n } from '../../app/i18n/I18nProvider';

// Интерфейс для пропсов ссылки быстрого действия
interface QuickActionLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  color: 'blue' | 'gray';
}

const QuickActionLink: FC<QuickActionLinkProps> = ({ to, icon, label, color }) => {
  const colorClasses =
    color === 'blue'
      ? 'text-blue-500 border-blue-500/20 bg-blue-500/5 hover:bg-blue-600 hover:text-white hover:border-blue-500'
      : 'text-gray-400 border-[#333] bg-[#1a1a1a] hover:bg-white hover:text-black hover:border-white';

  return (
    <Link
      to={to}
      className={`group flex min-w-0 flex-col items-center justify-center rounded-[2rem] border px-2 py-6 text-center shadow-lg transition-[background-color,border-color,color,box-shadow] duration-500 ease-out ${colorClasses}`}
    >
      <div className="mb-2 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6">
        {icon}
      </div>
      <span className="max-w-full break-words text-[9px] font-black uppercase tracking-[0.12em] italic sm:tracking-[0.2em]">{label}</span>
    </Link>
  );
};

const QuickActions: FC = () => {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-5">
      <QuickActionLink to="/add" icon={<Plus size={24} />} label={t('home.addFigure')} color="blue" />
      <QuickActionLink
        to="/collection"
        icon={<Boxes size={24} />}
        label={t('home.viewCollection')}
        color="gray"
      />
      <QuickActionLink to="/community" icon={<Activity size={24} />} label={t('home.network')} color="blue" />
      <QuickActionLink to="/profile" icon={<Shield size={24} />} label={t('home.identity')} color="gray" />
    </div>
  );
};

export default QuickActions;
