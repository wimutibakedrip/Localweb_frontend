import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ selectedDate, API_URL }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardAnalytics();
  }, [selectedDate]);

  const fetchDashboardAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/dashboard-analytics?selected_date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <p className="text-center py-10 text-rose-500 font-black text-xl">กำลังประมวลผลข้อมูลแดชบอร์ดระดับสูง...</p>;

  // 1. คำนวณพิกัดสำหรับวงแหวนช่องทางชำระเงิน (สด/โอน)
  const transferPercent = dashboardData?.payment_summary?.transfer_percent ?? 0;
  const cashPercent = dashboardData?.payment_summary?.cash_percent ?? 0;
  const strokeDasharrayTransfer = `${transferPercent} ${100 - transferPercent}`;

  // 2. คำนวณพิกัดสะสมสำหรับ Pie Chart สัดส่วนรายได้รายวัน (7 วันย้อนหลัง)
  const dailyTrends = dashboardData?.daily_trend ?? [];
  const weeklyTotalRevenue = dailyTrends.reduce((sum, d) => sum + d.revenue, 0);
  
  let accumulatedPercent = 0;
  const dailyPieSlices = dailyTrends.map((day) => {
    const slicePercent = weeklyTotalRevenue > 0 ? (day.revenue / weeklyTotalRevenue) * 100 : 0;
    const strokeDasharray = `${slicePercent} ${100 - slicePercent}`;
    const strokeDashoffset = 100 - accumulatedPercent;
    accumulatedPercent += slicePercent;
    return {
      ...day,
      percentOfTotal: slicePercent,
      strokeDasharray,
      strokeDashoffset: strokeDashoffset === 100 ? 0 : strokeDashoffset,
    };
  });

  // พาเลทสีแดงไล่เฉดพรีเมียมสำหรับ 7 วันเพื่อใช้ในพล็อต Pie Chart และไอคอนกำกับ
  const dailyColorPalette = [
    '#b91c1c', '#dc2626', '#ef4444', '#f43f5e', '#fda4af', '#f87171', '#991b1b'
  ];

  return (
    <div className="max-w-7xl w-full mx-auto px-6 pt-6 space-y-6 bg-stone-950 min-h-screen rounded-3xl p-6 text-stone-200 shadow-2xl border border-rose-950/40">
      
      {/* 🔴 ส่วนหัว Dashboard โทนสีแดงนีออน (ขยายฟอนต์หัวข้อหลัก) */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-rose-950 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-500 via-rose-400 to-amber-500 tracking-tight flex items-center gap-2">
            🚨 WIMUTI BAKE & DRIP INTELLIGENCE DASHBOARD
          </h2>
          <p className="text-base text-rose-400 font-bold mt-1"></p>
        </div>
        <div className="text-sm font-black bg-rose-950/40 text-red-400 px-4 py-2 rounded-xl border border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0">
          🔴 LIVE ANALYTICS
        </div>
      </div>

      {/* 🔴 แถวที่ 1: KPI Cards ไล่เฉดสีแดงพรีเมียม */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* กล่องที่ 1: รายได้ประจำสัปดาห์ */}
        <div className="bg-linear-to-br from-red-700 via-rose-800 to-red-950 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-red-900/30 transition-all border border-red-600/30">
          <div className="absolute -right-2.5 -bottom-5 opacity-10 text-9xl font-black italic">฿</div>
          <span className="text-sm font-black opacity-90 block tracking-wider uppercase text-rose-200">WEEKLY REVENUE</span>
          <span className="text-5xl font-black block mt-2 text-white">฿{weeklyTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <div className="mt-4 text-xs font-black bg-black/30 inline-block px-4 py-1.5 rounded-full text-rose-300 border border-rose-800/50">
            📊 ประสิทธิภาพการจำหน่ายรวม 7 วันย้อนหลัง
          </div>
        </div>

        {/* กล่องที่ 2: ค่าเฉลี่ยต่อบิล Ticket Size */}
        <div className="bg-stone-900 rounded-3xl border border-rose-950 p-6 shadow-sm flex flex-col justify-between hover:border-red-900/50 transition-colors">
          <div>
            <span className="text-sm font-black text-rose-500 block uppercase tracking-wider">AVERAGE TICKET SIZE</span>
            <span className="text-4xl font-black text-white block mt-2">฿{(dashboardData?.avg_ticket_size ?? 0).toFixed(2)}</span>
            <p className="text-sm text-stone-400 mt-3 font-bold leading-relaxed">
              มูลค่าเฉลี่ยที่ลูกค้าใช้จ่ายจริงต่อหนึ่งบิลคำสั่งซื้อ (ช่วยคำนวณพฤติกรรมการตัดสินใจหน้าร้าน)
            </p>
          </div>
        </div>

        {/* กล่องที่ 3: สรุปประเภทสินค้าขายดีแยกสัดส่วน */}
        <div className="bg-stone-900 rounded-3xl border border-rose-950 p-6 shadow-sm hover:border-red-900/50 transition-colors">
          <span className="text-sm font-black text-rose-500 block uppercase tracking-wider mb-3">SUMMARY OF OTHER STATS</span>
          <div className="mt-2 space-y-3 text-xs font-black">
            <div className="flex justify-between border-b border-stone-800/80 pb-2.5 text-sm">
              <span className="text-stone-400">📦 ออเดอร์ทำเสร็จ:</span>
              <span className="text-red-400 font-black">{dashboardData?.total_completed_orders ?? 0} บิล</span>
            </div>
            <div className="flex justify-between pt-1 text-sm">
              <span className="text-stone-400">💵 อัตราปิดยอดสด/โอน:</span>
              <span className="text-amber-400 font-black">เสถียรภาพปกติ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 แถวที่ 2: แผนภูมิโดนัทชำระเงิน, กราฟแนวโน้มรายวัน+Pie Chart รายวัน, และอันดับลูกค้าประจำ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* บล็อกซ้าย: วาดชิ้นงาน PIE CHART สัดส่วนรับเงินสด/โอน */}
        <div className="bg-stone-900 rounded-3xl border border-rose-950 p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <h3 className="text-base font-black text-rose-500 w-full text-left tracking-wide uppercase border-b border-stone-800 pb-2">
            📱 PAYMENT PROPORTIONS
          </h3>
          
          <div className="relative flex items-center justify-center my-6">
            <svg width="200" height="180" viewBox="0 0 42 42" className="transform -rotate-90">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4c0519" strokeWidth="6" />
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f43f5e" strokeWidth="6" 
                      strokeDasharray={strokeDasharrayTransfer} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col justify-center items-center bg-stone-950 w-26 h-24 rounded-full border border-rose-950 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]">
              <span className="text-xs font-black text-stone-400 uppercase tracking-wider">Transfer</span>
              <span className="text-2xl font-black text-white">{transferPercent.toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4 text-sm font-black border-t border-stone-800/60">
            <div className="flex items-center gap-2.5 justify-center bg-stone-950/40 p-2.5 rounded-xl border border-rose-950/20">
              <span className="w-3.5 h-3.5 bg-rose-500 rounded-full inline-block shadow-[0_0_8px_#f43f5e]"></span>
              <div className="text-left">
                <p className="text-stone-400 text-xs font-bold">📱 Transfer</p>
                <p className="text-white text-sm font-black">{transferPercent.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 justify-center bg-stone-950/40 p-2.5 rounded-xl border border-rose-950/20">
              <span className="w-3.5 h-3.5 bg-[#4c0519] rounded-full inline-block border border-red-900"></span>
              <div className="text-left">
                <p className="text-stone-400 text-xs font-bold">💵 Cash</p>
                <p className="text-white text-sm font-black">{cashPercent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* บล็อกกลาง: แผนภูมิแนวโน้มรายวัน และ Pie Chart วงกลมสัดส่วน 7 วันด้านล่าง */}
        <div className="bg-stone-900 rounded-3xl border border-rose-950 p-6 shadow-sm md:col-span-1 flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-base font-black text-rose-500 tracking-wide uppercase border-b border-stone-800 pb-2">
              📅 DAILY REVENUE TRENDS
            </h3>
            <div className="space-y-3 mt-4">
              {dailyTrends.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-black">
                  <span className="w-20 text-stone-400 text-xs">{day.date}</span>
                  <div className="flex-1 bg-stone-950 h-6 rounded-lg overflow-hidden relative border border-rose-950/40">
                    <div className="bg-linear-to-r from-red-800 to-rose-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]" 
                         style={{ width: `${day.percent}%` }}></div>
                    <span className="absolute inset-y-0 left-2 flex items-center text-white text-xs font-black">
                      ฿{day.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ส่วนเพิ่มเติม: Pie Chart สัดส่วนรายได้แยกสีรายวันทั้ง 7 วัน */}
          <div className="border-t border-stone-800/80 pt-4 flex flex-col items-center">
            <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider mb-4 w-full text-left">
              📊 REVENUE SHARE BY DAY
            </h4>
            
            <div className="relative flex items-center justify-center mb-4">
              <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
                {dailyPieSlices.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx="21" cy="21" r="15.91549430918954"
                    fill="transparent"
                    stroke={dailyColorPalette[idx % dailyColorPalette.length]}
                    strokeWidth="6"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col justify-center items-center bg-stone-950 w-18 h-18 rounded-full border border-rose-950">
                <span className="text-[10px] font-black text-rose-400">7 DAYS</span>
              </div>
            </div>

            {/* ไอคอนสีสัญลักษณ์สัดส่วนเปอร์เซ็นต์ประจำสัปดาห์ */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center text-[10px] font-bold text-stone-400">
              {dailyPieSlices.map((slice, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: dailyColorPalette[idx % dailyColorPalette.length] }}></span>
                  <span>{slice.date.split(' ')[0]}: {slice.percentOfTotal.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* บล็อกขวา: ตารางรายชื่อลูกค้าเปย์หนักขาประจำ */}
        <div className="bg-stone-900 rounded-3xl border border-rose-950 p-6 shadow-sm md:col-span-1">
          <h3 className="text-base font-black text-rose-500 tracking-wide uppercase border-b border-stone-800 pb-2">
            💎 TOP LOYALTY BUYERS
          </h3>
          <div className="space-y-3.5 mt-4">
            {(dashboardData?.top_buyers ?? []).map((buyer, index) => (
              <div key={index} className="flex justify-between items-center bg-stone-950 p-3 rounded-xl border border-rose-950/30 hover:border-red-900/60 transition-colors">
                <div className="space-y-1">
                  <div className="text-sm font-black text-stone-100">
                    <span className="text-red-500 mr-2">#{index + 1}</span>
                    {buyer.customer_name}
                  </div>
                  <div className="text-xs text-stone-400 font-bold">ปริมาณอุดหนุนรวม: {buyer.total_orders} บิล</div>
                </div>
                <div className="text-sm font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-400 shrink-0">
                  ฿{buyer.total_spent.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

