import React, { useState } from 'react';
import { API_URL } from '../data/menuData';
import ProductOrderDetailsModal from './ProductOrderDetailsModal';

export default function SalesPanel({ salesSummary, selectedDate, API_URL }) {
  const revenue = salesSummary?.total_revenue ?? 0;
  const t_cash = salesSummary?.total_cash ?? 0;
  const t_transfer = salesSummary?.total_transfer ?? 0;
  const distribution = salesSummary?.status_distribution ?? {};
  const topProducts = Array.isArray(salesSummary?.top_products) ? salesSummary.top_products : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({ name: '', category: '' });
  const [buyersList, setBuyersList] = useState([]);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(false);
  const [isPrintingReport, setIsPrintingReport] = useState(false); 

  // ฟังก์ชันส่งคำขอพิมพ์รายงานสรุปยอดขายประจำสัปดาห์ไปยัง Backend
  const handlePrintSalesReportRequest = async () => {
    setIsPrintingReport(true);
    try {
      const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
      const cleanUrl = `${baseUrl}/api/sales/request-print-report`;
            
      const response = await fetch(`${cleanUrl}?selected_date=${selectedDate}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        alert("📊 ส่งคำสั่งพิมพ์รายงานสรุปยอดขายประจำสัปดาห์เข้าคิวสำเร็จแล้ว!");
      } else {
        const err = await response.json();
        alert("ไม่สามารถพิมพ์รายงานได้: " + (err.detail || "เกิดข้อผิดพลาด"));
      }
    } catch (error) {
      console.error("Print Sales Report Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsPrintingReport(false);
    }
  }; 

  // ฟังก์ชันเมื่อมีการกดคลิกปุ่ม "ดูรายละเอียด" อันดับสินค้า
  const handleOpenBuyersModal = async (productName, categoryName) => {
    setSelectedProduct({ name: productName, category: categoryName });
    setIsLoadingBuyers(true);
    setModalOpen(true);

    try {
      const response = await fetch(`${API_URL}/sales/product-buyers?product_name=${encodeURIComponent(productName)}&selected_date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setBuyersList(data);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ซื้อรายสินค้า:", error);
      setBuyersList([]);
    } finally {
      setIsLoadingBuyers(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-6 pt-6 space-y-6">
      {/* ส่วนหัวข้อและปุ่มสั่งพิมพ์ */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-black text-[#4A2810]">📊 รายงานภาพรวมยอดขายและคิว (ในรอบสัปดาห์)</h2>
        <button
          type="button"
          disabled={isPrintingReport}
          onClick={handlePrintSalesReportRequest}
          className="px-4 py-2.5 bg-[#4A2810] text-white hover:bg-[#331C0B] disabled:bg-gray-400 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {isPrintingReport ? "⏳ กำลังจัดคิว..." : "🖨️ พิมพ์รายงานสรุปยอด"}
        </button>
      </div>

      {/* 1. ส่วนการ์ดสรุปตัวเลข (KPI Cards) - แตกย่อยรายละเอียดคิวระบบฝังด้านล่างบล็อก */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* การ์ดที่ 1: รายได้ */}
        <div className="bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold opacity-80 block uppercase">💰 รายได้รวมสุทธิ (สำเร็จ)</span>
            <span className="text-3xl font-black block mt-2">{revenue.toFixed(2)} ฿</span>
          </div>
        </div>

        {/* การ์ดที่ 2: สรุปจำนวนออเดอร์ทั้งหมด (บน) และ ออเดอร์ที่เสร็จสิ้น (ล่าง) */}
        <div className="bg-white rounded-2xl border-2 border-[#4A2810] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold text-gray-400 block uppercase">📦 จำนวนออเดอร์ทั้งหมด</span>
            <span className="text-3xl font-black text-[#4A2810] block mt-2">
              {/*คำนวณหาออเดอร์ทั้งหมดโดยการบวกทุกสถานะคิวเข้าด้วยกัน */}
              {Object.values(distribution).reduce((sum, count) => sum + count, 0)} <span className="text-sm font-bold text-gray-500">ออเดอร์</span>
            </span>
          </div>
          
          {/* บรรทัดล่าง: แจกแจงเฉพาะจำนวนออเดอร์ที่เสร็จสิ้นเรียบร้อยแล้ว */}
          <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-between items-center text-xs">
            <span className="text-stone-500 font-bold">สำเร็จแล้ว:</span>
            <span className="font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
              ✅ สำเร็จ {distribution["สำเร็จ"] ?? 0} ออเดอร์
            </span>
          </div>
        </div>

        {/* การ์ดที่ 3: คิวที่ยังค้างอยู่ในครัว (ย้ายการแจกแจงสถานะคิวระบบย่อยมาสรุปเรียงที่นี่ทั้งหมด) */}
        <div className="bg-white rounded-2xl border-2 border-[#4A2810] p-6 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <span className="text-sm font-bold text-gray-400 block uppercase">⏳ ออเดอร์ค้างระบบ</span>
            <span className="text-3xl font-black text-amber-600 block mt-2">
              {(distribution["รอดำเนินการ"] ?? 0) + (distribution["กำลังปรุง/อบ"] ?? 0) + (distribution["พร้อมเสิร์ฟ/ส่ง"] ?? 0)} <span className="text-sm font-bold text-gray-500">คิว</span>
            </span>
          </div>
          {/* 🆕 สรุปสัดส่วนคิวย่อยที่ค้างจริงในระบบปัจจุบัน ป้องกันพื้นที่ว่าง */}
          <div className="text-[11px] font-bold text-stone-600 grid grid-cols-3 gap-1 pt-1.5 border-t border-gray-100">
            <div className="text-center bg-stone-50 p-1 rounded">⏳ รอ: {distribution["รอดำเนินการ"] ?? 0}</div>
            <div className="text-center bg-amber-50 p-1 rounded text-amber-700">👩‍🍳 อบ: {distribution["กำลังปรุง/อบ"] ?? 0}</div>
            <div className="text-center bg-sky-50 p-1 rounded text-sky-700">🛵 ส่ง: {distribution["พร้อมเสิร์ฟ/ส่ง"] ?? 0}</div>
          </div>
        </div>

        {/* การ์ดที่ 4: การจ่ายเงิน */}
        <div className="bg-white rounded-2xl border-2 border-[#4A2810] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold text-gray-400 block uppercase">💵 ช่องทางการชำระเงิน</span>
            <div className="mt-2 space-y-1 text-sm font-black text-stone-800">
              <div className="flex justify-between"><span>💵 เงินสด:</span><span className="text-emerald-600">{t_cash.toFixed(2)} ฿</span></div>
              <div className="flex justify-between"><span>📱 ยอดโอน:</span><span className="text-sky-600">{t_transfer.toFixed(2)} ฿</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ส่วนแสดงอันดับสินค้าขายดี (ขยายกรอบกว้างเต็ม 100% และลบกล่องสัดส่วนคิวเดิมออกแล้ว) */}
      <div className="w-full">
        <div className="bg-white rounded-2xl border-2 border-[#4A2810] p-6 shadow-sm w-full">
          <h3 className="text-sm font-black text-[#4A2810] mb-4 flex items-center gap-2">🏆 20 อันดับเมนูเบเกอรี่ขายดีประจำร้าน</h3>
          {topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium">ยังไม่มีประวัติการสั่งซื้อเบเกอรี่ที่ชำระเงินสำเร็จในช่วงเวลานี้</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-amber-100 text-[#805030] font-bold text-[13px]">
                    <th className="pb-3 w-16">อันดับ</th>
                    <th className="pb-3">ชื่อเมนูขนม / เครื่องดื่ม</th>
                    <th className="pb-3 text-right">หมวดสินค้า</th>
                    <th className="pb-3 text-right">จำนวนรวมที่ขาย</th>
                    <th className="pb-3 text-right w-32">ประวัติบิล</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-stone-700">
                  {topProducts.map((item, index) => (
                    <tr key={index} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3.5 font-black text-base text-[#FF5500]">#{index + 1}</td>
                      <td className="py-3.5 font-bold text-sm text-stone-900">{item.name || 'ไม่ระบุชื่อสินค้า'}</td>
                      <td className="py-3.5 text-right font-black text-xs text-[#4A2810]">{item.category}</td>
                      <td className="py-3.5 text-right font-black text-base text-[#4A2810]">
                        {item.qty ?? 0} {item.category === '🥤 เครื่องดื่ม' || item.category === 'เครื่องดื่ม' ? 'แก้ว' : 'ชิ้น'}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenBuyersModal(item.name, item.category)} 
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          🔍 ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* โมดอลเจาะลึกผู้ซื้อรายสินค้า */}
      <ProductOrderDetailsModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setBuyersList([]); }} 
        productName={selectedProduct.name} 
        categoryName={selectedProduct.category}
        buyersData={buyersList} 
      />
    </div>
  );
}
