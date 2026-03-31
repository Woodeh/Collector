import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../firebase/config';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2 } from 'lucide-react';

import {
  PreOrderHeader,
  PreOrderGrid,
  PreOrderForm,
  PreOrderLightbox,
} from '../components/preorder';

export interface PreOrder {
  id: string;
  name: string;
  anime: string;
  brand: string;
  totalPrice: number;
  deposit: number;
  releaseDate: string;
  paymentDate: string;
  screenshot?: string;
  userId: string;
  createdAt: any;
  authorName: string;
}

export interface PreOrderFormData {
  name: string;
  anime: string;
  brand: string;
  totalPrice: string | number;
  deposit: string | number;
  releaseDate: string;
  paymentDate: string;
}

export type Currency = 'USD' | 'KZT' | 'CNY';

const PreOrdersPage: React.FC = () => {
  const [preorders, setPreorders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formCurrency, setFormCurrency] = useState<Currency>('USD');
  const [formData, setFormData] = useState<PreOrderFormData>({
    name: '',
    anime: '',
    brand: '',
    totalPrice: '',
    deposit: '',
    releaseDate: '',
    paymentDate: new Date().toISOString().split('T')[0] ?? '',
  });

  useEffect(() => {
    let unsubscribeSnap: Unsubscribe | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const q = query(
          collection(db, 'preorders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
        );
        unsubscribeSnap = onSnapshot(q, (snapshot) => {
          setPreorders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PreOrder)));
          setLoading(false);
        });
      } else {
        setPreorders([]);
        setLoading(false);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnap) unsubscribeSnap();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      anime: '',
      brand: '',
      totalPrice: '',
      deposit: '',
      releaseDate: '',
      paymentDate: new Date().toISOString().split('T')[0] ?? '',
    });
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setFormCurrency('USD');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return alert('Session expired.');

    setSubmitting(true);
    try {
      const cachedStr = localStorage.getItem('kzt_rate_data');
      const cached = cachedStr ? JSON.parse(cachedStr) : { rate: 450 };
      const kztRate = cached.rate;
      const cnyRate = 7.2;

      let finalPrice = Number(formData.totalPrice);
      let finalDeposit = Number(formData.deposit);

      if (formCurrency === 'KZT') {
        finalPrice /= kztRate;
        finalDeposit /= kztRate;
      } else if (formCurrency === 'CNY') {
        finalPrice /= cnyRate;
        finalDeposit /= cnyRate;
      }

      let screenshotUrl = '';
      if (screenshotFile) {
        const fileRef = ref(storage, `preorders/${Date.now()}_${screenshotFile.name}`);
        await uploadBytes(fileRef, screenshotFile);
        screenshotUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'preorders'), {
        ...formData,
        userId: currentUser.uid,
        totalPrice: Number(finalPrice.toFixed(2)),
        deposit: Number(finalDeposit.toFixed(2)),
        screenshot: screenshotUrl,
        createdAt: new Date(),
        authorName: currentUser.displayName || (currentUser.email?.split('@')[0] ?? 'Unknown'),
      });

      setShowForm(false);
      resetForm();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this pre-order?')) {
      await deleteDoc(doc(db, 'preorders', id));
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#121212] gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          Syncing with server...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#121212] p-6 text-[#e4e4e4] overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <PreOrderHeader onAddClick={() => setShowForm(true)} />

        <PreOrderGrid
          preorders={preorders}
          onDelete={handleDelete}
          onImageClick={setSelectedImage}
        />

        <PreOrderForm
          showForm={showForm}
          setShowForm={setShowForm}
          formData={formData}
          setFormData={setFormData}
          formCurrency={formCurrency}
          setFormCurrency={setFormCurrency}
          screenshotPreview={screenshotPreview}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          submitting={submitting}
          resetForm={resetForm}
        />

        <PreOrderLightbox selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
      </div>
    </div>
  );
};

export default PreOrdersPage;