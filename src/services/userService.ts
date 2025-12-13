import { getDatabase, ref, set, get, update, child } from "firebase/database";
import { User } from "types/User";
import firebase from "configs/firebase"; // for compat mode

const db = firebase.database();
const PROFILES = "profiles/";

export const saveUserProfile = async (user: User): Promise<void> => {
  await set(ref(db, PROFILES + `${user.id}`), user);
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const snapshot = await get(child(ref(db), PROFILES + `${userId}`));
  if (snapshot.exists()) {
    return snapshot.val() as User;
  }
  return null;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  await update(ref(db, PROFILES + `${userId}`), updates);
};

export const isPseudoAvailable = async (
  pseudo: string,
  currentUserId: string
): Promise<boolean> => {
  const snapshot = await get(ref(db, PROFILES));
  if (snapshot.exists()) {
    const profiles = snapshot.val();
    for (const id in profiles) {
      if (profiles[id].pseudo === pseudo && id !== currentUserId) {
        return false; 
      }
    }
  }
  return true; 
};

const userService = {
  saveUserProfile,
  getUserProfile,
  updateUserProfile,
  isPseudoAvailable,
};

export default userService;
