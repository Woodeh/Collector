import React from 'react';
import { Info, Tag, DollarSign, ChevronDown } from 'lucide-react';
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
}) => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <h3 className="text-blue-500 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.25em] flex items-center gap-2 italic">
        <Info size={14} /> Basic Information
      </h3>

      <CharacterSearch value={formData.name} onChange={(val) => handleCustomChange('name', val)} />

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
            className="w-full bg-[#121212] border border-[#333] h-[58px] pl-12 rounded-2xl outline-none focus:border-blue-500 font-bold text-white text-sm transition-all placeholder:text-gray-700 placeholder:italic"
            onChange={handleChange}
            value={formData.price}
            required
          />
        </div>
        <div className="relative w-28 group">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-[58px] bg-[#121212] border border-[#333] px-4 rounded-2xl text-white font-bold text-sm appearance-none outline-none cursor-pointer hover:bg-[#181818] transition-all focus:border-blue-500 pr-10"
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
