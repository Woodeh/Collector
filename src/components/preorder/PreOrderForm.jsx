import React from 'react';
import { X, Camera } from 'lucide-react';
import AnimeSearch from '../AnimeSearch';

export default function PreOrderForm({
  showForm,
  setShowForm,
  formData,
  setFormData,
  formCurrency,
  setFormCurrency,
  screenshotPreview,
  handleFileChange,
  handleSubmit,
  submitting,
  resetForm,
}) {
  if (!showForm) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#1a1a1a] border border-[#333] w-full max-w-lg rounded-[3rem] p-10 relative my-auto animate-in zoom-in duration-300 shadow-2xl text-left">
        <button
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-50 cursor-pointer"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-black mb-8 uppercase italic tracking-tighter text-white">
          New Pre-Order
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            placeholder="Figure Name *"
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <AnimeSearch
            value={formData.anime}
            onChange={(val) => setFormData({ ...formData, anime: val })}
          />
          <input
            placeholder="Brand / Manufacturer"
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-orange-500 transition-colors text-white font-bold"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          />
          <select
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold appearance-none cursor-pointer"
            value={formCurrency}
            onChange={(e) => setFormCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="KZT">KZT (₸)</option>
            <option value="CNY">CNY (¥)</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.01"
              placeholder="Total Price"
              className="bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
              value={formData.totalPrice}
              onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Deposit Paid"
              className="bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
              value={formData.deposit}
              onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              required
            />
          </div>
          <input
            type="date"
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            required
          />
          <input
            placeholder="Est. Release"
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl text-white font-bold"
            value={formData.releaseDate}
            onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
            required
          />
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-[#333] rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
            {screenshotPreview ? (
              <img
                src={screenshotPreview}
                className="w-full h-full object-cover rounded-xl opacity-60"
                alt="Preview"
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Camera className="text-gray-500" size={24} />
                <span className="text-[10px] text-gray-500 font-black uppercase">
                  Upload Screenshot
                </span>
              </div>
            )}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
          </label>
          <button
            disabled={submitting}
            className="w-full bg-orange-600 py-4 rounded-2xl font-black text-lg hover:bg-orange-500 text-white transition-all shadow-xl uppercase italic tracking-widest cursor-pointer"
          >
            {submitting ? 'SAVING...' : 'ADD TO PRE-ORDERS'}
          </button>
        </form>
      </div>
    </div>
  );
}
