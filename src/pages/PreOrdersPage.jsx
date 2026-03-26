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
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2 } from 'lucide-react';

import {
  PreOrderHeader,
  PreOrderGrid,
  PreOrderForm,
  PreOrderLightbox,
} from '../components/preorder/index.js';

const PreOrdersPage = () => {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formData, setFormData] = useState({
    name: '',
    anime: '',
    brand: '',
    totalPrice: '',
    deposit: '',
    releaseDate: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    let unsubscribeSnap = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, 'preorders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
        );
        unsubscribeSnap = onSnapshot(q, (snapshot) => {
          setPreorders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
      paymentDate: new Date().toISOString().split('T')[0],
    });
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setFormCurrency('USD');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return alert('Session expired.');

    setSubmitting(true);
    try {
      const cached = JSON.parse(localStorage.getItem('kzt_rate_data')) || { rate: 450 };
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
        authorName: currentUser.displayName || currentUser.email.split('@')[0],
      });

      setShowForm(false);
      resetForm();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
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
    <div className="min-h-screen bg-[#121212] p-6 text-[#e4e4e4]">
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
