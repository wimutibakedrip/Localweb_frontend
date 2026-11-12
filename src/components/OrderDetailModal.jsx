import React from 'react';

// บล็อกดักคีย์ตัวแปรด้านบนสุด ปรับเปลี่ยนเป็นชุดนี้:
export default function OrderDetailModal({ order, onClose }) {
  if (!order || typeof order !== 'object' || Object.keys(order).length === 0) {
    return null;
  }

  const orderId = order.id ?? 'ไม่ระบุไอดี';
  const customerName = order.customer_name || 'ไม่ระบุชื่อ (ลูกค้าหน้าร้าน)';
  const orderStatus = order.status || 'รอดำเนินการ';
  const totalPrice = order.total_price ?? 0;
  const orderNotes = order.notes || '';
  const paymentMethod = order.payment_method || '';

  // 💡 แก้ไขจุดนี้: ป้องกันชื่อคีย์ส่งมาไม่ตรง รองรับทั้ง .items และ .order_items
  const rawItems = order.items || order.order_items || [];
  const orderItems = Array.isArray(rawItems) ? rawItems : [];


  // จัดฟอร์แมตวันที่แบบปลอดภัย
  let formattedDate = 'ไม่ระบุเวลา';
  if (order.created_at) {
    try {
      formattedDate = new Date(order.created_at).toLocaleString('th-TH') + ' น.';
    } catch (e) {
      console.error("รูปแบบวันที่ผิดพลาด:", e);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ฉากหลังโปร่งแสงเบลอตา */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* กล่องหน้าต่างหลัก */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full border-2 border-[#4A2810] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* ส่วนหัวหน้าต่าง */}
        <div className="p-6 bg-[#FFF0E6] border-b-2 border-[#FFE0CC] flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-[#4A2810]">📄 รายละเอียดออเดอร์ #{orderId}</h3>
            <p className="text-xs text-gray-500 mt-0.5">สั่งซื้อเมื่อ: {formattedDate}</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 font-bold text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ส่วนเนื้อหาหลัก */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* ข้อมูลสรุปลูกค้าและสถานะออเดอร์ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-2 rounded-2xl border border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-400 block uppercase">👤 ชื่อลูกค้า / โต๊ะ</span>
              <span className="font-bold text-[#4A2810]">{customerName}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 block uppercase">⏳ สถานะคิวปัจจุบัน</span>
              <span className="inline-block text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg mt-0.5">
                {orderStatus}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 block uppercase">💵 การจ่ายเงิน</span>
              <span className="inline-block text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg mt-0.5">
                {paymentMethod}
              </span>
            </div>
          </div>

          {/* ตารางรายการสินค้า */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-amber-50/50 text-[#805030] text-xs font-bold border-b border-gray-200">
                  <th className="p-3">รายการขนม / เครื่องดื่ม</th>
                  <th className="p-3 text-right w-24">ราคา/หน่วย</th>
                  <th className="p-3 text-center w-20">จำนวน</th>
                  <th className="p-3 text-right w-24">รวม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* 🆕 นำรายการมา map แปลงโครงสร้างชั่วคราวก่อนเพื่อเอาชื่อสินค้ามาใช้จัดเรียง */}
                {orderItems
                  .map((item) => {
                    if (!item) return null;
                    
                    // ดึงชื่อขนมออกมาเตรียมไว้สำหรับใช้เรียงลำดับ
                    let productName = `🍰 สินค้าเบเกอรี่ (ID: #${item.product_id ?? '?'})`;
                    if (item.product && typeof item.product === 'object') {
                        productName = item.product.name || productName;
                    } else if (item.product_name) {
                        productName = item.product_name;
                    }

                    return { ...item, _computedName: productName };
                  })
                  .filter(Boolean) // กรองค่า null ออก
                  .sort((a, b) => {
                    // 🆕 จัดเรียงตามชื่อสินค้าภาษาไทย (ก-ฮ) เพื่อง่ายต่อการตรวจ
                    const nameCompare = a._computedName.localeCompare(b._computedName, 'th');
                    if (nameCompare !== 0) return nameCompare;
                    // ถ้าชื่อเหมือนกัน ให้เรียงตามข้อความพิเศษต่อ (ถ้ามี)
                    return (a.custom_text || '').localeCompare(b.custom_text || '', 'th');
                  })
                  .map((item, idx) => {
                    // ดักราคาต่อหน่วย
                    const itemPrice = item.price ?? item.price_at_purchase ?? 0;
                    
                    // ดักจำนวน
                    const itemQty = item.quantity ?? 0;
                    
                    // คำนวณราคารวมต่อแถว
                    const itemTotal = itemPrice * itemQty;

                    return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-semibold text-gray-800">
                            <div>{item._computedName}</div>
                            {item.custom_text && (
                            <div className="text-xs text-[#FF5500] italic mt-0.5 font-normal">
                                ✍️ ข้อความพิเศษ: "{item.custom_text}"
                            </div>
                            )}
                        </td>
                        {/* แสดงราคาต่อหน่วย */}
                        <td className="p-3 text-right text-gray-600">
                            {Number(itemPrice).toFixed(2)} ฿
                        </td>
                        {/* แสดงจำนวนชิ้น */}
                        <td className="p-3 text-center font-bold text-gray-700">
                            {itemQty}
                        </td>
                        {/* แสดงราคารวมสุทธิประจำแถว */}
                        <td className="p-3 text-right font-black text-[#4A2810]">
                            {Number(itemTotal).toFixed(2)} ฿
                        </td>
                        </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* ข้อความหมายเหตุเพิ่มเติมถึงห้องครัว */}
          {orderNotes && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
              <span className="text-xs font-bold text-[#805030] block mb-1">📌 หมายเหตุกำกับเพิ่มเติม:</span>
              <p className="text-sm text-gray-700 italic">"{orderNotes}"</p>
            </div>
          )}
        </div>

        {/* ส่วนท้ายหน้าต่างสรุปบิลรวมสุทธิ */}
            <div className="p-6 bg-[#FFF0E6] border-t-2 border-[#FFE0CC] space-y-2">
            {/* แถวที่ 1: ราคารวมก่อนหักลด */}
            <div className="flex justify-between items-center text-sm font-semibold text-[#805030]">
                <span>รวมเป็นเงิน:</span>
                <span>{(order.subtotal_price ?? totalPrice).toFixed(2)} ฿</span>
            </div>
            
            {/* แถวที่ 2: มูลค่าส่วนลดที่ได้รับ */}
            <div className="flex justify-between items-center text-sm font-bold text-red-600">
                <span>ส่วนลดทั้งหมด:</span>
                <span>-{Number(order.discount_price ?? 0).toFixed(2)} ฿</span>
            </div>
            
            {/* แถวที่ 3: สรุปยอดเงินสุทธิรวมสุดท้ายที่ต้องจ่ายจริง */}
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#FF7F32]/30">
                <div className="text-sm text-gray-500 font-bold">ยอดชำระเงินสุทธิ (Grand Total)</div>
                <div className="text-2xl font-black text-[#FF5500]">
                {Number(order.grandtotal_price ?? totalPrice).toFixed(2)} <span className="text-base font-bold text-[#4A2810]">฿</span>
                </div>
            </div>
            </div>
      </div>
    </div>
  );
}
