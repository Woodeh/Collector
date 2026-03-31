import React, { FC } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessData {
  img: string;
}

interface SuccessModalProps {
  data: SuccessData | null | undefined;
}

const SuccessModal: FC<SuccessModalProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative bg-[#1a1a1a] border border-[#333] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 text-center w-full max-w-sm">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic mb-6">
          Success!
        </h3>
        <img
          src={data.img}
          className="w-full aspect-[3/4] object-cover rounded-2xl mb-4 border-2 border-blue-500"
          alt="success"
        />
        <p className="text-blue-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Redirecting...
        </p>
      </div>
    </div>
  );
};

export default SuccessModal;
