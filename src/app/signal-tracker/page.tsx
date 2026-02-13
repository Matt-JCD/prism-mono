"use client";

import { useData } from "@/lib/DataContext";
import SignalTracker from "@/components/SignalTracker";

export default function SignalTrackerPage() {
  const { accounts, signals, toggleSignalRead } = useData();
  return <SignalTracker accounts={accounts} signals={signals} onToggleRead={toggleSignalRead} />;
}
