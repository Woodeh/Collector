# Figure Collector

A React + Vite application for tracking, browsing, and sharing collectible figures.

## 🚀 Технологии
- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Firebase (Firestore, Storage, Authentication)
- Framer Motion, Recharts, Lucide Icons
- DnD Kit, html2canvas, jspdf

## 📦 Быстрый запуск
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Настройте переменные окружения (рекомендуется):
   - создайте файл `.env.local` в корне проекта
   - добавьте переменные:
     ```env
     VITE_FIREBASE_API_KEY="your_api_key"
     VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
     VITE_FIREBASE_PROJECT_ID="your_project_id"
     VITE_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
     VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
     VITE_FIREBASE_APP_ID="your_app_id"
     VITE_FIREBASE_MEASUREMENT_ID="your_measurement_id"
     ```
3. Запустите локальный сервер разработки:
   ```bash
   npm run dev
   ```
4. Откройте приложение в браузере по адресу, который покажет Vite.

## 🧰 Скрипты
- `npm run dev` — запуск локальной разработки
- `npm run build` — сборка для продакшена
- `npm run preview` — превью собранного приложения
- `npm run lint` — запуск ESLint по всему проекту

## 📁 Структура папок
```
/
  public/                # статические файлы
  src/
    app/                 # провайдеры и обертки приложения
    assets/              # медиаресурсы и изображения
    components/          # мелкие UI-компоненты
    entities/            # предметно-ориентированные сущности
    features/            # отдельные фичи и формы
    firebase/            # конфигурация Firebase
    hooks/               # пользовательские React hooks
    pages/               # страницы маршрутов
    shared/              # общие компоненты и утилиты
    types/               # общие типы TypeScript
    widgets/             # крупные UI-секции
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  firebase.json
```

## 🔧 Переменные окружения
Проект инициализирует Firebase из файла `src/firebase/config.js`, но читает настройки из переменных окружения.
Чтобы вынести конфигурацию из исходников, создайте файл `.env.local` или `.env` в корне проекта и добавьте переменные с префиксом `VITE_`.

Пример переменных:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (опционально)

> В Vite все переменные окружения, доступные в браузере, должны начинаться с `VITE_`.

## 🧩 Firebase конфигурация
Текущая конфигурация находится в `src/firebase/config.js`.
Файл теперь загружает параметры из `import.meta.env.VITE_FIREBASE_*`, поэтому сами значения не должны храниться в Git.

Файл `.env.example` добавлен в репозиторий как шаблон для локальной настройки.

## ⚙️ Особенности сборки
Конфигурация `vite.config.ts` содержит ручное разделение чанков:
- `firebase-provider` для Firebase
- `ui-vendors` для `recharts` и `lucide-react`
- `vendor` для остальных зависимостей из `node_modules`

## 📝 Примечания
- Проект использует `TypeScript` в строгом режиме.
- Если вы добавляете секреты, не храните их в Git и добавьте `.env.local` в `.gitignore`.
- Для проверки качества кода запускайте `npm run lint`.
