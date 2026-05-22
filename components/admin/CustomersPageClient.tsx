"use client";

import { useState } from "react";
import {
  CustomersTable,
  type CustomerRow,
} from "@/components/admin/CustomersTable";
import { CustomerPanel } from "@/components/admin/CustomerPanel";

export default function CustomersPageClient({
  customers,
}: {
  customers: CustomerRow[];
}) {
  const [selected, setSelected] = useState<CustomerRow | null>(null);

  return (
    <>
      <CustomersTable customers={customers} onView={(c) => setSelected(c)} />
      <CustomerPanel
        customer={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
