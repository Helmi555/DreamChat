import { getDatabase, ref, set, get, update, child } from "firebase/database";
import { User } from "types/User";
import  app  from "configs/firebase"; // make sure firebase.ts exports your initialized app

const db = getDatabase(app);
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
