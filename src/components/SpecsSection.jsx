import React from 'react';
import { ShieldCheck, Calendar, Sparkles, ShoppingCart } from 'lucide-react';
import DatePicker from 'react-datepicker';
import CustomSelect from './Select';

const SpecsSection = ({ formData, handleCustomChange, conditionOptions, shopOptions }) => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <h3 className="text-gray-500 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.25em] flex items-center gap-2 italic">
        <ShieldCheck size={14} /> Spec & Condition
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="relative group">
          <Calendar
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 z-10 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <DatePicker
            selected={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
            onChange={(date) =>
              handleCustomChange('purchaseDate', date ? date.toISOString().split('T')[0] : '')
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="Date"
            wrapperClassName="w-full"
            className="w-full bg-[#121212] border border-[#333] h-[58px] pl-12 rounded-2xl text-white font-bold text-base outline-none focus:border-blue-500 transition-all placeholder:text-gray-700 placeholder:font-medium placeholder:italic"
          />
        </div>
        <CustomSelect
          options={[
            { value: 'Yes', label: 'Original Box' },
            { value: 'No', label: 'No Box' },
          ]}
          value={formData.hasBox}
          onChange={(val) => handleCustomChange('hasBox', val)}
        />
      </div>
      <CustomSelect
        icon={Sparkles}
        options={conditionOptions}
        value={formData.conditionGrade}
        onChange={(val) => handleCustomChange('conditionGrade', val)}
      />
      <CustomSelect
        icon={ShoppingCart}
        options={shopOptions}
        value={formData.purchasePlace}
        onChange={(val) => handleCustomChange('purchasePlace', val)}
      />
    </div>
  );
};

export default SpecsSection;
