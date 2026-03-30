import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Прокрутка в самое начало страницы
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
