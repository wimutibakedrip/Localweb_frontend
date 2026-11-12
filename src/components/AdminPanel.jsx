import React from 'react';

export default function AdminPanel({
  isEditing,
  formName,
  setFormName,
  formCategory,
  setFormCategory,
  formPrice,
  setFormPrice,
  formPieces,
  setFormPieces,
  formImage,
  setFormImage,
  formDesc,
  setFormDesc,
  handleSaveProduct,
  clearForm,
  setSelectedFile 
}) {
  return (
    <div className="max-w-7xl w-full mx-auto px-6 pt-6">
      <div className="bg-white rounded-2xl border-2 border-[#4A2810] p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#4A2810] mb-4 flex items-center gap-2">
          🛠️ {isEditing ? "แก้ไขเมนูเบเกอรี่" : "เพิ่มเมนูเบเกอรี่ใหม่เข้าสู่ระบบ"}
        </h2>
        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#805030]">ชื่อเมนูขนม / เครื่องดื่ม</label>
            <input type="text" placeholder="เช่น เค้กช็อกโกแลตหน้านิ่ม" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#FFE0CC] text-sm focus:border-[#FF7F32] focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#805030]">หมวดหมู่สินค้า</label>
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#FFE0CC] text-sm focus:border-[#FF7F32] focus:outline-none bg-white">
              <option value="🍰 Cake">🍰 Cake</option>
              <option value="🧀 Cheesecake">🧀 Cheesecake</option>
              <option value="🍪 Cookies">🍪 Cookies</option>
              <option value="🎂 BirthDay Cake">🎂 BirthDay Cake</option>
              <option value="🍞 Bread">🍞 Bread</option>
              <option value="🥤 Beverages">🥤 Beverages</option>
              <option value="🥤 Add-ons">🥤 Add-ons</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#805030]">ราคาจำหน่าย (บาท)</label>
            <input type="number" placeholder="เช่น 95" maxLength={5} value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#FFE0CC] text-sm focus:border-[#FF7F32] focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#805030]">จำนวนชิ้น (ชิ้น/แก้ว)</label>
            <input type="number" placeholder="เช่น 10" maxLength={3} value={formPieces} onChange={(e) => setFormPieces(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#FFE0CC] text-sm focus:border-[#FF7F32] focus:outline-none" />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-[#805030]">ลิงก์ URL รูปภาพ (Image URL)</label>
            <input type="text-sm" placeholder="วางลิงก์รูปภาพตรงนี้" value={formImage} onChange={(e) => setFormImage(e.target.value)} className="w-full p-2.5 rounded-xl border border-[#FFE0CC] text-sm focus:border-[#FF7F32] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#805030] mb-1">📸 รูปภาพสินค้า (ถ่ายเอง)</label>
            <input 
              type="file" 
              accept="image/*" 
              // ปรับแต่งให้หยิบไฟล์รูปภาพสดชิ้นแรกส่งสลับค่าเข้าสเตตกลางของ App.jsx ได้อย่างถูกต้อง
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs"
            />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-[#805030] block">คำอธิบายเมนูเพิ่มเติม</label>
              <textarea 
                placeholder="บอกจุดเด่น ความอร่อย วัตถุดิบพิเศษ..." 
                rows={2} 
                value={formDesc} 
                onChange={(e) => setFormDesc(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-[#FFE0CC] text-sm focus:border-[#FF7F32] focus:outline-none resize-none block" 
              />
            </div>
            <div className="md:col-span-1 flex flex-col md:flex-row justify-end gap-2 h-20.5 items-end pb-0.5">
              {isEditing && (
                <button 
                  type="button" 
                  onClick={clearForm} 
                  className="w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  ยกเลิก
                </button>
              )}
              <button 
                type="submit" 
                className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#4A2810] text-white hover:bg-[#331C0B] cursor-pointer whitespace-nowrap"
              >
                {isEditing ? "💾 บันทึกการแก้ไข" : "➕ เพิ่มเมนูใหม่"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
