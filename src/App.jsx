import './index.css';
import React, { useState, useEffect } from 'react';
import {API_URL, CATEGORIES } from './data/menuData';
import AdminPanel from './components/AdminPanel';
import OrderDetailModal from './components/OrderDetailModal';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import CakeModal from './CakeModal';
import SalesPanel from './components/SalesPanel'; 
import useCart from './hooks/useCart';
import OrderStatus from './components/OrderStatus';
import PrintReceiptModal_V2 from './components/PrintReceiptModal_V2';
import AdminDashboard from './components/AdminDashboard';
import ProductTracking from './components/ProductTracking';

export default function App() {
  const [role, setRole] = useState('user'); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('shop'); 
  const [orders, setOrders] = useState([]);
  const [salesSummary, setSalesSummary] = useState({ total_revenue: 0, total_cash: 0, total_transfer: 0, status_distribution: {}, top_products: [] });
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [adminPassword, setAdminPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false); 
  const [bakeryMenu, setBakeryMenu] = useState([]);
  const [printOrderData, setPrintOrderData] = useState(null);

  // State สำหรับเก็บวันที่ดึงรายงาน
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // เรียกใช้งานระบบ Logic ตะกร้าที่แยกไฟล์ออกไปก่อนหน้านี้
  const {
    cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, orderNotes, setOrderNotes,
    paymentMethod, setPaymentMethod, discountType, setDiscountType, discountValue, customDiscountInput, 
    setCustomDiscountInput, getSubtotalPrice, getDiscountAmount, getNetPrice, handleQuickDiscount, 
    applyCustomDiscount, addToCart, removeFromCart, handleCheckout,
    editingOrderId, setEditingOrderId, loadOrderToCart
  } = useCart(bakeryMenu, setBakeryMenu, API_URL, setActiveTab, () => fetchOrders(selectedDate));
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'shop') {
      fetchProducts();
    } else if (activeTab === 'tracking' || activeTab === 'product-tracking') {
      fetchOrders(selectedDate);
    } else if (activeTab === 'sales') {
      fetchSalesSummary(selectedDate);
    }
  }, [activeTab, selectedDate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setBakeryMenu(data);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเมนู:", error);
    }
  };

  const fetchOrders = async (date = selectedDate) => {
      setIsTrackingLoading(true);
      try {
        const response = await fetch(`${API_URL}/orders?selected_date=${date}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลออเดอร์:", error);
      } finally {
        setIsTrackingLoading(false);
      }
  };

  const fetchSalesSummary = async (date = selectedDate) => {
    try {
      const response = await fetch(`${API_URL}/sales/summary?selected_date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setSalesSummary({
          total_revenue: data.total_revenue ?? 0,
          total_cash: data.total_cash ?? 0,
          total_transfer: data.total_transfer ?? 0,
          status_distribution: data.status_distribution ?? {},
          top_products: Array.isArray(data.top_products) ? data.top_products : []
        });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดรายงานยอดขาย:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchOrders(); 
        if (activeTab === 'sales') fetchSalesSummary();
      } else {
        const err = await response.json();
        alert("ไม่สามารถอัปเดตสถานะได้: " + err.detail);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault(); setLoginError("");
    try {
      const response = await fetch(`${API_URL}/admin/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const result = await response.json();
      if (response.ok) {
        setRole('admin'); setShowLoginModal(false); setAdminPassword("");        
      } else { setLoginError(result.detail || "รหัสผ่านไม่ถูกต้อง"); }
    } catch (error) { setLoginError("ไม่สามารถเชื่อมต่อกับ Server ได้"); }
  };

  const handleToggleRole = () => {
    if (role === 'admin') { setRole('user'); setActiveTab('shop'); } 
    else { setShowLoginModal(true); }
  };

  const [isEditing, setIsEditing] = useState(null);
  const [formName, setFormName] = useState(""); const [formCategory, setFormCategory] = useState("🍰 Cake");
  const [formPrice, setFormPrice] = useState(""); const [formPieces, setFormPieces] = useState("");
  const [formImage, setFormImage] = useState("https://unsplash.com"); const [formDesc, setFormDesc] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("🍰 Cake");
  const [selectedProduct, setSelectedProduct] = useState(null); const [customText, setCustomText] = useState("");

  const initialFiltered  = role === 'admin'
    ? (selectedCategory === "🍽️ ทั้งหมด" ? bakeryMenu : bakeryMenu.filter(p => p.category === selectedCategory))
    : (selectedCategory === "🍽️ ทั้งหมด" ? bakeryMenu.filter(p => p.is_active !== false) : bakeryMenu.filter(p => p.category === selectedCategory && p.is_active !== false));
  
  // ปรับการเรียงลำดับ: เรียงตามกลุ่ม (category) ก่อน ถ้ากลุ่มเหมือนกันค่อยเรียงตามชื่อ (name)
  const filteredProducts = [...initialFiltered].sort((a, b) => {
    
    // ฟังก์ชันช่วยหาตำแหน่ง Index จากตัวแปร CATEGORIES ที่อ้างอิงมาจากเมนูฝั่งซ้าย
    const getCategoryIndex = (categoryName) => {
      if (!categoryName) return 99;
      
      // หาตำแหน่งที่ตรงกันเป๊ะก่อน
      let idx = CATEGORIES.indexOf(categoryName);
      if (idx !== -1) return idx;
      
      // ถ้าไม่ตรงเป๊ะ ให้เช็คว่ามีข้อความส่วนใดส่วนหนึ่งตรงกับใน CATEGORIES ไหม
      idx = CATEGORIES.findIndex(cat => categoryName.includes(cat) || cat.includes(categoryName));
      return idx !== -1 ? idx : 99; // ถ้าไม่เจอเลยให้ไปอยู่ท้ายสุด (คะแนน 99)
    };

    const indexA = getCategoryIndex(a.category);
    const indexB = getCategoryIndex(b.category);

    // 1. เปรียบเทียบลำดับหมวดหมู่ตาม CATEGORIES ก่อน
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    // 2. ถ้าเป็นหมวดหมู่กลุ่มเดียวกัน ให้เรียงตามชื่อสินค้าภาษาไทย ก-ฮ ต่อทันที
    return a.name.localeCompare(b.name, 'th');
  });
  
  const handleSaveProduct = async (e) => {
    e.preventDefault(); 
    if (!formName || !formPrice) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    
    const finalPieces = formPieces === "" || formPieces === null ? 0 : parseInt(formPieces);
    if (finalPieces < 0) {
      return alert("จำนวนชิ้นต้องไม่ติดลบ");
    }

    const formData = new FormData();
    formData.append("name", formName); formData.append("category", formCategory);
    formData.append("price", parseFloat(formPrice)); formData.append("pieces", parseInt(formPieces));
    formData.append("desc", formDesc || ""); formData.append("image", formImage.trim() || "https://unsplash.com");
    if (selectedFile) formData.append("file", selectedFile); 

    try {
      let response = isEditing 
        ? await fetch(`${API_URL}/products/${isEditing}`, { method: "PUT", body: formData })
        : await fetch(`${API_URL}/products`, { method: "POST", body: formData });
      if (response.ok) {          
        clearForm(); setSelectedFile(null); fetchProducts();
      } else { 
        const result = await response.json(); alert("เกิดข้อผิดพลาด: " + (result.detail || "ไม่สามารถบันทึกได้")); 
      }
    } catch (error) { alert("ไม่สามารถเชื่อมต่อกับ Server ได้"); }  
  };

  const handleEditClick = (p) => {
    setIsEditing(p.id); setFormName(p.name); setFormCategory(p.category); setFormPrice(p.price);
    setFormPieces(p.pieces); setFormImage(p.image); setFormDesc(p.desc); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้ออกจากร้าน?")) return;       
    try {
      const response = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      if (response.ok) fetchProducts();
      else { const errorData = await response.json(); alert("ไม่สามารถลบได้: " + errorData.detail); }
    } catch (error) { alert("เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อลบสินค้า"); }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}/toggle-status`, { method: "PATCH" });
      const result = await response.json();
      if (response.ok) { setBakeryMenu(bakeryMenu.map(p => p.id === id ? result.data : p)); }
    } catch (error) { alert("ไม่สามารถเชื่อมต่อกับ Server ได้"); }
  };

  const clearForm = () => {
    setIsEditing(null); setFormName(""); setFormPrice(""); setFormPieces(""); setFormImage("https://unsplash.com"); setFormDesc("");
  };

  return (
    <div className="min-h-screen bg-orange-50/10 text-stone-800 font-sans flex flex-col">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <img 
              src="/logo.png" 
              alt="Wimuti Bake & Drip" 
              onClick={() => setActiveTab('shop')} 
              className="h-12 w-auto object-contain cursor-pointer" 
            />
            <div className="flex space-x-1">
              <button onClick={() => setActiveTab('shop')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'shop' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-orange-50/50 hover:text-orange-600'}`}>🧁 หน้าร้านค้า</button>
              <button onClick={() => setActiveTab('tracking')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'tracking' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-orange-50/50 hover:text-orange-600'}`}>📦 ติดตามออเดอร์</button>
              {role !== 'admin' && (
                  <button onClick={() => setActiveTab('product-tracking')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'product-tracking' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-orange-50/50 hover:text-orange-600'}`}>🧺 ติดตามสินค้า</button>
              )}
              {role === 'admin' && (
                <>
                  <button onClick={() => setActiveTab('sales')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'sales' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-orange-50/50 hover:text-orange-600'}`}>📊 รายงานยอดขาย</button>
                  <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-600 hover:bg-orange-50/50 hover:text-orange-600'}`}>📈 Dashboard</button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCartOpen(true)} className="bg-orange-100 text-orange-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-200 transition relative">🛒 ตะกร้า ({cart.reduce((sum, item) => sum + item.count, 0)})</button>
            <button onClick={handleToggleRole} className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition ${role === 'admin' ? 'bg-red-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}>{role === 'admin' ? 'ออกจากระบบ ADMIN' : '🔒 แอดมิน'}</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {role === 'admin' && (
              <AdminPanel formName={formName} setFormName={setFormName} formCategory={formCategory} setFormCategory={setFormCategory} formPrice={formPrice} setFormPrice={setFormPrice} formPieces={formPieces} setFormPieces={setFormPieces} formImage={formImage} setFormImage={setFormImage} formDesc={formDesc} setFormDesc={setFormDesc} isEditing={isEditing} clearForm={clearForm} handleSaveProduct={handleSaveProduct} setSelectedFile={setSelectedFile} />
            )}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-48 bg-white border border-stone-200 p-4 rounded-2xl shrink-0 space-y-1 shadow-xs">
                <p className="text-lg font-bold text-black px-3 mb-2 uppercase tracking-wider"> เมนูร้านค้า</p>
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-xs' : 'text-stone-600 hover:bg-orange-50/50 hover:text-orange-600'}`}>{cat}</button>
                ))}
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-orange-100 transition">
                    <div>
                      <img src={product.image} alt={product.name} className="w-full h-44 object-cover bg-stone-100" onError={(e) => { e.target.onerror = null; e.target.src = "https://unsplash.com"; }} />
                      <div className="p-4">
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-bold text-stone-800 text-base leading-tight">{product.name}</h3>
                          <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-1.5 py-0.5 rounded border border-orange-100 shrink-0">{product.category}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">{product.desc || "ไม่มีคำอธิบายเมนูนี้"}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-black text-orange-600">฿{product.price}</span>
                        <span className={`text-xs ${product.pieces > 0 ? 'text-green-600' : 'text-red-500'} font-medium`}>{product.pieces > 0 ? `คงเหลือ ${product.pieces} ชิ้น` : "สินค้าหมด"}</span>
                      </div>
                      {role === 'admin' ? (
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => handleEditClick(product)} className="text-xs bg-stone-100 hover:bg-stone-200 py-1.5 rounded-lg font-medium text-stone-700">⚙️ แก้ไข</button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg font-medium">🗑️ ลบ</button>
                          </div>
                          <button onClick={() => handleToggleStatus(product.id)} className={`text-xs w-full py-1.5 rounded-lg font-bold border transition ${product.is_active ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-stone-100 text-stone-400 border-stone-200'}`}>{product.is_active ? "🟠 เปิดขายอยู่" : "⚪ ปิดขายชั่วคราว"}</button>
                        </div>
                      ) : (
                        <button disabled={product.pieces <= 0} onClick={() => addToCart(product)} className="w-full bg-orange-500 text-white font-bold py-2 rounded-xl text-xs hover:bg-orange-600 transition disabled:bg-stone-200 disabled:text-stone-400">{product.pieces > 0 ? "🛒 ใส่ตะกร้า" : "หมดชั่วคราว"}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'tracking' && (
          <OrderStatus 
            orders={orders} selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            isTrackingLoading={isTrackingLoading} setSelectedOrderDetails={setSelectedOrderDetails}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
            loadOrderToCart={loadOrderToCart} 
            onPrintOrder={setPrintOrderData}            
          />
        )}
        {activeTab === 'product-tracking' && (
          <ProductTracking
            orders={orders}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            isTrackingLoading={isTrackingLoading}
          />
        )}        
        {activeTab === 'sales' && role === 'admin' && (
          <div className="space-y-4">
            <div className="max-w-7xl w-full mx-auto px-6 pt-4 flex justify-end">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-[#4A2810] shadow-sm">
                <span className="text-sm font-bold text-gray-600">📅 เลือกวันสรุปยอด:</span>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm font-black text-[#4A2810] focus:outline-none cursor-pointer" />
              </div>
            </div>          
            {/* 💡 อัปเดตส่งพารามิเตอร์ selectedDate เข้าไปในคอมโพเนนต์ด้วย */}
            <SalesPanel salesSummary={salesSummary} selectedDate={selectedDate} API_URL={API_URL}/>
          </div> 
        )}
        {activeTab === 'dashboard' && role === 'admin' && (
          <AdminDashboard selectedDate={selectedDate} API_URL={API_URL} />
        )}
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-stone-900 mb-1">🔒 เข้าสู่ระบบแอดมิน</h3>
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="กรอกรหัสผ่าน" className="w-full px-3 py-2 border rounded-xl text-sm focus:border-orange-500 focus:outline-none" required />
              {loginError && <p className="text-red-500 text-xs font-medium">{loginError}</p>}
              <div className="flex gap-2 justify-end text-xs">
                <button type="button" onClick={() => { setShowLoginModal(false); setAdminPassword(""); setLoginError(""); }} className="px-4 py-2 border rounded-lg">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600">ยืนยันรหัส</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CartDrawer 
        isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cart={cart} customerName={customerName} setCustomerName={setCustomerName} 
        orderNotes={orderNotes} setOrderNotes={setOrderNotes} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} 
        removeFromCart={removeFromCart} discountType={discountType} setDiscountType={setDiscountType} discountValue={discountValue} 
        customDiscountInput={customDiscountInput} setCustomDiscountInput={setCustomDiscountInput} handleQuickDiscount={handleQuickDiscount} 
        applyCustomDiscount={applyCustomDiscount} handleCheckout={handleCheckout} subtotalPrice={getSubtotalPrice()} 
        discountAmount={getDiscountAmount()} netPrice={getNetPrice()} editingOrderId={editingOrderId}
      />
      <CakeModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onConfirm={(text) => { addToCart(selectedProduct, text); setSelectedProduct(null); }} customText={customText} setCustomText={setCustomText} />
      <OrderDetailModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} /> 
      <PrintReceiptModal_V2 order={printOrderData} isOpen={!!printOrderData} onClose={() => setPrintOrderData(null)} />       
    </div>
  );    
}
