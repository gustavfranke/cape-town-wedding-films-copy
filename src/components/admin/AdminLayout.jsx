import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ currentPage, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [authState, setAuthState] = useState("loading"); // loading | admin | denied

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) {
        base44.auth.redirectToLogin();
        return;
      }
      const user = await base44.auth.me().catch(() => null);
      if (user?.role === "admin") {
        setAuthState("admin");
      } else {
        setAuthState("denied");
      }
    });
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-white text-xl font-light mb-2">Admin Access Required</h2>
          <p className="text-white/40 text-sm">You need admin permissions to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <AdminSidebar currentPage={currentPage} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"} p-6 md:p-8`}>
        {children}
      </main>
    </div>
  );
}