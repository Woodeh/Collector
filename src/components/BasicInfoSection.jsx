import React from 'react';
import { Info, Tag, DollarSign, ChevronDown, Camera, X } from 'lucide-react';
import CharacterSearch from './CharacterSearch';
import AnimeSearch from './AnimeSearch';
import CustomSelect from './Select';

const BasicInfoSection = ({
  formData,
  handleCustomChange,
  brandOptions,
  currency,
  setCurrency,
  handleChange,
  onCharArtFileChange,
}) => {
  const handleCharFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onCharArtFileChange(file);
      // Создаем временный URL для превью в форме
      handleCustomChange('characterImage', URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <h3 className="text-blue-500 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.25em] flex items-center gap-2 italic">
        <Info size={14} /> Basic Information
      </h3>

      <div className="space-y-3">
        <CharacterSearch
          value={formData.name}
          onChange={(selection) => {
            if (typeof selection === 'object') {
              handleCustomChange('name', selection.name);
              handleCustomChange('characterId', selection.mal_id);
              handleCustomChange('characterImage', selection.image);
              onCharArtFileChange(null); // Сбрасываем файл, если выбрали из API
            } else {
              handleCustomChange('name', selection);
              handleCustomChange('characterId', null);
              // Не сбрасываем картинку сразу, чтобы не удалять превью при печати
            }
          }}
        />

        {/* Блок ручной загрузки арта */}
        <div className="flex items-center gap-3 px-1">
          <label className="cursor-pointer group flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center group-hover:border-blue-500 transition-colors">
              <Camera size={14} className="text-gray-500 group-hover:text-blue-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
              {formData.characterImage ? 'Change Character Art' : 'Upload Manual Art'}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleCharFileChange}
            />
          </label>

          {formData.characterImage && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <img
                  src={formData.characterImage}
                  className="w-full h-full object-cover"
                  alt="preview"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  handleCustomChange('characterImage', '');
                  onCharArtFileChange(null);
                }}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-[60]">
        <AnimeSearch value={formData.anime} onChange={(val) => handleCustomChange('anime', val)} />
      </div>

      <CustomSelect
        icon={Tag}
        options={brandOptions}
        value={formData.brand}
        onChange={(val) => handleCustomChange('brand', val)}
      />

      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <DollarSign
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            name="price"
            type="number"
            placeholder={`Price *`}
            className="w-full bg-[#121212] border border-[#333] h-[58px] pl-12 rounded-2xl outline-none focus:border-blue-500 font-bold text-white text-base transition-all placeholder:text-gray-700 placeholder:italic"
            onChange={handleChange}
            value={formData.price}
            required
          />
        </div>
        <div className="relative w-28 group">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-[58px] bg-[#121212] border border-[#333] px-4 rounded-2xl text-white font-bold text-base appearance-none outline-none cursor-pointer hover:bg-[#181818] transition-all focus:border-blue-500 pr-10"
          >
            <option value="USD">USD</option>
            <option value="KZT">KZT</option>
            <option value="CNY">CNY</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 pointer-events-none transition-colors"
          />
        </div>
      </div>

      <CustomSelect
        options={[
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
        ]}
        value={formData.gender}
        onChange={(val) => handleCustomChange('gender', val)}
      />
    </div>
  );
};

export default BasicInfoSection;
