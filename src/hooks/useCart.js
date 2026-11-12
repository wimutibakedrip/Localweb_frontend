import { useState } from 'react';

export default function useCart(bakeryMenu, setBakeryMenu, API_URL, setActiveTab, fetchOrders) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("โอน");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [customDiscountInput, setCustomDiscountInput] = useState("");
  
  // ไอดีออเดอร์ที่กำลังแก้ไขอยู่ (ถ้าเป็น null แปลว่าโหมดสั่งซื้อปกติ)
  const [editingOrderId, setEditingOrderId] = useState(null);

  const getSubtotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.count), 0);
  const getDiscountAmount = () => discountType === 'percent' ? (getSubtotalPrice() * discountValue) / 100 : discountValue;
  const getNetPrice = () => Math.max(0, getSubtotalPrice() - getDiscountAmount());
  const handleQuickDiscount = (pct) => { setDiscountType('amount'); setDiscountValue(pct); };
  const applyCustomDiscount = () => { setDiscountValue(parseFloat(customDiscountInput) || 0); };

  const addToCart = (product, text = "") => {
    const currentMenuProduct = bakeryMenu.find(p => p.id === product.id);
    if (!currentMenuProduct || currentMenuProduct.pieces < 1) {
      return alert("ขออภัย! สินค้านี้หมดคลังสต็อกชั่วคราว ไม่สามารถเพิ่มได้");
    }

    // หักสต็อกสินค้าหน้าร้านลง 1 ชิ้น
    setBakeryMenu(bakeryMenu.map(p => p.id === product.id ? { ...p, pieces: p.pieces - 1 } : p));

    // ตรวจสอบว่าในตะกร้ามีสินค้านี้ที่มี customText เดียวกันอยู่แล้วหรือไม่
    const existingItem = cart.find(item => item.id === product.id && item.customText === text);

    if (existingItem) {
      // ถ้ามีอยู่แล้ว ให้บวกจำนวนเพิ่มขึ้น 1
      setCart(cart.map(item => 
        item.cartId === existingItem.cartId 
          ? { ...item, count: item.count + 1 } 
          : item
      ));
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเป็นรายการใหม่ในตะกร้า และเริ่มนับ count เป็น 1
      const uniqueCartId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setCart([...cart, { ...product, count: 1, customText: text, cartId: uniqueCartId }]);
    }
  };

  const removeFromCart = (cartId) => {
    const targetItem = cart.find(item => item.cartId === cartId);
    if (!targetItem) return;

    // คืนสต็อกให้หน้าร้านคืน 1 ชิ้น
    setBakeryMenu(bakeryMenu.map(p => p.id === targetItem.id ? { ...p, pieces: p.pieces + 1 } : p));

    if (targetItem.count > 1) {
      // ถ้าจำนวนมากกว่า 1 ให้ลดจำนวนลงทีละ 1 ชิ้น
      setCart(cart.map(item => 
        item.cartId === cartId 
          ? { ...item, count: item.count - 1 } 
          : item
      ));
    } else {
      // ถ้าจำนวนเหลือ 1 ชิ้นพอดี เมื่อกดลบ ให้เอาออกจากตะกร้าไปเลย
      setCart(cart.filter(item => item.cartId !== cartId));
    }
  };

  // ฟังก์ชันดึงประวัติออเดอร์เก่า ยัดกลับเข้าตะกร้าสินค้า ---------------------------------------------
  const loadOrderToCart = (order) => {
    if (order.status === "สำเร็จ" || order.status === "ยกเลิก") {
      return alert("ไม่สามารถแก้ไขออเดอร์ที่มีสถานะ สำเร็จ หรือ ยกเลิก ได้!");
    }

    const loadedItems = order.items.map(item => {
      const uniqueCartId = `${item.product_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return {
        id: item.product_id,
        name: item.product?.name || "เมนูถูกนำออกจากระบบ",
        price: item.price,
        count: item.quantity,
        customText: "", 
        cartId: uniqueCartId
      };
    });

    setCart(loadedItems);
    setCustomerName(order.customer_name || "");
    setOrderNotes(order.notes || "");
    setPaymentMethod(order.payment_method || "โอน");
    setDiscountType("amount");
    setDiscountValue(order.discount_price || 0);
    setEditingOrderId(order.id); // ล็อกไอดีบิลเก่าเอาไว้
    setIsCartOpen(true); 
    setActiveTab('shop');
    alert(`ดึงข้อมูลออเดอร์ #${order.id} เข้าสู่ตะกร้าแล้ว สามารถเพิ่ม/ลดสินค้าได้ตามต้องการ`);
  };

  // --------- ฟังค์ชั่นชำระเงิน --------------------------------------------------------------------------
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("ไม่พบสินค้าในตะกร้าของคุณ!");
    
    const orderData = {     
      customer_name: customerName,
      notes: orderNotes,      
      discount_price: parseFloat(discountValue) || 0.0,
      payment_method: paymentMethod,
      items: cart.map(item => ({ product_id: item.id, quantity: item.count })) 
    };

    // สลับ Endpoint และ Method อัตโนมัติตามโหมดการทำงาน
    const isEditMode = editingOrderId !== null;
    const requestUrl = isEditMode ? `${API_URL}/orders/${editingOrderId}` : `${API_URL}/orders`;
    const requestMethod = isEditMode ? "PUT" : "POST";

    try {
        const response = await fetch(requestUrl, {
        method: requestMethod, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(orderData),
        });

      if (response.ok) {

        alert(isEditMode ? "💾 บันทึกการแก้ไขออเดอร์เดิมเรียบร้อยแล้ว!" : "✨ ทำรายการคำสั่งซื้อสำเร็จ!!!!!!");
        setCart([]); 
        setCustomerName(""); 
        setOrderNotes(""); 
        setDiscountValue(0); 
        setCustomDiscountInput(""); 
        setIsCartOpen(false);
        setPaymentMethod("โอน");
        setEditingOrderId(null); // ล้างไอดีแก้ไขทิ้ง
        setActiveTab('tracking'); 
        fetchOrders();
      } else { 
        const res = await response.json(); 
        alert("ทำรายการไม่สำเร็จ: " + res.detail); 
      }
    } catch (error) { 
      alert("ไม่สามารถเชื่อมต่อระบบสั่งซื้อได้"); 
    }
  };

  return {
    cart, setCart, isCartOpen, setIsCartOpen, customerName, setCustomerName, orderNotes, setOrderNotes,
    paymentMethod, setPaymentMethod, discountType, setDiscountType, discountValue, customDiscountInput, 
    setCustomDiscountInput, getSubtotalPrice, getDiscountAmount, getNetPrice, handleQuickDiscount, 
    applyCustomDiscount, addToCart, removeFromCart, handleCheckout,
    editingOrderId, loadOrderToCart
  };
}
