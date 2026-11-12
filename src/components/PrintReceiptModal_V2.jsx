import React from 'react';
import {API_URL} from '../data/menuData';

export default function PrintReceiptModal_V2({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

    const handleOrderPrintRequest = async () => {
      try {
        const response = await fetch(`${API_URL}/orders/${order.id}/request-print`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            is_print_requested: true,
            is_print_order: true,
            is_print_receipt: false
          })
        });

        if (response.ok) {
          //alert("ส่งคำสั่งพิมพ์เฉพาะ 'ใบออเดอร์' ไปยังเครื่องพิมพ์ที่ร้านเรียบร้อยแล้ว!");
          onClose();
        } else {
          alert("ไม่สามารถส่งคำสั่งพิมพ์ใบออเดอร์ได้");
        }
      } catch (error) {
        console.error("Cloud Print Order Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    };

    // ฟังก์ชันกดส่งคิวพิมพ์ขึ้น Cloud Vercel
    const handleCloudPrint = async () => {
        try {
        const response = await fetch(`${API_URL}/orders/${order.id}/print-status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_printed: false }) // รีเซ็ตให้สถานะกลับมารอพิมพ์
        });

        if (response.ok) {
            //alert("ส่งคิวพิมพ์เข้าสู่ระบบ Cloud เรียบร้อย เครื่องพิมพ์ที่ร้านจะพิมพ์ออกโดยอัตโนมัติ!");
            onClose();
        } else {
            alert("ไม่สามารถส่งคิวพิมพ์ได้");
        }
        } catch (error) {
        console.error("Cloud Print Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับ Server");
        }
    };

  const handleReceiptPrintRequest = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${order.id}/request-print`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          is_print_requested: true,
          is_print_order: false,
          is_print_receipt: true
        })
      });

      if (response.ok) {
        //alert("ส่งคำสั่งพิมพ์เฉพาะ 'ใบเสร็จรับเงินและสำเนา' ไปยังเครื่องพิมพ์ที่ร้านเรียบร้อยแล้ว!");
        onClose();
      } else {
        alert("ไม่สามารถส่งคำสั่งพิมพ์ใบเสร็จได้");
      }
    } catch (error) {
      console.error("Cloud Print Receipt Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ฉากหลัง (ซ่อนเวลาสั่งพิมพ์จริงผ่าน print:hidden) */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs print:hidden" onClick={onClose} />
      
      {/* กล่องแสดงผลหน้าจอ */}
      <div className="relative bg-white rounded-2xl max-w-sm w-full border-2 border-[#4A2810] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ส่วนหัว Modal (ซ่อนเวลาสั่งพิมพ์) */}
        <div className="p-4 bg-[#FFF0E6] border-b-2 border-[#FFE0CC] flex justify-between items-center print:hidden">
          <h3 className="text-sm font-black text-[#4A2810]">🖨️ พิมพ์ Receipt/Order (กระดาษ 80mm)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">✕</button>
        </div>

        {/* ส่วนเนื้อหาใบเสร็จขนาด 80mm (พื้นที่ที่จะถูกพิมพ์ออกทางกระดาษความร้อน) */}
        <div className="p-4 overflow-y-auto space-y-2 font-mono text-xs text-black bg-white w-full max-w-[80mm] mx-auto">
          <div className="text-center space-y-0.5">
            <h2 className="text-sm font-bold">WIMUTI BAKE & DRIP</h2>
            <p className="text-[10px]">Order Ticket / ใบเสร็จ</p>s
          </div>

          <div className="border-t border-b border-dashed border-black py-1.5 space-y-0.5">
            <div className="flex justify-between">
              <span>Order:</span>
              <span className="font-bold">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>เวลา:</span>
              <span>{new Date(order.created_at).toLocaleString('th-TH')}</span>
            </div>
            <div className="flex justify-between">
              <span>ลูกค้า:</span>
              <span className="font-bold">{order.customer_name || 'หน้าร้าน'}</span>
            </div>
            <div className="flex justify-between">
              <span>ชำระ:</span>
              <span>{order.payment_method || '-'}</span>
            </div>
          </div>

          {/* รายการสินค้า */}
          <div className="space-y-1">
            <div className="font-bold border-b border-black pb-0.5 flex justify-between text-[11px]">
              <span>Qty x Description</span>
              <span>ราคา</span>
            </div>
            
            {(order.items || order.order_items || [])
              .map((item) => {
                if (!item) return null;
                const productName = item.product?.name || item.product_name || 'สินค้า';
                return { ...item, _computedName: productName };
              })
              .filter(Boolean)
              .sort((a, b) => {
                const nameCompare = a._computedName.localeCompare(b._computedName, 'th');
                if (nameCompare !== 0) return nameCompare;
                return (a.custom_text || '').localeCompare(b.custom_text || '', 'th');
              })
              .map((item, idx) => {
                const singlePrice = item.price ?? 0;
                const qty = item.quantity ?? 1;
                const totalPricePerItem = singlePrice * qty; // คำนวณราคาคูณด้วยจำนวนชิ้น

                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      {/* แสดงผลแบบ 2x ชื่อสินค้า (50.00/ea) */}
                      <span className="font-bold text-[11px]">
                        {qty}x {item._computedName} <span className="font-normal text-gray-600 text-[10px]">({singlePrice.toFixed(2)}/ea)</span>
                      </span>
                      {/* แสดงราคารวมประจำบรรทัด */}
                      <span className="font-bold text-[11px]">{totalPricePerItem.toFixed(2)}</span>
                    </div>
                    {item.custom_text && (
                      <div className="text-[10px] text-gray-700 pl-3 italic">
                        - หน้าเค้ก: "{item.custom_text}"
                      </div>
                    )}
                  </div>
                );
              })}
          </div>


          {/* สรุปราคา */}
          <div className="border-t border-dashed border-black pt-1.5 space-y-0.5">
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <span>{(order.subtotal_price ?? order.total_price ?? 0).toFixed(2)} ฿</span>
            </div>
            {order.discount_price > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{order.discount_price.toFixed(2)} ฿</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
              <span>Net Total:</span>
              <span>{(order.grandtotal_price ?? order.total_price ?? 0).toFixed(2)} ฿</span>
            </div>
          </div>

          {order.notes && (
            <div className="bg-gray-100 p-2 rounded border border-black mt-2">
              <span className="font-bold block text-[10px]">📌 Notes:</span>
              <span className="italic text-[11px]">{order.notes}</span>
            </div>
          )}

          <div className="text-center pt-3 text-[10px]">
            *** Thank You ***
          </div>
        </div>

        {/* ปุ่มกดสั่งพิมพ์ (ซ่อนอัตโนมัติเวลาสั่งพิมพ์จริงผ่าน print:hidden) */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex gap-2 print:hidden">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-stone-300"
          >
            ปิด
          </button>
          <button 
            onClick={handleOrderPrintRequest} 
            className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-orange-700 shadow-sm"
          >
            🖨️ สั่งพิมพ์ออเดอร์
          </button>
          <button 
            onClick={handleReceiptPrintRequest} 
              className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-sky-700 shadow-sm"
            >
              ☁️ สั่งพิมพ์ใบเสร็จ
          </button>
        </div>

      </div>
    </div>
  );
}