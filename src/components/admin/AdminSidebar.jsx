import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, Image, Star,
  HelpCircle, Settings, Zap, BarChart3, ChevronLeft, ChevronRight,
  ClipboardList, Plug, Mail
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Leads", icon: Users, path: "/admin/leads" },
  { label: "Surveys", icon: ClipboardList, path: "/admin/surveys" },
  { label: "Contact Forms", icon: Mail, path: "/admin/contact-forms" },
  { label: "Landing Pages", icon: FileText, path: "/admin/pages" },
  { label: "Media Library", icon: Image, path: "/admin/media" },
  { label: "Testimonials", icon: Star, path: "/admin/testimonials" },
  { label: "FAQs", icon: HelpCircle, path: "/admin/faqs" },
  { label: "Automations", icon: Zap, path: "/admin/automations" },
  { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  { label: "Integrations", icon: Plug, path: "/admin/integrations" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const { pathname } = useLocation();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-stone-900 border-r border-white/5 z-40 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        {!collapsed && <span className="text-white font-medium text-sm">Admin Panel</span>}
        <button onClick={onToggle} className="text-white/40 hover:text-white transition-colors p-1 ml-auto">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="mt-4 space-y-1 px-2">
        {navItems.map((item) => {
          const active = item.path === "/admin"
            ? pathname === "/admin"
            : pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}