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
        console.log("🔄 UserContext bootstrap started");

        // 1️⃣ Load from AsyncStorage
        const stored = await AsyncStorage.getItem(rememberedUserKey);
        console.log("📱 Stored user found:", !!stored);

        if (stored) {
          const parsedUser = JSON.parse(stored);
          setCurrentUser(parsedUser);
          console.log("👤 Stored user loaded:", parsedUser.email);
        }

        // 2️⃣ Listen to auth
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          console.log("🔥 Auth state changed, user:", firebaseUser?.email);

          if (!firebaseUser) {
            console.log("🚫 No Firebase user, using stored data if available");
            setCurrentUser(stored ? JSON.parse(stored) : null);
            return;
          }

          const profileRef = db.ref(`profiles/${firebaseUser.uid}`);
          console.log("📊 Setting up profile reference for:", firebaseUser.uid);

          try {
            console.log("🟢 Marking user as active in database");
            // ✅ mark active on login/app start
            await profileRef.update({
              isActive: true,
              lastActiveAt: Date.now(),
            });
            console.log("✅ User marked as active");

            console.log("🔧 Setting up onDisconnect for user");
            // ✅ mark inactive on disconnect (app close, network loss)
            profileRef.onDisconnect().update({
              isActive: false,
              lastActiveAt: Date.now(),
            });
            console.log("✅ onDisconnect handler set up");
          } catch (dbError) {
            console.error("❌ Database update failed:", dbError);
          }

          console.log("👂 Setting up real-time profile listener");
          // ✅ realtime profile listener
          profileRef.on("value", async (snapshot) => {
            const profileData = snapshot.val() as User;
            console.log(
              "📨 Profile data received:",
              profileData ? "valid" : "null"
            );

            if (profileData) {
              setCurrentUser(profileData);
              await AsyncStorage.setItem(
                rememberedUserKey,
                JSON.stringify(profileData)
              );
              console.log("💾 Profile saved to local storage");
            }
          });
        });

        return () => {
          console.log("🧹 Cleaning up auth listener");
          unsubscribe();
        };
      } catch (err) {
        console.error("❌ UserContext bootstrap failed:", err);
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
