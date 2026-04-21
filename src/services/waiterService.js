import { collection, addDoc, onSnapshot, updateDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

// Customer action
export const sendWaiterCall = async (tableNumber, actionType) => {
  try {
    await addDoc(collection(db, "waiter_calls"), {
      table: tableNumber,
      type: actionType,
      status: "pending",
      createdAt: new Date().toISOString() // Using string to prevent Firebase serverTimestamp null issues
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send call:", error);
    return { success: false, error: error.message };
  }
};

// Admin action - listens to all calls, sorts by newest, filters pending
export const subscribeToWaiterCalls = (callback) => {
  const q = query(collection(db, "waiter_calls"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const allCalls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filter locally to avoid triggering Firebase "Missing Index" error for composite queries
    const pendingCalls = allCalls.filter(call => call.status === "pending");
    callback(pendingCalls);
  });
};

export const resolveWaiterCall = async (callId) => {
  try {
    await updateDoc(doc(db, "waiter_calls", callId), { status: "resolved" });
    return { success: true };
  } catch (error) {
    console.error("Failed to resolve:", error);
    return { success: false, error: error.message };
  }
};
