import React, { useState, useEffect, FormEvent } from 'react';
import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider';
import { useI18n } from '../app/i18n/I18nProvider';
import { useFeedback } from '../app/providers/feedbackContext';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initializing } = useAuth();
  const { t } = useI18n();
  const { notify } = useFeedback();
  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  useEffect(() => {
    if (!initializing && user) navigate(destination, { replace: true });
  }, [destination, initializing, navigate, user]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // REGISTRATION
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
      navigate(destination, { replace: true });
    } catch (error: unknown) {
      notify(error instanceof Error ? error.message : t('login.authFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-[#1a1a1a] rounded-[2rem] sm:rounded-[2.5rem] border border-[#333] p-6 sm:p-8 md:p-9 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-500 mb-2">
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            {isLogin ? t('login.welcome') : t('login.create')}
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            {isLogin ? t('login.accessArchive') : t('login.startJourney')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Name Field (Sign Up only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
                {t('login.name')}
              </label>
              <input
                type="text"
                placeholder={t('login.namePlaceholder')}
                className="w-full bg-[#121212] border border-[#333] rounded-2xl py-4 px-5 outline-none focus:border-blue-500 transition-all font-bold text-white text-base placeholder:text-gray-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
              {t('login.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full bg-[#121212] border border-[#333] rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-blue-500 transition-all font-bold text-white text-base placeholder:text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
              {t('login.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-[#333] rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-blue-500 transition-all font-bold text-white text-base placeholder:text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic tracking-widest text-white hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              t('login.signIn')
            ) : (
              t('login.register')
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors"
          >
            {isLogin ? t('login.noAccount') : t('login.hasAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
