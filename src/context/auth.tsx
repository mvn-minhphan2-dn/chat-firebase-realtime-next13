"use client";

import { app } from "@/utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import * as React from "react";

export const AuthContext = React.createContext({});
export const useAuthContext = (): any => React.useContext(AuthContext);

export const AuthContextProvider = ({ children }: any) => {
  const auth = getAuth(app);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {loading ? <div className="flex items-center justify-center h-screen">Loading...</div> : children}
    </AuthContext.Provider>
  )
};
