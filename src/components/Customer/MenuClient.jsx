"use client";

import { useState, useEffect } from "react";
import { Bell, ShoppingBag, Plus, X, CheckCircle2, Minus, ChevronRight, Info, Search } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CAFE_DOCUMENT_ID } from "../../services/menuService";
import { sendWaiterCall } from "../../services/waiterService";
import { placeOrder } from "../../services/orderService";

const WAITER_ACTIONS = [
  { label: "Water", emoji: "💧" },
  { label: "Waiter", emoji: "🙋" },
  { label: "Bill", emoji: "🧾" },
  { label: "Clean", emoji: "🧹" },
];

export default function MenuClient({ restaurantData }) {
  const [liveData, setLiveData]             = useState(restaurantData);
  const [activeCategory, setActiveCategory] = useState(restaurantData.categories?.[0] || "");
  const [cart, setCart]                     = useState([]);
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [showCartModal, setShowCartModal]   = useState(false);
  const [orderState, setOrderState]         = useState("");
  const [tableNumber, setTableNumber]       = useState("");
  const [showTablePrompt, setShowTablePrompt] = useState(true);
  const [toast, setToast]                   = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");

  const triggerToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load Persistence on Mount
  useEffect(() => {
    const savedCart = localStorage.getItem("smart_cart");
    const savedTable = localStorage.getItem("smart_table");
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedTable) {
      setTableNumber(savedTable);
      setShowTablePrompt(false);
    }
  }, []);

  // Sync Persistence
  useEffect(() => {
    localStorage.setItem("smart_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (tableNumber) localStorage.setItem("smart_table", tableNumber);
  }, [tableNumber]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "menus", CAFE_DOCUMENT_ID), (snap) => {
      if (snap.exists()) setLiveData(snap.data());
    });
    return unsub;
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.id === item.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      if (next[idx].qty > 1) {
        next[idx] = { ...next[idx], qty: next[idx].qty - 1 };
        return next;
      }
      return prev.filter(c => c.id !== id);
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartItem  = (id) => cart.find(c => c.id === id);

  const handleWaiterCall = async (action) => {
    setShowWaiterModal(false);
    const res = await sendWaiterCall(tableNumber, action);
    triggerToast(res.success ? `Request sent!` : "Failed. Try again.", res.success ? "success" : "error");
  };

  const handleCheckout = async () => {
    if (!cart.length) return;
    setOrderState("sending");
    const res = await placeOrder(tableNumber, cart, cartTotal);
    if (res.success) {
      setOrderState("success");
      setTimeout(() => { 
        setCart([]); 
        localStorage.removeItem("smart_cart"); // Clear after success
        setShowCartModal(false); 
        setOrderState(""); 
        triggerToast("Order Placed! 👨‍🍳"); 
      }, 1500);
    } else {
      triggerToast("Failed.", "error");
      setOrderState("");
    }
  };

  const filteredItems = (liveData.items || []).filter(i => {
    const match = i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                i.category.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery ? match : i.category === activeCategory;
  });

  return (
    <>
      <style>{`
        @keyframes slideDown { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .menu-item-row { border-bottom: 0.5px solid rgba(207, 169, 104, 0.1); padding: 1.25rem 0; display: flex; gap: 1rem; align-items: flex-start; }
        .menu-item-row:last-child { border-bottom: none; }
      `}</style>

      <div style={{ background: "var(--bg-primary)", minHeight: "100vh", position: "relative", maxWidth: "500px", margin: "0 auto", paddingBottom: "100px" }}>
        
        {/* Clean Toast */}
        {toast && (
          <div style={{ position: "fixed", top: "20px", left: "50%", zIndex: 1000, background: toast.type === "success" ? "var(--success)" : "var(--danger)", color: "#fff", padding: "0.6rem 1.2rem", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 700, boxShadow: "0 8px 30px rgba(0,0,0,0.3)", animation: "slideDown 0.3s ease forwards" }}>
            {toast.msg}
          </div>
        )}

        {/* Table Selector */}
        {showTablePrompt && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(15px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <div style={{ background: "var(--bg-secondary)", padding: "2.5rem 2rem", borderRadius: "32px", width: "100%", textAlign: "center", border: "1px solid var(--border-color)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🍽️</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", marginBottom: "0.5rem", letterSpacing: "-0.5px" }}>Welcome!</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>Enter your table number to view the digital menu.</p>
              
              <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="e.g. 12" 
                  value={tableNumber} 
                  onChange={e => setTableNumber(e.target.value)} 
                  style={{ width: "100%", background: "var(--bg-tertiary)", border: "2px solid var(--border-color)", padding: "1.2rem", borderRadius: "18px", color: "#fff", textAlign: "center", fontSize: "1.5rem", fontWeight: 800, outline: "none", transition: "border-color 0.3s" }} 
                />
              </div>

              <button 
                onClick={() => {
                  if(tableNumber) {
                    setShowTablePrompt(false);
                  }
                }} 
                style={{ width: "100%", background: "var(--accent-primary)", color: "#fff", padding: "1.2rem", borderRadius: "18px", fontWeight: 900, fontSize: "1rem", letterSpacing: "1px", boxShadow: "0 10px 25px rgba(207, 169, 104, 0.3)" }}
              >
                BROWSE MENU
              </button>
            </div>
          </div>
        )}

        {/* Main UI - Only render after table selection for performance */}
        {!showTablePrompt && (
          <>
            {/* Minimalist Header */}
            <header style={{ padding: "1.25rem 1.25rem 0.75rem", background: "var(--bg-secondary)", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid var(--glass-border)", animation: "fadeIn 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--accent-primary)", letterSpacing: "-0.3px" }}>{liveData.name}</h1>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "2px" }}>
                    <div style={{ width: "6px", height: "6px", background: "var(--success)", borderRadius: "50%" }} />
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Ordering Active</span>
                  </div>
                </div>
                <div style={{ background: "var(--bg-tertiary)", padding: "0.3rem 0.75rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "var(--accent-primary)", display: "block", textAlign: "center" }}>TABLE</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "#fff", display: "block", textAlign: "center", lineHeight: 1 }}>{tableNumber}</span>
                </div>
              </div>

              {/* Floating Search Bar */}
              <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input 
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: "100%", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", padding: "0.75rem 1rem 0.75rem 2.8rem", borderRadius: "16px", color: "#fff", fontSize: "0.9rem", outline: "none", fontWeight: 600 }}
                />
                {searchQuery && (
                   <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Compact Category Chips - Hide when searching */}
              {!searchQuery && (
                <div className="hide-scrollbar" style={{ display: "flex", gap: "0.6rem", overflowX: "auto", marginTop: "1rem", paddingBottom: "0.5rem" }}>
                  {(liveData.categories || []).map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: "0.45rem 1.2rem", borderRadius: "30px", fontSize: "0.75rem", fontWeight: 800, whiteSpace: "nowrap", background: activeCategory === cat ? "var(--accent-primary)" : "var(--bg-tertiary)", color: activeCategory === cat ? "#fff" : "var(--text-secondary)", border: "1px solid", borderColor: activeCategory === cat ? "var(--accent-primary)" : "transparent", transition: "all 0.2s" }}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </header>

            {/* High-Density Menu List */}
            <main style={{ padding: "0 1.25rem", animation: "fadeIn 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "1.25rem 0 0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>{activeCategory}</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(207, 169, 104, 0.1)" }} />
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-secondary)" }}>{filteredItems.length} ITEMS</span>
              </div>

              {filteredItems.map(item => {
                const inCart = cartItem(item.id);
                return (
                  <div key={item.id} className="menu-item-row" style={{ animation: "fadeIn 0.4s ease" }}>
                    {/* Text Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "4px" }}>
                       <div style={{ width: "10px", height: "10px", border: "1px solid var(--success)", padding: "1px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: "100%", height: "100%", background: "var(--success)", borderRadius: "50%" }} />
                        </div>
                        {item.popular && <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "var(--accent-primary)", background: "rgba(207, 169, 104, 0.1)", padding: "1px 6px", borderRadius: "4px" }}>POPULAR</span>}
                      </div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff", marginBottom: "4px", lineHeight: 1.2 }}>{item.name}</h3>
                      <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--accent-primary)", marginBottom: "6px" }}>₹{item.price}</div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</p>
                    </div>

                    {/* Image & Add Button */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: "95px", height: "95px", borderRadius: "14px", background: `url(${item.image}) center/cover no-repeat`, backgroundClip: "padding-box", border: "1px solid rgba(255,255,255,0.05)", opacity: item.available ? 1 : 0.4 }} />
                      
                      {item.available ? (
                        <div style={{ position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", width: "75px" }}>
                          {inCart ? (
                            <div style={{ background: "var(--bg-secondary)", border: "1.5px solid var(--accent-primary)", borderRadius: "10px", height: "34px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}>
                              <button onClick={() => removeFromCart(item.id)} style={{ color: "var(--accent-primary)", padding: "4px" }}><Minus size={12} strokeWidth={3} /></button>
                              <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--accent-primary)" }}>{inCart.qty}</span>
                              <button onClick={() => addToCart(item)} style={{ color: "var(--accent-primary)", padding: "4px" }}><Plus size={12} strokeWidth={3} /></button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(item)} style={{ background: "var(--bg-secondary)", border: "1.5px solid rgba(207, 169, 104, 0.4)", borderRadius: "10px", width: "100%", height: "34px", color: "var(--accent-primary)", fontSize: "0.7rem", fontWeight: 900, boxShadow: "0 10px 20px rgba(0,0,0,0.4)", letterSpacing: "0.5px" }}>ADD</button>
                          )}
                        </div>
                      ) : (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "#fff", background: "rgba(0,0,0,0.8)", padding: "4px 8px", borderRadius: "6px" }}>SOLD OUT</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </main>

            {/* Floating Controls */}
            <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 2.5rem)", maxWidth: "450px", zIndex: 50, display: "flex", gap: "12px" }}>
               <button onClick={() => setShowWaiterModal(true)} style={{ width: "58px", height: "58px", borderRadius: "20px", background: "var(--bg-secondary)", border: "1.5px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.4)" }}>
                <Bell size={24} color="var(--accent-primary)" strokeWidth={2.5} />
              </button>
              
              <button onClick={() => setShowCartModal(true)} style={{ flex: 1, height: "58px", borderRadius: "20px", background: cartCount > 0 ? "var(--accent-primary)" : "var(--bg-secondary)", border: cartCount > 0 ? "none" : "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", color: "#fff", boxShadow: "0 15px 35px rgba(0,0,0,0.4)", transition: "all 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <ShoppingBag size={22} color={cartCount > 0 ? "#fff" : "var(--text-secondary)"} strokeWidth={2.5} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 900, lineHeight: 1 }}>{cartCount > 0 ? `${cartCount} ITEMS` : "VIEW CART"}</div>
                    {cartCount > 0 && <div style={{ fontSize: "0.65rem", fontWeight: 700, opacity: 0.8 }}>Ready to checkout</div>}
                  </div>
                </div>
                {cartCount > 0 && <span style={{ fontSize: "1.1rem", fontWeight: 900 }}>₹{cartTotal}</span>}
              </button>
            </div>

            {/* Waiter Sheet */}
            {showWaiterModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setShowWaiterModal(false)}>
                <div style={{ background: "var(--bg-secondary)", width: "100%", borderTopLeftRadius: "35px", borderTopRightRadius: "35px", padding: "1.5rem 1.5rem 3.5rem", animation: "slideUp 0.3s ease-out", borderTop: "1px solid var(--glass-border)" }} onClick={e => e.stopPropagation()}>
                  <div style={{ width: "40px", height: "5px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", margin: "0 auto 2rem" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff" }}>Service Assistant</h2>
                    <button onClick={() => setShowWaiterModal(false)} style={{ color: "var(--text-secondary)", padding: "10px" }}><X size={24} /></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {WAITER_ACTIONS.map(a => (
                      <button key={a.label} onClick={() => handleWaiterCall(a.label)} style={{ background: "var(--bg-tertiary)", padding: "1.5rem 1rem", borderRadius: "24px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                        <span style={{ fontSize: "2rem" }}>{a.emoji}</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff" }}>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cart Sheet */}
            {showCartModal && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setShowCartModal(false)}>
                <div style={{ background: "var(--bg-secondary)", width: "100%", maxHeight: "85vh", borderTopLeftRadius: "35px", borderTopRightRadius: "35px", padding: "1.5rem 1.5rem 3.5rem", display: "flex", flexDirection: "column", animation: "slideUp 0.3s ease-out", borderTop: "1px solid var(--glass-border)" }} onClick={e => e.stopPropagation()}>
                  <div style={{ width: "40px", height: "5px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", margin: "0 auto 1.5rem" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div>
                      <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff" }}>My Basket</h2>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>VERIFY ITEMS BEFORE ORDERING</p>
                    </div>
                    <div style={{ background: "var(--bg-tertiary)", padding: "0.4rem 0.8rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--accent-primary)" }}>TABLE {tableNumber}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", marginBottom: "2rem", padding: "0 5px" }} className="hide-scrollbar">
                    {cart.length === 0 ? (
                      <div style={{ textAlign: "center", marginTop: "3rem" }}>
                        <ShoppingBag size={48} color="var(--text-secondary)" opacity={0.3} style={{ marginBottom: "1rem" }} />
                        <p style={{ color: "var(--text-secondary)", fontWeight: 700 }}>Your basket is empty</p>
                      </div>
                    ) : cart.map(item => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: "1rem" }}>
                          <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>{item.name}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: 900 }}>₹{item.price * item.qty}</div>
                        </div>
                        <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "10px", height: "36px", display: "flex", alignItems: "center", gap: "18px", padding: "0 12px", boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}>
                          <button onClick={() => removeFromCart(item.id)} style={{ color: "#fff", padding: "4px" }}><Minus size={14} strokeWidth={3} /></button>
                          <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#fff", minWidth: "15px", textAlign: "center" }}>{item.qty}</span>
                          <button onClick={() => addToCart(item)} style={{ color: "#fff", padding: "4px" }}><Plus size={14} strokeWidth={3} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {cart.length > 0 && (
                    <button onClick={handleCheckout} disabled={orderState === "sending"} style={{ width: "100%", height: "60px", borderRadius: "20px", background: "var(--accent-primary)", color: "#fff", fontWeight: 900, fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", boxShadow: "0 15px 30px rgba(207, 169, 104, 0.2)" }}>
                      {orderState === "sending" ? "INITIALIZING KITCHEN..." : <><CheckCircle2 size={22} /> CONFIRM ORDER · ₹{cartTotal}</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
