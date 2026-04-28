import React, { createContext, useContext, useState, useEffect } from 'react';
import liff from '@line/liff';

interface Driver {
  id: string;
  name: string;
  phone?: string;
  line_user_id?: string;
  line_display_name?: string;
  line_picture_url?: string;
}

interface LineAuthContextType {
  liffProfile: any | null;
  currentDriver: Driver | null;
  isLoading: boolean;
  isLiffError: boolean;
  bindDriver: (driverId: string) => Promise<boolean>;
}

const LineAuthContext = createContext<LineAuthContextType | undefined>(undefined);

export const LineAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liffProfile, setLiffProfile] = useState<any | null>(null);
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiffError, setIsLiffError] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = import.meta.env.VITE_LIFF_ID || '2009853780-z8zTuIji'; 
        
        await liff.init({ liffId });
        
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const profile = await liff.getProfile();
        setLiffProfile(profile);

        // Check if this line_user_id is already bound
        const response = await fetch('/api/drivers/auth-line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line_user_id: profile.userId })
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          setCurrentDriver(data.driver);
        }
      } catch (err) {
        console.error('LIFF Init Error:', err);
        setIsLiffError(true);
        // Fallback for development if not in LIFF
        if (process.env.NODE_ENV === 'development') {
           setLiffProfile({ userId: 'dev_user', displayName: 'Dev User' });
           setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, []);

  const bindDriver = async (driverId: string) => {
    if (!liffProfile) return false;

    try {
      const response = await fetch('/api/drivers/bind-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id: driverId,
          line_user_id: liffProfile.userId,
          line_display_name: liffProfile.displayName,
          line_picture_url: liffProfile.pictureUrl
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setCurrentDriver(data.driver);
        return true;
      }
    } catch (err) {
      console.error('Binding Error:', err);
    }
    return false;
  };

  return (
    <LineAuthContext.Provider value={{ liffProfile, currentDriver, isLoading, isLiffError, bindDriver }}>
      {children}
    </LineAuthContext.Provider>
  );
};

export const useLineAuth = () => {
  const context = useContext(LineAuthContext);
  if (context === undefined) {
    throw new Error('useLineAuth must be used within a LineAuthProvider');
  }
  return context;
};
