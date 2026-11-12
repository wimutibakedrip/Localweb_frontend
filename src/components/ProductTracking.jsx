import React, { useMemo } from 'react';

export default function ProductTracking({
  orders,
  selectedDate,
  setSelectedDate,
  isTrackingLoading
}) {
  // จัดกลุ่มข้อมูลออเดอร์ตามชื่อสินค้า และเรียงลำดับตามตัวอักษร
  const groupedProducts = useMemo(() => {
    const productMap = {};

    // 1. กรองเอาเฉพาะออเดอร์ที่ไม่ได้ถูกยกเลิก
    const validOrders = orders.filter(
      (o) => o.status !== 'ยกเลิก' && o.status !== 'ยกเลิกออเดอร์'
    );

    // 2. วนลูปเก็บข้อมูลสินค้าจากแต่ละออเดอร์
    validOrders.forEach((order) => {
      const items = order.items || order.order_items || [];
      items.forEach((item) => {
        const productName =
          item.product?.name || item.product_name || 'ไม่ระบุชื่อสินค้า';

        if (!productMap[productName]) {
          productMap[productName] = {
            productName,
            totalQty: 0,
            buyers: []
          };
        }

        const qty = Number(item.quantity || 0);
        productMap[productName].totalQty += qty;
        productMap[productName].buyers.push({
          orderId: order.id,
          customerName: order.customer_name || 'ไม่ระบุชื่อ/หน้าร้าน',
          qty: qty,
          status: order.status,
          customText: item.custom_text || ''
        });
      });
    });

    // 3. แปลงเป็น Array และเรียงตามชื่อสินค้า A-Z และ ก-ฮ
    return Object.values(productMap)
      .sort((a, b) =>
        a.productName.localeCompare(b.productName, ['en', 'th'], {
          sensitivity: 'base'
        })
      )
      .map((group) => ({
        ...group,
        buyers: group.buyers.sort((a, b) => {
          // เรียงตามชื่อลูกค้าภาษาอังกฤษ (A-Z) และภาษาไทย (ก-ฮ)
          const nameCompare = a.customerName.localeCompare(b.customerName, ['en', 'th'], {
            sensitivity: 'base'
          });
          if (nameCompare !== 0) return nameCompare;

          // กรณีลูกค้าคนเดียวกันสั่งหลายบิล ให้เรียงตามเลข Order ID จากน้อยไปมาก
          return a.orderId - b.orderId;
        })
      }));
  }, [orders]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-[#4A2810] mb-4 flex items-center gap-2">
        🧺 ติดตามยอดสั่งซื้อแยกตามสินค้า
      </h2>

      {/* แถบเลือกวันที่และช่วงเวลา */}
      <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm w-full">
        {/* กล่องเลือกวันที่ */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-xl shadow-2xs shrink-0">
          <span className="text-xs font-bold text-gray-500 shrink-0">เลือกวันที่:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-black text-[#4A2810] focus:outline-none cursor-pointer max-w-37.5"
          />
        </div>

        {/* แสดงช่วงเวลาสัปดาห์ (ย้อนหลัง 7 วัน) */}
        <div className="shrink-0">
          <span className="text-xs font-bold bg-[#FFE0CC] text-[#FF7F32] px-3 py-2 rounded-xl inline-block">
            📅{' '}
            {(() => {
              if (!selectedDate) return '-';
              const [year, month, day] = selectedDate.split('-').map(Number);
              const d = new Date(Date.UTC(year, month - 1, day));
              d.setUTCDate(d.getUTCDate() - 6);
              return d.toISOString().split('T')[0];
            })()}{' '}
            ถึง {selectedDate}
          </span>
        </div>

        {/* สรุปจำนวนรายการสินค้าทั้งหมด */}
        <div className="shrink-0">
          <span className="text-xs font-bold bg-[#FFE0CC] text-[#FF7F32] px-3 py-2 rounded-xl inline-block">
            🍰 รายการสินค้าที่ขายได้: {groupedProducts.length} เมนู
          </span>
        </div>
      </div>
      {/* ส่วนแสดงผลรายการสินค้าที่จัดกลุ่มแล้ว */}
      {isTrackingLoading ? (
        <p className="text-gray-500 text-center py-10">กำลังโหลดข้อมูลสินค้า...</p>
      ) : groupedProducts.length === 0 ? (
        <p className="text-gray-400 text-center py-10">ยังไม่มีรายการขายสินค้าในช่วงเวลานี้</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupedProducts.map((group) => (
            <div
              key={group.productName}
              className="bg-white rounded-2xl border-2 border-[#4A2810] overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* ส่วนหัวการ์ด: ชื่อสินค้า และ สรุปยอดรวม */}
                <div className="p-4 bg-[#FFF0E6] border-b-2 border-[#FFE0CC] flex justify-between items-center gap-2">
                  <h3 className="font-black text-base text-[#4A2810]">
                    🍰 {group.productName}
                  </h3>
                  <span className="text-xs font-black bg-[#FF5500] text-white px-3 py-1.5 rounded-xl shrink-0">
                    รวมทั้งหมด {group.totalQty} ชิ้น
                  </span>
                </div>

                {/* ตารางรายชื่อลูกค้าและเลข Order ID */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-50/50 text-[#805030] font-bold border-b border-gray-200">
                        <th className="p-3 w-24">Order ID</th>
                        <th className="p-3">ชื่อลูกค้า / โต๊ะ</th>
                        <th className="p-3 text-center w-36">สถานะ</th>
                        <th className="p-3 text-right w-20">จำนวน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.buyers.map((buyer, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-bold text-[#FF7F32]">
                            #{buyer.orderId}
                          </td>
                          <td className="p-3 font-semibold text-gray-800">
                            <div>{buyer.customerName}</div>
                            {buyer.customText && (
                              <div className="text-[11px] text-[#FF5500] italic mt-0.5 font-normal">
                                ✍️ "{buyer.customText}"
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap inline-block ${buyer.status === 'สำเร็จ' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                              {buyer.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-[#4A2810]">
                            {buyer.qty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* ส่วนท้ายการ์ด: สรุปยอดรวมด้านล่างอีกครั้งเพื่อความชัดเจน */}
              <div className="p-3 bg-slate-50 border-t border-gray-200 flex justify-between items-center text-xs font-bold text-[#4A2810]">
                <span>จำนวนบิลที่สั่งเมนูนี้: {group.buyers.length} รายการ</span>
                <span className="text-sm font-black text-[#FF5500]">
                  ยอดรวม: {group.totalQty} ชิ้น
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

