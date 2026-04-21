import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

/**
 * Log a cafe owner into their admin dashboard.
 */
export const loginOwner = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
    // We will later use this user object to figure out which cafe they own
  } catch (error) {
    // Return a clean message for the UI to display without triggering Next.js 'unhandled error' overlay
    let customMessage = "Failed to authenticate.";
    if (error.code === "auth/invalid-credential") customMessage = "Incorrect email or password.";
    if (error.code === "auth/user-not-found") customMessage = "No user found with this email.";
    if (error.code === "auth/too-many-requests") customMessage = "Too many failed attempts. Try again later.";
    
    return { success: false, error: customMessage };
  }
};

/**
 * Log out the owner.
 */
export const logoutOwner = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
