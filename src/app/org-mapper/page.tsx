"use client";

import { useData } from "@/lib/DataContext";
import OrgMapper from "@/components/OrgMapper";

export default function OrgMapperPage() {
  const { accounts, updateAccount } = useData();
  return <OrgMapper accounts={accounts} onUpdateAccount={updateAccount} />;
}
