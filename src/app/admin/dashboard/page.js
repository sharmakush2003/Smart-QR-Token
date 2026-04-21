"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BellRing, TrendingUp, LogOut, CheckCircle2, UtensilsCrossed, 
  Clock, Activity, ChefHat, Search, History, 
  LayoutDashboard, Package, ArrowUpRight, User, MoreHorizontal,
  Trash2, Edit2, Plus, List
} from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { CAFE_DOCUMENT_ID, updateItemAvailability, addCategory, renameCategory, deleteCategory, deleteMenuItem } from "../../../services/menuService";
import { subscribeToWaiterCalls, resolveWaiterCall } from "../../../services/waiterService";
import { subscribeToOrders, updateOrderStatus, subscribeToOrderHistory } from "../../../services/orderService";

export default function AdminDashboard() {
  const router = useRouter();
  
  // Real-time Streams
  const [items, setItems] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);

  // Local UI State
  const [activeTab, setActiveTab] = useState("live"); // live, stock, history
  const [searchQuery, setSearchQuery] = useState("");
  // Streams
  useEffect(() => {
    const unsubMenu = onSnapshot(doc(db, "menus", CAFE_DOCUMENT_ID), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setItems(data.items || []);
        setCategories(data.categories || []);
      }
    });
    const unsubCalls = subscribeToWaiterCalls((liveCalls) => {
      setRequests(liveCalls);
    });
    const unsubOrders = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
    });
    const unsubHistory = subscribeToOrderHistory((data) => setHistory(data));

    return () => { unsubMenu(); unsubCalls(); unsubOrders(); unsubHistory(); };
  }, []);

  // Actions
  const toggleItem = async (id, currentStatus) => {
    setItems(prev => prev.map(item => String(item.id) === String(id) ? { ...item, available: !currentStatus } : item));
    await updateItemAvailability(id, !currentStatus);
  };
  const deleteItem = async (id) => {
    if(window.confirm("Are you sure you want to completely delete this item?")) {
      await deleteMenuItem(id);
    }
  };
  const markOrderReady = async (id) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    await updateOrderStatus(id, "served");
  };

  const statsRevenue = [...orders, ...history].reduce((sum, o) => sum + o.totalAmount, 0);
  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ height: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", display: "grid", gridTemplateColumns: "220px 1fr", overflow: "hidden", fontFamily: "Geist, Inter, sans-serif" }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ borderRight: "1px solid var(--border-color)", background: "var(--bg-secondary)", display: "flex", flexDirection: "column", padding: "1.5rem 1rem", gap: "2rem", boxShadow: "4px 0 20px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem" }}>
          <div style={{ background: "var(--accent-primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-glow)" }}>
            <Activity size={18} color="#FFF" strokeWidth={3} />
          </div>
          <span style={{ fontWeight: 900, fontSize: "0.95rem", letterSpacing: "-0.5px", color: "var(--text-primary)" }}>SMART ENGINE</span>
        </div>
        
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <SidebarIcon icon={<LayoutDashboard size={18} />} label="Live Monitor" active={activeTab === "live"} onClick={() => setActiveTab("live")} />
          <SidebarIcon icon={<List size={18} />} label="Menu Categories" active={activeTab === "categories"} onClick={() => setActiveTab("categories")} />
          <SidebarIcon icon={<Package size={18} />} label="Stock Manager" active={activeTab === "stock"} onClick={() => setActiveTab("stock")} />
          <SidebarIcon icon={<History size={18} />} label="Order History" active={activeTab === "history"} onClick={() => setActiveTab("history")} />
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
          <SidebarIcon icon={<LogOut size={18} />} label="Logout Admin" onClick={() => router.push("/login")} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ display: "flex", flexDirection: "column", height: "100vh", position: "relative" }}>
        
        {/* Top bar */}
        <header style={{ padding: "1.25rem 2.5rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-secondary)", letterSpacing: "1.5px" }}>COMMAND CENTER</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>{activeTab.toUpperCase()} STATUS</h2>
          </div>

          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
             <div className="glass-stat">
              <span className="stat-label">DAILY SALES</span>
              <span className="stat-value">₹{statsRevenue}</span>
            </div>
            <div className="glass-stat">
              <span className="stat-label">ACTIVE TABLES</span>
              <span className="stat-value">{[...new Set([...orders, ...requests].map(x => x.table))].length}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 1.25rem", background: "var(--bg-primary)", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
              <div style={{ width: "8px", height: "8px", background: "var(--success)", borderRadius: "50%", boxShadow: "0 0 12px var(--success)" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-primary)" }}>SERVER LIVE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Section Rendering */}
        <section style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto", background: "var(--bg-primary)" }} className="hide-scrollbar">
          {activeTab === "live" && <LiveDashboard orders={orders} requests={requests} onResolveCall={resolveWaiterCall} onServeOrder={markOrderReady} />}
          {activeTab === "categories" && <CategoryManager categories={categories} />}
          {activeTab === "stock" && <StockManager items={items} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onToggle={toggleItem} onDelete={deleteItem} />}
          {activeTab === "history" && <OrderHistory history={history} />}
        </section>

      </main>

      <style jsx global>{`
        .glass-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-panel:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 45px rgba(0,0,0,0.08);
          border-color: var(--accent-primary);
        }
        .glass-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .stat-label {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--text-secondary);
          letter-spacing: 1px;
        }
        .stat-value {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--text-primary);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); }
          70% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); background: rgba(239, 68, 68, 0.02); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); background: rgba(239, 68, 68, 0.05); }
        }
        .alert-pulse {
          animation: pulse-red 2.5s infinite;
        }
      `}</style>
    </div>
  );
}

function SidebarIcon({ icon, active, onClick, danger, label }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        width: "100%", height: "44px", borderRadius: "10px", 
        display: "flex", alignItems: "center", gap: "10px", padding: "0 12px",
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
        color: active ? "var(--accent-primary)" : (danger ? "var(--danger)" : "var(--text-secondary)"),
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        border: active ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        cursor: "pointer"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px" }}>
        {icon}
      </div>
      <span style={{ fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

function LiveDashboard({ orders, requests, onResolveCall, onServeOrder }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.1fr", gap: "2.5rem", height: "100%" }}>
      {/* Active Orders List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.75rem", letterSpacing: "1px" }}>
          <ChefHat size={18} color="var(--accent-primary)" /> LIVE KITCHEN TICKETS ({orders.length})
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {orders.map(order => (
            <div key={order.id} className="glass-panel" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--border-color)", borderTop: "6px solid var(--accent-primary)", background: "var(--bg-secondary)" }}>
              <div style={{ padding: "1.5rem", background: "rgba(207, 169, 104, 0.02)", borderBottom: "1px dashed var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-primary)" }}>T-{order.table}</div>
                  <div style={{ textAlign: "right", fontSize: "1.1rem", fontWeight: 900, color: "var(--text-primary)" }}>₹{order.totalAmount}</div>
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 800 }}>RECEIVED AT {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              
              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {order.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", color: "var(--text-primary)" }}>
                    <span style={{ fontWeight: 700 }}><span style={{ color: "var(--accent-primary)", marginRight: "8px" }}>{it.qty}x</span> {it.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: "1.5rem", paddingTop: 0 }}>
                <button onClick={() => onServeOrder(order.id)} style={{ width: "100%", background: "var(--text-primary)", color: "var(--bg-secondary)", padding: "1rem", borderRadius: "12px", fontWeight: 900, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                  <CheckCircle2 size={18} strokeWidth={3} /> MARK AS SERVED
                </button>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="glass-panel" style={{ padding: "5rem 2rem", textAlign: "center", background: "var(--bg-secondary)", borderStyle: "dashed", opacity: 0.6 }}>
              <UtensilsCrossed size={40} color="var(--accent-primary)" style={{ margin: "0 auto 1.5rem", opacity: 0.3 }} />
              <p style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-secondary)" }}>Kitchen Queue is Empty</p>
            </div>
          )}
        </div>
      </div>

      {/* Service Calls List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.75rem", letterSpacing: "1px" }}>
          <BellRing size={18} color="var(--danger)" /> TABLE ASSISTANCE ({requests.length})
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map(req => (
            <div key={req.id} className="glass-panel alert-pulse" style={{ padding: "1.25rem 1.75rem", border: "1px solid rgba(239, 68, 68, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "var(--danger)", letterSpacing: "1px", marginBottom: "0.2rem" }}>URGENT ALERT</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>T-{req.table} • {req.type.toUpperCase()}</div>
              </div>
              <button 
                onClick={() => onResolveCall(req.id)}
                style={{ background: "var(--danger)", color: "#FFF", width: "48px", height: "48px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)" }}
              >
                <CheckCircle2 size={24} strokeWidth={3} />
              </button>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="glass-panel" style={{ padding: "3rem 2rem", textAlign: "center", background: "var(--bg-secondary)", opacity: 0.5 }}>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-secondary)" }}>No active service calls</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StockManager({ items, searchQuery, setSearchQuery, onToggle, onDelete }) {
  return (
    <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-secondary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>STOCK CONTROL</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>INSTANT AVAILABILITY TOGGLE</p>
        </div>
        <div style={{ position: "relative", width: "350px" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input 
            placeholder="Search items or categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", background: "var(--bg-primary)", border: "1px solid var(--border-color)", padding: "0.8rem 1rem 0.8rem 3rem", borderRadius: "100px", color: "var(--text-primary)", outline: "none", fontSize: "0.9rem", fontWeight: 600 }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", overflowY: "auto", padding: "0.5rem" }} className="hide-scrollbar">
        {items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ borderLeft: `3px solid ${item.available ? "var(--success)" : "var(--danger)"}`, paddingLeft: "12px" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>{item.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 800, letterSpacing: "0.5px" }}>{item.category.toUpperCase()}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button 
                onClick={() => onToggle(item.id, item.available)} 
                style={{ 
                  width: "52px", height: "26px", borderRadius: "100px", 
                  background: item.available ? "var(--success)" : "#E4E4E7", 
                  position: "relative", transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", border: "none", cursor: "pointer"
                }}
              >
                <div style={{ width: "20px", height: "20px", background: "#fff", borderRadius: "50%", position: "absolute", top: "3px", left: item.available ? "29px" : "3px", transition: "all 0.3s ease", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }} />
              </button>
              <button onClick={() => onDelete(item.id)} style={{ color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "6px", borderRadius: "8px" }}>
                 <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderHistory({ history }) {
  return (
    <div className="glass-panel" style={{ padding: "2rem", height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-secondary)" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>ORDER PERFORMANCE LOG</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>PAST 24 HOURS ACTIVITY</p>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }} className="hide-scrollbar">
        {history.map(order => (
          <div key={order.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 180px 120px", alignItems: "center", padding: "1.25rem 2rem", background: "var(--bg-primary)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--text-primary)" }}>T-{order.table}</div>
            <div style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>
              {order.items.map(it => `${it.qty}x ${it.name}`).join(", ")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700 }}>{new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
            <div style={{ fontWeight: 900, color: "var(--accent-primary)", textAlign: "right", fontSize: "1rem" }}>₹{order.totalAmount}</div>
          </div>
        ))}
        {history.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem", opacity: 0.5 }}>
            <p style={{ fontWeight: 800, color: "var(--text-secondary)" }}>No order history found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryManager({ categories }) {
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [editedName, setEditedName] = useState("");

  const handleAdd = async () => {
    if(!newCat.trim()) return;
    await addCategory(newCat.trim());
    setNewCat("");
  };

  const handleSaveEdit = async (oldName) => {
    if(!editedName.trim() || editedName === oldName) {
      setEditingCat(null);
      return;
    }
    await renameCategory(oldName, editedName.trim());
    setEditingCat(null);
  };

  const handleDelete = async (cat) => {
    if(window.confirm(`WARNING: Deleting '${cat}' will also PERMANENTLY DELETE all items in this category. Are you sure you want to proceed?`)) {
      await deleteCategory(cat);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "2rem", display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-secondary)" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>CATEGORY MANAGER</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700 }}>ADD, EDIT, OR REMOVE MENU CATEGORIES</p>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <input 
          placeholder="New Category Name..."
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          style={{ flex: 1, background: "var(--bg-primary)", border: "1px solid var(--border-color)", padding: "0.8rem 1.25rem", borderRadius: "100px", color: "var(--text-primary)", outline: "none", fontSize: "0.95rem", fontWeight: 600 }}
        />
        <button 
          onClick={handleAdd}
          style={{ background: "var(--accent-primary)", color: "#fff", padding: "0 1.5rem", borderRadius: "100px", fontWeight: 800, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(207, 169, 104, 0.2)" }}
        >
          <Plus size={18} /> ADD CATEGORY
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", padding: "0.5rem" }} className="hide-scrollbar">
        {categories.map(cat => (
          <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
            {editingCat === cat ? (
              <input 
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                autoFocus
                style={{ flex: 1, background: "var(--bg-primary)", border: "1px solid var(--accent-primary)", padding: "0.5rem 1rem", borderRadius: "8px", color: "var(--text-primary)", outline: "none", fontSize: "0.95rem", fontWeight: 600, marginRight: "1rem" }}
              />
            ) : (
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>{cat}</div>
            )}
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {editingCat === cat ? (
                <>
                  <button onClick={() => handleSaveEdit(cat)} style={{ color: "var(--success)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 800 }}>SAVE</button>
                  <button onClick={() => setEditingCat(null)} style={{ color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 800 }}>CANCEL</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingCat(cat); setEditedName(cat); }} style={{ color: "var(--text-primary)", background: "var(--bg-primary)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
                     <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(cat)} style={{ color: "var(--danger)", background: "var(--bg-primary)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
                     <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
            <p style={{ fontWeight: 800, color: "var(--text-secondary)" }}>No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
