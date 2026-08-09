import { Languages } from 'lucide-react';
import { useI18n } from '../app/i18n/I18nProvider';

const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="flex items-center rounded-xl border border-[#333] bg-[#121212] p-1" aria-label={t('language.label')}>
      <Languages size={14} className="mx-2 text-gray-500" aria-hidden="true" />
      {(['ru', 'en'] as const).map((item) => (
        <button key={item} type="button" onClick={() => setLocale(item)} aria-pressed={locale === item}
          className={`rounded-lg px-2 py-1.5 text-[10px] font-black uppercase transition-colors ${locale === item ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>
          {item}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
