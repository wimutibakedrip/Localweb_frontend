import React from 'react';

export default function ProductOrderDetailsModal({ isOpen, onClose, productName, buyersData, categoryName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ฉากหลังโปร่งแสงเบลอตา */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* กล่องหน้าต่างหลัก */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full border-2 border-[#4A2810] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* ส่วนหัวหน้าต่าง */}
        <div className="p-5 bg-[#FFF0E6] border-b-2 border-[#FFE0CC] flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-[#4A2810]">📊 เจาะลึกประวัติเมนูขายดี</h3>
            <p className="text-xs text-[#FF5500] mt-0.5 font-bold">เมนู: {productName}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">✕</button>
        </div>

        {/* ส่วนเนื้อหาตารางหลัก */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {buyersData.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-400 font-medium">ไม่พบประวัติข้อมูลผู้ซื้อในช่วงเวลาดังกล่าว</p>
          ) : (
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-50/50 text-[#805030] font-bold border-b border-gray-200">
                    <th className="p-3">ชื่อสินค้า</th>
                    <th className="p-3">ชื่อลูกค้า / โต๊ะ</th>
                    <th className="p-3 text-right w-24">จำนวน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {buyersData.map((buyer, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-bold text-gray-800">{productName}</td>
                      <td className="p-3 text-gray-600 font-medium">{buyer.customer_name}</td>
                      <td className="p-3 text-right font-black text-[#4A2810]">
                        {buyer.qty} {categoryName === '🥤 เครื่องดื่ม' || categoryName === 'เครื่องดื่ม' ? 'แก้ว' : 'ชิ้น'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ส่วนปุ่มปิดท้าย */}
        <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
