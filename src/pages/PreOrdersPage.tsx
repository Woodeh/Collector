import React, { useState, useEffect } from 'react';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../app/providers/AuthProvider';
import { useI18n } from '../app/i18n/I18nProvider';

import {
  PreOrderHeader,
  PreOrderGrid,
  PreOrderForm,
  PreOrderLightbox,
} from '../entities/preorder';
import type { PreOrder, PreOrderFormData } from '../entities/preorder/model';
import PreOrderContactSummary from '../entities/preorder/PreOrderContactSummary';
import {
  createPreOrder,
  deletePreOrder,
  subscribeToPreOrders,
  markSellerContacted,
} from '../entities/preorder/preOrderRepository';
import PageState from '../shared/PageState';

export type Currency = 'USD' | 'KZT' | 'CNY';

const PreOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [preorders, setPreorders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState(false);
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
    sellerName: '', sellerContactUrl: '', lastContactedAt: new Date().toISOString().split('T')[0] ?? '',
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setLoadError(false);
    const unsubscribeSnap = subscribeToPreOrders(
      user.uid,
      (snapshot) => {
        setPreorders(snapshot);
        setLoading(false);
      },
      (error) => {
        console.error('Pre-orders subscription failed:', error);
        setLoadError(true);
        setLoading(false);
      },
    );
    return unsubscribeSnap;
  }, [user]);

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
      sellerName: '', sellerContactUrl: '', lastContactedAt: new Date().toISOString().split('T')[0] ?? '',
    });
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setFormCurrency('USD');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = user;
    if (!currentUser) return alert(t('preorders.sessionExpired'));

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
        const fileRef = ref(
          storage,
          `preorders/${currentUser.uid}/${Date.now()}_${screenshotFile.name}`,
        );
        await uploadBytes(fileRef, screenshotFile);
        screenshotUrl = await getDownloadURL(fileRef);
      }

      await createPreOrder(
        currentUser.uid,
        currentUser.displayName || (currentUser.email?.split('@')[0] ?? 'Unknown'),
        {
          ...formData,
          totalPrice: Number(finalPrice.toFixed(2)),
          deposit: Number(finalDeposit.toFixed(2)),
          screenshot: screenshotUrl,
        },
      );

      setShowForm(false);
      resetForm();
    } catch (error: unknown) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unable to save pre-order'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('preorders.deleteConfirm'))) {
      await deletePreOrder(id);
    }
  };

  const handleContacted = async (item: PreOrder) => {
    await markSellerContacted(item.id, item.contactCount);
  };

  if (loading) return <PageState type="loading" message={t('preorders.syncing')} accentClass="text-orange-500" />;
  if (loadError) return <PageState type="error" accentClass="text-orange-500" />;

  return (
    <div className="min-h-screen bg-[#121212] p-3 sm:p-5 md:p-6 text-[#e4e4e4] overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <PreOrderHeader onAddClick={() => setShowForm(true)} />
        <PreOrderContactSummary preorders={preorders} />

        <PreOrderGrid
          preorders={preorders}
          onDelete={handleDelete}
          onImageClick={setSelectedImage}
          onContacted={handleContacted}
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
