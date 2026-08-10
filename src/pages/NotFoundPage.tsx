import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../app/i18n/I18nProvider';

const NotFoundPage = () => {
  const { t } = useI18n();
  return (
    <section className="flex min-h-[70dvh] items-center justify-center bg-[#121212] px-4 text-center">
      <div className="max-w-lg">
        <SearchX className="mx-auto mb-5 text-blue-500" size={52} aria-hidden="true" />
        <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-blue-500">404</p>
        <h1 className="text-3xl font-black uppercase italic text-white sm:text-5xl">{t('notFound.title')}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500">{t('notFound.description')}</p>
        <Link to="/" className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          <ArrowLeft size={16} aria-hidden="true" /> {t('notFound.home')}
        </Link>
      </div>
    </section>
  );
};

export default NotFoundPage;
