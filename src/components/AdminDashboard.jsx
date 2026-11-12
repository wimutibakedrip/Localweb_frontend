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

  if (isLoading) {
    return (
      <p className="text-center py-8 text-rose-500 font-bold text-sm animate-pulse">
        กำลังประมวลผลข้อมูลแดชบอร์ด...
      </p>
    );
  }

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

  const dailyColorPalette = [
    '#b91c1c', '#dc2626', '#ef4444', '#f43f5e', '#fda4af', '#f87171', '#991b1b'
  ];

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-5 bg-stone-950 min-h-screen rounded-3xl p-5 text-stone-200 shadow-2xl border border-rose-950/40">
      
      {/* 🔴 ส่วนหัว Dashboard โทนสีแดงนีออน */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-rose-950 pb-3.5 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-red-500 via-rose-400 to-amber-500 tracking-tight flex items-center gap-2">
            🚨 WIMUTI BAKE & DRIP INTELLIGENCE DASHBOARD
          </h2>
        </div>
        <div className="text-xs font-bold bg-rose-950/40 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] shrink-0 self-start sm:self-auto">
          🔴 LIVE ANALYTICS
        </div>
      </div>

      {/* 🔴 แถวที่ 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* กล่องที่ 1: รายได้ประจำสัปดาห์ */}
        <div className="bg-linear-to-br from-red-700 via-rose-800 to-red-950 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group hover:shadow-red-900/30 transition-all border border-red-600/30">
          <div className="absolute -right-2 -bottom-4 opacity-10 text-7xl font-black italic">฿</div>
          <span className="text-xs font-bold opacity-90 block tracking-wider uppercase text-rose-200">
            WEEKLY REVENUE
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold block mt-1.5 text-white">
            ฿{weeklyTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <div className="mt-3 text-[11px] font-semibold bg-black/30 inline-block px-3 py-1 rounded-full text-rose-200 border border-rose-800/50">
            📊 ยอดขายรวม 7 วันย้อนหลัง
          </div>
        </div>

        {/* กล่องที่ 2: ค่าเฉลี่ยต่อบิล Ticket Size */}
        <div className="bg-stone-900 rounded-2xl border border-rose-950 p-5 shadow-sm flex flex-col justify-between hover:border-red-900/50 transition-colors">
          <div>
            <span className="text-xs font-bold text-rose-500 block uppercase tracking-wider">
              AVERAGE TICKET SIZE
            </span>
            <span className="text-2xl font-extrabold text-white block mt-1.5">
              ฿{(dashboardData?.avg_ticket_size ?? 0).toFixed(2)}
            </span>
            <p className="text-xs text-stone-400 mt-2 font-medium leading-relaxed">
              มูลค่าเฉลี่ยที่ลูกค้าใช้จ่ายจริงต่อหนึ่งบิลคำสั่งซื้อ
            </p>
          </div>
        </div>

        {/* กล่องที่ 3: สรุปสถิติอื่นๆ */}
        <div className="bg-stone-900 rounded-2xl border border-rose-950 p-5 shadow-sm hover:border-red-900/50 transition-colors">
          <span className="text-xs font-bold text-rose-500 block uppercase tracking-wider mb-2.5">
            SUMMARY OF OTHER STATS
          </span>
          <div className="mt-1 space-y-2 text-xs font-semibold">
            <div className="flex justify-between border-b border-stone-800/80 pb-2">
              <span className="text-stone-400">📦 ออเดอร์ทำเสร็จ:</span>
              <span className="text-red-400 font-bold">{dashboardData?.total_completed_orders ?? 0} บิล</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-stone-400">💵 อัตราปิดยอดสด/โอน:</span>
              <span className="text-amber-400 font-bold">เสถียรภาพปกติ</span>
            </div>
          </div>
        </div>
      </div>
      {/* 🔴 แถวที่ 2: แผนภูมิโดนัทชำระเงิน, กราฟแนวโน้มรายวัน, และอันดับลูกค้าประจำ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* บล็อกซ้าย: สัดส่วนรับเงินสด/โอน */}
        <div className="bg-stone-900 rounded-2xl border border-rose-950 p-5 shadow-sm flex flex-col justify-between items-center text-center">
          <h3 className="text-xs font-bold text-rose-500 w-full text-left tracking-wider uppercase border-b border-stone-800 pb-2">
            📱 PAYMENT PROPORTIONS
          </h3>
          
          <div className="relative flex items-center justify-center my-4">
            <svg width="170" height="160" viewBox="0 0 42 42" className="transform -rotate-90">
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4c0519" strokeWidth="5.5" />
              <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f43f5e" strokeWidth="5.5" 
                      strokeDasharray={strokeDasharrayTransfer} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col justify-center items-center bg-stone-950 w-22 h-22 rounded-full border border-rose-950 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Transfer</span>
              <span className="text-lg font-extrabold text-white">{transferPercent.toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full pt-3 text-xs font-semibold border-t border-stone-800/60">
            <div className="flex items-center gap-2 justify-center bg-stone-950/40 p-2 rounded-xl border border-rose-950/20">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block shadow-[0_0_8px_#f43f5e]"></span>
              <div className="text-left">
                <p className="text-stone-400 text-[11px]">📱 Transfer</p>
                <p className="text-white text-xs font-bold">{transferPercent.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-center bg-stone-950/40 p-2 rounded-xl border border-rose-950/20">
              <span className="w-2.5 h-2.5 bg-[#4c0519] rounded-full inline-block border border-red-900"></span>
              <div className="text-left">
                <p className="text-stone-400 text-[11px]">💵 Cash</p>
                <p className="text-white text-xs font-bold">{cashPercent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* บล็อกกลาง: แผนภูมิแนวโน้มรายวัน และ Pie Chart 7 วัน */}
        <div className="bg-stone-900 rounded-2xl border border-rose-950 p-5 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-rose-500 tracking-wider uppercase border-b border-stone-800 pb-2">
              📅 DAILY REVENUE TRENDS
            </h3>
            <div className="space-y-2.5 mt-3">
              {dailyTrends.map((day, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold">
                  <span className="w-16 text-stone-400 text-[11px]">{day.date}</span>
                  <div className="flex-1 bg-stone-950 h-5 rounded-md overflow-hidden relative border border-rose-950/40">
                    <div className="bg-linear-to-r from-red-800 to-rose-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.3)]" 
                         style={{ width: `${day.percent}%` }}></div>
                    <span className="absolute inset-y-0 left-2 flex items-center text-white text-[11px] font-bold">
                      ฿{day.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-800/80 pt-3 flex flex-col items-center">
            <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3 w-full text-left">
              📊 REVENUE SHARE BY DAY
            </h4>
            
            <div className="relative flex items-center justify-center mb-3">
              <svg width="130" height="130" viewBox="0 0 42 42" className="transform -rotate-90">
                {dailyPieSlices.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx="21" cy="21" r="15.91549430918954"
                    fill="transparent"
                    stroke={dailyColorPalette[idx % dailyColorPalette.length]}
                    strokeWidth="5.5"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col justify-center items-center bg-stone-950 w-16 h-16 rounded-full border border-rose-950">
                <span className="text-[9px] font-bold text-rose-400">7 DAYS</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-2.5 gap-y-1 justify-center text-[10px] font-medium text-stone-400">
              {dailyPieSlices.map((slice, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: dailyColorPalette[idx % dailyColorPalette.length] }}></span>
                  <span>{slice.date.split(' ')[0]}: {slice.percentOfTotal.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* บล็อกขวา: ตารางรายชื่อลูกค้าประจำ */}
        <div className="bg-stone-900 rounded-2xl border border-rose-950 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-rose-500 tracking-wider uppercase border-b border-stone-800 pb-2">
            💎 TOP LOYALTY BUYERS
          </h3>
          <div className="space-y-2.5 mt-3">
            {(dashboardData?.top_buyers ?? []).map((buyer, index) => (
              <div key={index} className="flex justify-between items-center bg-stone-950 p-2.5 rounded-xl border border-rose-950/30 hover:border-red-900/60 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-stone-100">
                    <span className="text-red-500 mr-1.5">#{index + 1}</span>
                    {buyer.customer_name}
                  </div>
                  <div className="text-[11px] text-stone-400 font-medium">อุดหนุนรวม: {buyer.total_orders} บิล</div>
                </div>
                <div className="text-xs font-extrabold text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-400 shrink-0">
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
