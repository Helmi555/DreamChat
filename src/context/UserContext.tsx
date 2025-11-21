// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import app, { auth } from "configs/firebase";
import { User } from "types/User";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.info("Fetching user in provider");
        const authUser = auth.currentUser;
        if (authUser) {
          const snapshot = await get(ref(getDatabase(app), `profiles/${authUser.uid}`));
          if (snapshot.exists()) {
            const userData = snapshot.val() as User;
            setCurrentUser(userData);
            console.info("user fetched in provider", userData); // Log the actual data
          } else {
            console.info("No user data found in database");
          }
        } else {
          console.info("No authenticated user found");
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUser();
      } else {
        setCurrentUser(null);
      }
    });

    return unsubscribe;
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