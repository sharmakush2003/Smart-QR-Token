import { collection, addDoc, onSnapshot, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export const placeOrder = async (tableNumber, items, totalAmount) => {
  try {
    await addDoc(collection(db, "orders"), {
      table: tableNumber,
      items: items, // Array of cart items (name, price, etc.)
      totalAmount: totalAmount,
      status: "new",
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Order error:", error);
    return { success: false, error: error.message };
  }
};

export const subscribeToOrders = (callback) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Local filter to avoid Indexing errors for the prototype
    const activeOrders = allOrders.filter(o => o.status === "new" || o.status === "preparing");
    callback(activeOrders);
  });
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const subscribeToOrderHistory = (callback) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Fetch last 50 completed/served orders
    const history = allOrders.filter(o => o.status === "served" || o.status === "completed").slice(0, 50);
    callback(history);
  });
};
