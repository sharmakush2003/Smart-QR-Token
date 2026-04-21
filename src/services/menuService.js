import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export const CAFE_DOCUMENT_ID = "main-cafe";

// Single Cafe Mock Data (used for initial seeding)
const MOCK_MENU = {
  name: "Cafe Coffee House",
  categories: ["Beverages", "Snacks", "Desserts"],
  items: [
    { id: "1", name: "Iced Caramel Macchiato", price: 240, category: "Beverages", description: "Espresso combined with vanilla-flavoured syrup, milk and caramel drizzle.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735", available: true },
    { id: "2", name: "Hot Chocolate", price: 180, category: "Beverages", description: "Rich, creamy hot chocolate right off the stove.", image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed", available: false },
    { id: "3", name: "Grilled Cheese Toastie", price: 150, category: "Snacks", description: "Melted cheddar and mozzarella on thick sourdough.", image: "https://images.unsplash.com/photo-1528735602780-2ea56281df69", available: true },
    { id: "4", name: "Blueberry Muffin", price: 220, category: "Desserts", description: "Freshly baked muffin bursting with blueberries.", image: "https://images.unsplash.com/photo-1607958996333-41aef7bc0aa2", available: true }
  ]
};

// Initial fetch for Server Components
export const fetchRestaurantMenu = async () => {
  try {
    const docRef = doc(db, "menus", CAFE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      await setDoc(docRef, MOCK_MENU);
      return { success: true, data: MOCK_MENU };
    }
  } catch (error) {
    console.error("Error fetching live menu:", error);
    return { success: false, error: error.message };
  }
};

// Update an item's availability in live database
export const updateItemAvailability = async (itemId, newStatus) => {
  try {
    const docRef = doc(db, "menus", CAFE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedItems = data.items.map(item => 
        String(item.id) === String(itemId) ? { ...item, available: newStatus } : item
      );
      await setDoc(docRef, { items: updatedItems }, { merge: true });
      return { success: true };
    }
  } catch (error) {
    console.error("Error updating item inside menu:", error);
    return { success: false, error: error.message };
  }
};

export const fetchRestaurantDetails = async () => {
  try {
    const docRef = doc(db, "menus", CAFE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { name: docSnap.data().name } };
    } else {
      return { success: true, data: { name: MOCK_MENU.name } };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add a new Category
export const addCategory = async (newCategory) => {
  try {
    const docRef = doc(db, "menus", CAFE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const currentCategories = data.categories || [];
      if (currentCategories.includes(newCategory)) {
        return { success: false, error: "Category already exists" };
      }
      await setDoc(docRef, { categories: [...currentCategories, newCategory] }, { merge: true });
      return { success: true };
    }
  } catch (error) {
    console.error("Error adding category:", error);
    return { success: false, error: error.message };
  }
};

// Rename a Category and update associated items
export const renameCategory = async (oldName, newName) => {
  try {
    const docRef = doc(db, "menus", CAFE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Update categories array
      let categories = data.categories || [];
      if (categories.includes(newName)) {
         return { success: false, error: "A category with the new name already exists" };
      }
      categories = categories.map(cat => cat === oldName ? newName : cat);
      
      // Update items that belonged to the old category
      const items = data.items || [];
      const updatedItems = items.map(item => 
        item.category === oldName ? { ...item, category: newName } : item
      );

      await setDoc(docRef, { categories, items: updatedItems }, { merge: true });
      return { success: true };
    }
  } catch (error) {
    console.error("Error renaming category:", error);
    return { success: false, error: error.message };
  }
};

// Delete a category and all its items
export const deleteCategory = async (categoryName) => {
  try {
    const docRef = doc(db, "menus", CAFE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Remove from categories array
      const categories = (data.categories || []).filter(cat => cat !== categoryName);
      
      // Remove all items belonging to this category
      const items = (data.items || []).filter(item => item.category !== categoryName);

      await setDoc(docRef, { categories, items }, { merge: true });
      return { success: true };
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
};

// Delete a single item
export const deleteMenuItem = async (itemId) => {
  try {
    const docRef = doc(db, "menus", CAFE_DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const items = (data.items || []).filter(item => String(item.id) !== String(itemId));
      
      await setDoc(docRef, { items }, { merge: true });
      return { success: true };
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return { success: false, error: error.message };
  }
};
