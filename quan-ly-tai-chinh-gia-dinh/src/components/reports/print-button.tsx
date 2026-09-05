"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

export function PrintButton() {
  return (
    <Button size="sm" variant="outline" className="print:hidden" onClick={() => window.print()}>
      <Icon name="Receipt" size={14} /> In báo cáo
    </Button>
  );
}
