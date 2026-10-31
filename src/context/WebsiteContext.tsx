import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, WebsiteSettings, SERVER_URL } from '../services/api';

interface WebsiteContextType {
  settings: WebsiteSettings | null;
  loading: boolean;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      // try {
        const data = await api.getWebsiteSettings();
        setSettings(data);
        
        // Update document title if company name exists
        if (data.company_name) {
          document.title = data.company_name;
        }

        // Update favicon if exists
        if (data.favicon) {
          const faviconPath = data.favicon.startsWith('http') ? data.favicon : `${SERVER_URL}${data.favicon}`;
          let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = faviconPath;
        }
      // } catch (error) {
        // console.error('Failed to fetch website settings:', error);
      // } finally {
      //   setLoading(false);
      // }
    };

    fetchSettings();
  }, []);

  return (
    <WebsiteContext.Provider value={{ settings, loading }}>
      {children}
    </WebsiteContext.Provider>
  );
}

export function useWebsite() {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
}
