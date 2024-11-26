import React from 'react';

const PaymentSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-8">
          Bei uns können Sie bequem online bezahlen
        </h2>
        <div className="flex justify-center items-center gap-4 mb-8">
          <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
               alt="PayPal" 
               className="h-8 object-contain" />
          <img src="https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png" 
               alt="VISA" 
               className="h-8 object-contain" />
          <img src="https://brand.mastercard.com/content/dam/mccom/brandcenter/thumbnails/mastercard_vrt_pos_92px_2x.png" 
               alt="Mastercard" 
               className="h-8 object-contain" />
        </div>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-md font-medium transition-colors"
        >
          Jetzt Beantragen
        </button>
      </div>
    </section>
  );
};

export default PaymentSection;