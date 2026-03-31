import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScroll, useTransform } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

import {
  LandingBackground,
  HeroSection,
  CommunityTeaser,
  FeaturesSection,
  FinalCTA,
} from '../components/landing';

interface Figure {
  id: string;
  name: string;
  anime: string;
  price: number;
  previewImage: string;
  [key: string]: any;
}

const generatePlaceholders = (): Figure[] => [
  {
    id: 'p1',
    name: 'Eva Unit-01',
    anime: 'Evangelion',
    price: 180,
    previewImage: 'https://images.unsplash.com/photo-1559535332-db9971090158?q=80&w=800',
  },
  {
    id: 'p2',
    name: 'Cyberpunk Edgerunner',
    anime: 'Night City',
    price: 120,
    previewImage: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=800',
  },
  {
    id: 'p3',
    name: 'Ghost in the Shell',
    anime: 'Section 9',
    price: 250,
    previewImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=800',
  },
  {
    id: 'p4',
    name: 'Prototype Asset',
    anime: 'Vault Dev',
    price: 300,
    previewImage: 'https://images.unsplash.com/photo-1560439514-4e9643e39404?q=80&w=800',
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [communityFigures, setCommunityFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Параллакс логика
  const { scrollYProgress } = useScroll();

  // Фоновые слои: сетка и "плавающий" текст для экстремальной глубины
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const floatingTextY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);

  // Параллакс для контента Hero: заголовок, описание и кнопки улетают с разной скоростью
  const titleY = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const descY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    const fetchTeaser = async () => {
      try {
        setLoading(true);
        // Для "Live Database Scan" и "real-time additions" логично показывать последние добавленные.
        // Убедитесь, что у вас есть индекс для 'createdAt' в Firebase Console,
        // иначе этот запрос может не работать или быть неэффективным.
        const q = query(collection(db, 'figures'), orderBy('createdAt', 'desc'), limit(15));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Figure);

        if (data.length > 0) {
          setCommunityFigures(data);
        } else {
          // Если в базе пусто, используем демо-данные для красоты
          setCommunityFigures(generatePlaceholders());
        }
      } catch (e) {
        console.warn('Firebase access denied or error, showing placeholders', e);
        setCommunityFigures(generatePlaceholders());
      } finally {
        setLoading(false);
      }
    };
    fetchTeaser();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e4e4] font-sans selection:bg-blue-500/30 overflow-x-hidden text-left">
      <LandingBackground backgroundY={backgroundY} floatingTextY={floatingTextY} />

      <HeroSection
        titleY={titleY}
        opacityHero={opacityHero}
        descY={descY}
        onLogin={() => navigate('/login')}
        onExplore={() => {
          const el = document.getElementById('community-scan');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <CommunityTeaser
        loading={loading}
        communityFigures={communityFigures}
        onJoin={() => navigate('/login')}
      />

      <FeaturesSection />

      <FinalCTA onLogin={() => navigate('/login')} />
    </div>
  );
};

export default LandingPage;
