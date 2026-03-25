import React from 'react';
import { Info, Tag } from 'lucide-react';
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
        <div className="relative flex-1">
          <input
            name="price"
            type="number"
            placeholder={`Price *`}
            className="w-full bg-[#121212] border border-[#333] p-4 rounded-xl outline-none focus:border-blue-500 font-bold text-white text-sm"
            onChange={handleChange}
            value={formData.price}
            required
          />
        </div>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-[#121212] border border-[#333] px-3 rounded-xl text-white font-black text-xs appearance-none outline-none cursor-pointer"
        >
          <option value="USD">$</option>
          <option value="KZT">₸</option>
          <option value="CNY">¥</option>
        </select>
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
