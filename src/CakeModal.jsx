import React from 'react';

export default function CakeModal({
  selectedProduct,
  setSelectedProduct,
  customText,
  setCustomText,
  addToCart
}) {
  if (!selectedProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
        onClick={() => setSelectedProduct(null)} 
      />
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative z-10 border-2 border-[#FF7F32] shadow-2xl">
        <h3 className="text-lg font-black text-[#4A2810] mb-1">🍰 แต่งหน้าเค้กพิเศษ</h3>
        <p className="text-xs text-[#805030] mb-4">{selectedProduct.name}</p>
        
        <textarea 
          rows="3" 
          maxLength="50" 
          placeholder="พิมพ์ข้อความที่ต้องการเขียนบนหน้าเค้ก..." 
          value={customText} 
          onChange={(e) => setCustomText(e.target.value)} 
          className="w-full p-3 rounded-xl border border-[#FFE0CC] focus:border-[#FF7F32] focus:outline-none text-sm font-medium text-[#4A2810] resize-none mb-4" 
        />
        
        <div className="flex gap-3">
          <button 
            onClick={() => { setSelectedProduct(null); setCustomText(""); }} 
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button 
            onClick={() => addToCart(selectedProduct, customText)} 
            className="flex-1 bg-[#FF5500] hover:bg-[#CC4400] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
          >
            ❤️ เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </div>
  );
}
