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
    const bootstrap = async () => {
      try {
        const stored = await AsyncStorage.getItem(rememberedUserKey);
        console.log("📱 Stored user found:", !!stored);

        if (stored) {
          const parsedUser = JSON.parse(stored);
          setCurrentUser(parsedUser);
        }

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          console.log("🔥 Auth state changed, user:", firebaseUser?.email);

          if (!firebaseUser) {
            setCurrentUser(stored ? JSON.parse(stored) : null);
            return;
          }

          const profileRef = db.ref(`profiles/${firebaseUser.uid}`);
          try {
            await profileRef.update({
              isActive: true,
              lastActiveAt: Date.now(),
            });
            profileRef.onDisconnect().update({
              isActive: false,
              lastActiveAt: Date.now(),
            });
          } catch (dbError) {
          }

          profileRef.on("value", async (snapshot) => {
            const profileData = snapshot.val() as User;
            
            if (profileData) {
              setCurrentUser(profileData);
              await AsyncStorage.setItem(
                rememberedUserKey,
                JSON.stringify(profileData)
              );
            }
          });
        });

        return () => {
          unsubscribe();
        };
      } catch (err) {
      }
    };

    bootstrap();
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
