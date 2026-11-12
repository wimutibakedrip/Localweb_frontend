import React from 'react';

export default function OrderStatus({
  orders,
  selectedDate,
  setSelectedDate,
  isTrackingLoading,
  setSelectedOrderDetails,
  handleUpdateOrderStatus,
  loadOrderToCart,
  onPrintOrder
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-[#4A2810] mb-4 flex items-center gap-2">
        📋 คิวและสถานะการจัดส่ง
      </h2>
      
      <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm w-full">                        
        {/* บล็อกที่ 1: กล่องเลือกวันที่ (บีบขนาดให้แคบและกระชับขึ้น) */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-xl shadow-2xs shrink-0">
          <span className="text-xs font-bold text-gray-500 shrink-0">เลือกวันที่:</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-black text-[#4A2810] focus:outline-none cursor-pointer max-w-37.5"
          />
        </div>

        {/* บล็อกที่ 2: แสดงช่วงเวลาสัปดาห์ */}
        <div className="shrink-0">
          <span className="text-xs font-bold bg-[#FFE0CC] text-[#FF7F32] px-3 py-2 rounded-xl inline-block">
            📅 {
              (() => {
                if (!selectedDate) return '-';
                const [year, month, day] = selectedDate.split('-').map(Number);
                const d = new Date(Date.UTC(year, month - 1, day)); 
                d.setUTCDate(d.getUTCDate() - 6); 
                return d.toISOString().split('T')[0]; 
              })()
            } ถึง {selectedDate}
          </span>
        </div>

        {/* บล็อกที่ 3: แสดงจำนวนคิวออเดอร์ทั้งหมด */}
        <div className="shrink-0">
          <span className="text-xs font-bold bg-[#FFE0CC] text-[#FF7F32] px-3 py-2 rounded-xl inline-block">
            📦 คิวในรอบสัปดาห์: {orders.length} รายการ
          </span>
        </div>
      </div>


      {isTrackingLoading ? (
        <p className="text-gray-500 text-center py-10">กำลังโหลดข้อมูลออเดอร์...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 text-center py-10">ยังไม่มีออเดอร์ในระบบปัจจุบัน</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {[...orders]
            // 1. กรองเอา "ยกเลิก" หรือ "ยกเลิกออเดอร์" ออกไป ไม่นำมาแสดง
            .filter((order) => order.status !== "ยกเลิก" && order.status !== "ยกเลิกออเดอร์")
            
            // 2. จัดเรียงตามลำดับสถานะ และตามด้วย orderId
            .sort((a, b) => {
              // กำหนดคะแนนลำดับความสำคัญของแต่ละสถานะ (คะแนนน้อยอยู่บน)
              const statusOrder = {
                "รอดำเนินการ": 1,
                "กำลังปรุง/อบ": 2,
                "พร้อมเสิร์ฟ/ส่ง": 3,
                "สำเร็จ": 4,
                "สำเร็จออเดอร์": 4 // รองรับทั้งสองชื่อเผื่อตัวแปรส่งมาไม่เหมือนกัน
              };

              // ดึงคะแนนสถานะของออเดอร์ a และ b (ถ้าไม่มีในระบบให้เป็นคะแนนสูงสุดคือ 5)
              const scoreA = statusOrder[a.status] || 5;
              const scoreB = statusOrder[b.status] || 5;

              // เปรียบเทียบสถานะก่อน
              if (scoreA !== scoreB) {
                return scoreA - scoreB;
              }

              // 3. ถ้าสถานะเดียวกัน ให้เรียงตาม orderId จากมากไปน้อย (ออเดอร์ใหม่ล่าสุดขึ้นก่อนในกลุ่มนั้น)
              return b.id - a.id;
            })
            .map((order) => (
              <div 
                key={order.id} 
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4"
              >
              {/* แถวบน: ข้อมูลหลัก และ ปุ่มดำเนินการต่างๆ */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                
                {/* ฝั่งซ้าย: ข้อมูลออเดอร์และเวลา */}
                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-[#FFE0CC] text-[#FF7F32] px-2.5 py-1 rounded-lg">
                      Order #{order.id}
                    </span>
                    <span className="font-black text-sm text-[#4A2810] flex items-center gap-1">
                      👤 ลูกค้า: {order.customer_name || "ไม่ระบุชื่อ/หน้าร้าน"}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 font-medium pt-1">
                    ⏱️ วันที่-เวลาสั่งซื้อ: {new Date(order.created_at).toLocaleString('th-TH')} น.
                  </div>
                </div>

                {/* ฝั่งขวา: รายละเอียด ชำระเงิน และสถานะ */}
                <div className="flex flex-wrap gap-2 shrink-0 items-center pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(order)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer">
                    🔍 ดูรายละเอียด
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrintOrder(order)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    🖨️ พิมพ์
                  </button>                
                  <span className={`px-3 py-1.5 rounded-full text-xs font-black ${order.status === 'สำเร็จ' ? 'bg-green-100 text-green-700' : order.status === 'ยกเลิก' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>
                    {order.status}  
                  </span>                                              
                  <span className="font-black text-sm text-[#4A2810] flex items-center gap-1 border-l pl-2 border-gray-200">
                    💵 จ่ายเงิน: {order.payment_method || "ไม่ระบุ"}
                  </span>
                </div>
              
                {/* ฝั่งขวาสุด: ยอดรวมและปุ่มจัดการสถานะสำหรับ Admin */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 min-w-50 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-left md:text-right space-y-0.5">
                    {order.discount_price > 0 && (
                      <span className="text-[12px] text-red-500 block font-bold">
                        ส่วนลด: -{order.discount_price?.toFixed(2)} ฿
                      </span>
                    )}
                    <span className="text-[12px] text-gray-400 block font-normal">ยอดสุทธิรวม</span>
                    <span className="font-black text-amber-800 text-sm">
                      {order.grandtotal_price?.toFixed(2)} ฿
                    </span>
                  </div>

                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className="p-2 rounded-xl border border-gray-200 text-xs font-bold bg-white text-[#4A2810] focus:outline-none cursor-pointer">
                    <option value="รอดำเนินการ">⏳ รอดำเนินการ</option>
                    <option value="กำลังปรุง/อบ">👩‍🍳 กำลังปรุง/อบ</option>
                    <option value="พร้อมเสิร์ฟ/ส่ง">🛵 พร้อมเสิร์ฟ/ส่ง</option>
                    <option value="สำเร็จ">✅ สำเร็จออเดอร์</option>
                    <option value="ยกเลิก">❌ ยกเลิกออเดอร์</option>
                  </select>
                </div>
              </div>

              {/* 🆕 แถวล่างสุด (กว้างเต็มการ์ด): แถวของหมายเหตุและปุ่มแก้ไขออเดอร์ */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center w-full pt-2 border-t border-gray-100">
                {/* คอลัมน์หมายเหตุ: ได้พื้นที่กว้างเต็มที่ข้ามไป 3 ส่วน (md:col-span-3) */}
                <div className="bg-amber-50 border border-amber-200 text-[#805030] text-xs p-2.5 rounded-xl flex items-start gap-1 md:col-span-3 w-full shadow-2xs">
                  <span>📌 <b>หมายเหตุ:</b></span>
                  <span className="italic break-all">{order.notes}</span>
                </div>

                {/* คอลัมน์ปุ่มแก้ไขออเดอร์: ได้พื้นที่ 1 ส่วนที่เหลือขวาสุด ซึ่งจะกว้างและยาวเต็มแถวไม่โดนบีบ */}
                <div className="w-full">
                  <button
                    type="button"
                    disabled={order.status === "สำเร็จ" || order.status === "ยกเลิก"}
                    onClick={() => loadOrderToCart(order)} 
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center whitespace-nowrap ${
                      order.status === "สำเร็จ" || order.status === "ยกเลิก" 
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                        : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 cursor-pointer shadow-xs"
                    }`}
                  >
                    ⚙️ แก้ไขออเดอร์
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
