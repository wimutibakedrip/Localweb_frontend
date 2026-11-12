import React from 'react';

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  customerName,       
  setCustomerName,   
  orderNotes,         
  setOrderNotes, 
  paymentMethod,
  setPaymentMethod,    
  removeFromCart,
  discountType,
  setDiscountType,
  discountValue,
  customDiscountInput,
  setCustomDiscountInput,
  handleQuickDiscount,
  applyCustomDiscount,
  handleCheckout,
  subtotalPrice,
  discountAmount,
  netPrice,
  editingOrderId
}) {
  if (!isCartOpen) return null;

  const isEditMode = editingOrderId !== null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col border-l-4 border-[#FF7F32]">
        
        {/* Header ตะกร้า */}
        <div className="p-4 border-b-2 border-[#FFE0CC] flex justify-between items-center bg-[#FFF0E6]">
          <h2 className="text-lg font-bold text-[#4A2810]">{isEditMode ? `⚙️ กำลังแก้ไขออเดอร์ #${editingOrderId}` : "🛒 รายการที่เลือกในตะกร้า"}</h2>
          {/* เพิ่มใหม่: ป้ายแสดงจำนวนรายการที่อยู่ในตะกร้าปัจจุบัน */}
          {cart.length > 0 && (
            <span className="bg-[#FF5500] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">
              {cart.length} รายการ
            </span>
          )} 
          <button onClick={() => setIsCartOpen(false)} className="text-[#FF7F32] hover:text-[#D45500] font-bold text-xl cursor-pointer">✕</button>
        </div>       
        {/* รายการขนม */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-stone-50/50">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-[#805030]">
              <span className="text-4xl block mb-2">🥧</span>
              <p className="text-xs font-bold">ตะกร้ายังว่างเปล่า</p>
            </div>
          ) : (
            // 🆕 เพิ่มการเรียงลำดับตามชื่อสินค้าภาษาไทยก่อนทำการสร้าง Element
            [...cart]
              .sort((a, b) => {
                // เรียงตามชื่อสินค้า (ภาษาไทย)
                const nameCompare = a.name.localeCompare(b.name, 'th');
                if (nameCompare !== 0) return nameCompare;
                // ถ้าชื่อสินค้าเหมือนกัน ให้เรียงตามข้อความหน้าเค้ก (ถ้ามี)
                return (a.customText || '').localeCompare(b.customText || '', 'th');
              })
              .map((item) => (
                <div 
                  key={item.cartId || item.id} 
                  className="flex justify-between items-center bg-[#FFF5EE] p-2.5 rounded-xl border border-[#FFE0CC] shadow-xs"
                >
                  {/* ฝั่งซ้าย: ข้อมูลสินค้า */}
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-xs text-[#4A2810] line-clamp-1">
                      {item.name}
                    </h4>
                    
                    {item.customText && (
                      <p className="text-[10px] text-[#FF5500] mt-0.5 bg-white px-1.5 py-0.5 rounded border border-[#FFE0CC] inline-block max-w-full truncate">
                        ✍️ หน้าเค้ก: "{item.customText}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-black text-[#D45500]">{(item.price || 0)} ฿</p>
                      <span className="text-[10px] text-stone-400">|</span>
                      <p className="text-[11px] text-stone-500 font-bold">x {item.count || 1} ชิ้น</p>
                    </div>
                  </div>
                  
                  {/* ฝั่งขวา: ปุ่มลบ */}
                  <button 
                    onClick={() => removeFromCart(item.cartId)} 
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-white hover:bg-red-50 px-2 py-1 rounded-lg border border-red-100 cursor-pointer transition-colors shrink-0"
                  >
                    ลบ
                  </button>
                </div>
              ))
          )}
        </div>

        {/* ฟังก์ชันคำนวณเงิน */}
        {cart.length > 0 && (         
          <div className="p-4 bg-[#FFF0E6] border-t-2 border-[#FFE0CC] space-y-1">
            {/* // ... โค้ดช่องทางการชำระเงิน ... */}
            <div className="space-y-1">
              <select
                id="payment-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-white text-stone-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="โอน">📱 โอนเงินผ่านธนาคาร / QR Code</option>
                <option value="เงินสด">💵 จ่ายด้วยเงินสด</option>
              </select>
            </div>

            {/* 🆕 ส่วนกรอกชื่อลูกค้ากำกับออเดอร์ */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#805030] block">📝 ชื่อลูกค้า</label>
              <textarea 
                placeholder="เช่น คุณ..." 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                rows={1}
                className="w-full p-2 rounded-xl border border-[#FFE0CC] bg-white text-sm text-[#4A2810] focus:border-[#FF7F32] focus:outline-none resize-none"
              />
            </div>


            {/* 🆕 ส่วนกรอกหมายเหตุกำกับออเดอร์ */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#805030] block">📝 หมายเหตุเพิ่มเติม</label>
              <textarea 
                placeholder="เช่น หวานน้อย, แยกน้ำแข็ง, ขอช้อนด้วยครับ..." 
                value={orderNotes} 
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
                className="w-full p-2 rounded-xl border border-[#FFE0CC] bg-white text-sm text-[#4A2810] focus:border-[#FF7F32] focus:outline-none resize-none"
              />
            </div>
            {/* ปุ่มส่วนลดด่วน */}
            <div>
              <p className="text-xs font-bold text-[#993D00] mb-2">⚡ ส่วนลดด่วน (฿)</p>
              <div className="grid grid-cols-4 gap-2">
                {[0, 5, 10, 15].map((pct) => (
                  <button 
                    key={pct} 
                    type="button"
                    onClick={() => handleQuickDiscount(pct)} 
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${discountType === 'percent' && discountValue === pct ? 'bg-[#FF7F32] text-white border-[#D45500]' : 'bg-white text-[#4A2810] border-[#FFE0CC] hover:bg-[#FFE0CC]'}`}
                  >
                    {pct === 0 ? "ล้าง" : `${pct} ฿`}
                  </button>
                ))}
              </div>
            </div>

            {/* ช่องใส่ส่วนลดเอง */}
            <div className="flex gap-2">
              <div className="flex-1 flex bg-white rounded-xl border border-[#FFE0CC] overflow-hidden px-2 items-center">
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="text-xs font-bold text-[#4A2810] bg-transparent outline-none py-2 cursor-pointer">
                   <option value="percent">ลด (%)</option>
                  <option value="amount">ลด (฿)</option>
                </select>
                <input type="number" placeholder="ระบุจำนวน" value={customDiscountInput} onChange={(e) => setCustomDiscountInput(e.target.value)} className="w-full text-right text-sm font-bold text-[#4A2810] bg-transparent outline-none px-2" />
              </div>
              <button type="button" onClick={applyCustomDiscount} className="bg-[#D45500] hover:bg-[#A64200] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                ใช้
              </button>
            </div>

            {/* บิลเงินรวม */}
            <div className="space-y-1.5 pt-2 border-t border-dashed border-[#FF7F32]/30 text-sm">
              <div className="flex justify-between text-[#805030]">
                <span>รวมเป็นเงิน:</span>
                <span className="font-bold">{subtotalPrice || 0} ฿</span>
              </div>
              <div className="flex justify-between text-red-600 text-xs font-medium">
                <span>ส่วนลด ({discountType === "amount" ? "บาท" : `${discountValue}%`}):</span>
                <span>-{discountAmount ? discountAmount.toFixed(2) : "0.00"} ฿</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#4A2810] pt-1">
                <span>ยอดสุทธิ:</span>
                <span className="text-[#FF5500] text-xl">{netPrice ? netPrice.toFixed(2) : "0.00"} ฿</span>
              </div>
            </div>
            
            <button type="button" onClick={handleCheckout} className="w-full bg-[#FF5500] hover:bg-[#CC4400] text-white py-3 rounded-xl font-bold text-center text-sm shadow-md transition-colors cursor-pointer mt-2 block">
              {isEditMode ? "💾 บันทึกการแก้ไขออเดอร์" : "💳 ดำเนินการชำระเงิน"}              
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
