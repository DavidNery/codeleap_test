import { createContext, useCallback, useEffect, useState } from "react";

interface ContextProps {
  loggedName: string | null;
  doLogin: (name: string) => void;
  logout: () => void;
}

export const UserContext = createContext<ContextProps | null>(null);

export const UserContextImpl = ({ children }: { children: React.ReactNode }) => {

  const [loggedName, setLoggedName] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('logged_name');
    setLoggedName(null);
  }, [setLoggedName]);

  const doLogin = useCallback((name: string | null) => {
    setLoggedName(name);
    if (name)
      localStorage.setItem('logged_name', name);
    else
      localStorage.removeItem('logged_name');
  }, []);

  useEffect(() => setLoggedName(localStorage.getItem('logged_name')));

  return (
    <UserContext value={{
      loggedName, doLogin, logout
    }}>
      {children}
    </UserContext>
  );
}