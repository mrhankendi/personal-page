"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className={isHome ? undefined : "hidden lg:block"}>
      <Sidebar />
    </div>
  );
}
