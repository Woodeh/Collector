import React, { useState, useEffect, useCallback } from 'react';
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
import { useFeedback } from '../app/providers/feedbackContext';
import { revokeObjectUrl, validateImageFile } from '../shared/lib/imageFiles';

export type Currency = 'USD' | 'KZT' | 'CNY';

const PreOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { notify, confirm } = useFeedback();
  const [preorders, setPreorders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formCurrency, setFormCurrency] = useState<Currency>('USD');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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

  useEffect(() => () => revokeObjectUrl(screenshotPreview), [screenshotPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) { notify(t(`image.${validationError}`), 'error'); e.target.value = ''; return; }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = useCallback(() => {
    setFormErrors({});
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = user;
    if (!currentUser) { notify(t('preorders.sessionExpired'), 'error'); return; }

    const errors: Record<string, string> = {};
    const total = Number(formData.totalPrice);
    const deposit = Number(formData.deposit);
    if (!formData.name.trim()) errors.name = t('validation.required');
    if (!formData.anime.trim()) errors.anime = t('validation.required');
    if (formData.totalPrice === '' || total < 0) errors.totalPrice = t('validation.price');
    if (formData.deposit === '' || deposit < 0) errors.deposit = t('validation.price');
    else if (deposit > total) errors.deposit = t('validation.deposit');
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const cachedStr = localStorage.getItem('kzt_rate_data');
      let kztRate = 450;
      if (cachedStr) {
        try {
          const cached: unknown = JSON.parse(cachedStr);
          if (
            cached &&
            typeof cached === 'object' &&
            'rate' in cached &&
            typeof cached.rate === 'number' &&
            Number.isFinite(cached.rate) &&
            cached.rate > 0
          ) {
            kztRate = cached.rate;
          }
        } catch {
          localStorage.removeItem('kzt_rate_data');
        }
      }
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
      notify(t('common.saved'), 'success');
    } catch (error: unknown) {
      notify(error instanceof Error ? error.message : t('common.operationError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ title: t('common.delete'), message: t('preorders.deleteConfirm'), confirmLabel: t('common.delete'), danger: true });
    if (!confirmed) return;
    try {
      await deletePreOrder(id);
      notify(t('common.deleted'), 'success');
    } catch {
      notify(t('common.operationError'), 'error');
    }
  };

  const handleContacted = async (item: PreOrder) => {
    await markSellerContacted(item.id, item.contactCount);
  };

  if (loading) return <PageState type="loading" message={t('preorders.syncing')} accentClass="text-orange-500" />;
  if (loadError) return <PageState type="error" accentClass="text-orange-500" />;

  return (
    <div className="app-page text-[#e4e4e4]">
      <div className="app-container">
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
          errors={formErrors}
        />

        <PreOrderLightbox selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
      </div>
    </div>
  );
};

export default PreOrdersPage;
