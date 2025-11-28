import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "configs/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "types/User";

const rememberedUserKey = "rememberedUser";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // 1️⃣ Load from local storage first (offline)
        const storedUser = await AsyncStorage.getItem(rememberedUserKey);
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }

        // 2️⃣ Listen to Firebase Auth state
        const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
          if (!firebaseUser) {
            setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
            return;
          }

          // 3️⃣ Realtime DB subscription
          const profileRef = db.ref(`profiles/${firebaseUser.uid}`);
          profileRef.on("value", async (snapshot) => {
            const profileData = snapshot.val() as User;
            if (profileData) {
              setCurrentUser(profileData);
              await AsyncStorage.setItem(rememberedUserKey, JSON.stringify(profileData));
            }
          });
        });

      } catch (err) {
        console.error("User context load failed:", err);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
