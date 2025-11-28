import { getDatabase, ref, set, get, update, child } from "firebase/database";
import { User } from "types/User";
import firebase from "configs/firebase"; // for compat mode

const db = firebase.database();
const PROFILES = "profiles/";

// ✅ Create or overwrite user profile
export const saveUserProfile = async (user: User): Promise<void> => {
  await set(ref(db, PROFILES+`${user.id}`), user);
};

// ✅ Get user profile by ID
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const snapshot = await get(child(ref(db), PROFILES+`${userId}`));
  if (snapshot.exists()) {
    return snapshot.val() as User;
  }
  return null;
};

// ✅ Update specific fields of user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  await update(ref(db, PROFILES+`${userId}`), updates);
};

// ✅ Check if pseudo is unique (not used by another user)
export const isPseudoAvailable = async (
  pseudo: string,
  currentUserId: string
): Promise<boolean> => {
  const snapshot = await get(ref(db, PROFILES));
  if (snapshot.exists()) {
    const profiles = snapshot.val();
    // loop through all profiles
    for (const id in profiles) {
      if (profiles[id].pseudo === pseudo && id !== currentUserId) {
        return false; // already taken by someone else
      }
    }
  }
  return true; // available
};
