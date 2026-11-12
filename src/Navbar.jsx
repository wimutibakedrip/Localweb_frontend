import React from 'react';

export default function Navbar({ role, onToggleRole, onLogOut, cartCount, setIsCartOpen, clearForm }) {
  return (
    <header className="bg-white border-b-2 border-[#FF7F32] sticky top-0 z-40 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <span className="text-3xl"></span>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#D45500]">WIMUTI BAKE & DRIP</h1>
          <p className="text-xs uppercase tracking-widest text-[#FF7F32] font-bold">Baking Happiness Everyday</p>
        </div>
      </div>

      {/* แผงสลับบทบาทผู้ใช้งาน */}
      <div className="flex items-center bg-[#FFF0E6] p-1.5 rounded-xl border border-[#FFE0CC]">
        <button 
          onClick={() => { onLogOut(); ontoggle(); clearForm(); }} 
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'user' ? 'bg-[#FF5500] text-white shadow-sm' : 'text-[#805030] hover:bg-[#FFE0CC]'}`}
        >
          👤 หน้าลูกค้า (User)
        </button>
        <button 
          onClick={onToggleRole}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${role === 'admin' ? 'bg-[#4A2810] text-white shadow-sm' : 'text-[#805030] hover:bg-[#FFE0CC]'}`}
        >
          🔑 หลังบ้าน (Admin)
        </button>
      </div>

      {role === 'user' && (
        <button onClick={() => setIsCartOpen(true)} className="bg-[#FF5500] hover:bg-[#CC4400] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer transition-colors">
          <span>🛒 ตะกร้าของฉัน</span>
          <span className="bg-white text-[#FF5500] text-xs px-2 py-0.5 rounded-full font-black">{cartCount}</span>
        </button>
      )}
    </header>
  );
}
