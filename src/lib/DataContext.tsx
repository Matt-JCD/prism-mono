"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { INITIAL_ACCOUNTS, INITIAL_SIGNALS, type Account, type Signal } from "./data";

interface DataContextValue {
  accounts: Account[];
  signals: Signal[];
  updateAccount: (updated: Account) => void;
  toggleSignalRead: (id: string) => void;
  unreadSignalCount: number;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);

  const updateAccount = (updated: Account) => {
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const toggleSignalRead = (id: string) => {
    setSignals(prev => prev.map(s => s.id === id ? { ...s, read: !s.read } : s));
  };

  const unreadSignalCount = useMemo(() => signals.filter(s => !s.read).length, [signals]);

  return (
    <DataContext.Provider value={{ accounts, signals, updateAccount, toggleSignalRead, unreadSignalCount }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
