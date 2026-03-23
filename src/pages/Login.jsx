import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Вход выполнен!');
      navigate('/add'); // После входа кидаем на страницу добавления
    } catch (error) {
      alert('Ошибка входа: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[#1a1a1a] rounded-2xl border border-[#333]">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <LogIn className="text-blue-500" /> Вход для админа
      </h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input
              type="email"
              className="w-full bg-[#121212] border border-[#333] rounded-lg py-2 pl-10 pr-4 outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Пароль</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 text-gray-500" size={18} />
            <input
              type="password"
              className="w-full bg-[#121212] border border-[#333] rounded-lg py-2 pl-10 pr-4 outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Войти
        </button>
      </form>
    </div>
  );
};

export default Login;
