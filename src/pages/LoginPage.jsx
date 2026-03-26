import React, { useState } from 'react';
import { auth } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, UserPlus, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Состояние: вход или регистрация
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Для регистрации
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // ВХОД
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // РЕГИСТРАЦИЯ
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Добавляем имя пользователя в профиль Firebase
        await updateProfile(userCredential.user, { displayName: name });
      }
      navigate('/'); // После успеха кидаем на главную (Dashboard)
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-[#1a1a1a] rounded-[2.5rem] border border-[#333] p-8 md:p-10 shadow-2xl">
        {/* Заголовок */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl text-blue-500 mb-2">
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            {isLogin ? 'Access your private archive' : 'Start your collector journey'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Поле ИМЯ (только для регистрации) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Name"
                className="w-full bg-[#121212] border border-[#333] rounded-2xl py-4 px-5 outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-gray-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          {/* Поле EMAIL */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full bg-[#121212] border border-[#333] rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Поле ПАРОЛЬ */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-[#333] rounded-2xl py-4 pl-12 pr-5 outline-none focus:border-blue-500 transition-all font-bold text-white placeholder:text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Кнопка действия */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase italic tracking-widest text-white hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Переключатель режимов */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
