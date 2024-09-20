"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  dateOfBirth?: string;  // New field for date of birth
  phoneNumber?: string;  // New field for phone number
  roles?: string[];      // New field for roles
}

interface UserContextType {
  user: User | null;
  updateUser: (newInfo: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);

  // Function to fetch full user data
  const fetchUserData = async (userId: string) => {
    const res = await fetch(`/api/user/${userId}`); // Fetch from your API
    if (res.ok) {
      const fullUserData: User = await res.json();
      setUser(fullUserData);
    } else {
      console.error("Failed to fetch user data");
    }
  };

  useEffect(() => {
    if (session && session.user) {
      // Fetch the full user object using the session's user ID
      fetchUserData(session.user.id);
    }
  }, [session]);

  const updateUser = (newInfo: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...newInfo } : null));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Helper hook to access the context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
