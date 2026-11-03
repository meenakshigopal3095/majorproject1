import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ScanSearch, History as HistoryIcon, PackageSearch, LogOut, Menu, X, ShieldCheck, UserRound } from "lucide-react";

const items = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/analyze", "Analyze Review", ScanSearch],
  ["/history", "Review History", HistoryIcon],
  ["/products", "Product Insights", PackageSearch]
];

export function Layout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const name = localStorage.getItem("frs_name") || "User";

  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><ShieldCheck size={22} /></div>
          {!collapsed && <div><strong>TRUST<span className="brand-green">LENSAI</span></strong><span>REVIEW INTELLIGENCE</span></div>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title="Collapse Sidebar">
          {collapsed ? <Menu size={19} /> : <X size={19} />}
        </button>
        <nav>
          {items.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>
              <Icon size={19} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-user">
            <div className="avatar"><UserRound size={18}/></div>
            {!collapsed && <div><b>{name}</b><small>Verified User</small></div>}
          </div>
          <button className="logout-btn" onClick={onLogout}><LogOut size={18}/>{!collapsed && "Logout"}</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">REVIEW INTELLIGENCE</span>
            <h2>{location.pathname === "/dashboard" ? "Your Trust Dashboard" : location.pathname === "/analyze" ? "Analyze A Review" : location.pathname === "/history" ? "Review History" : "Product Insights"}</h2>
          </div>
          <div className="top-profile"><div className="avatar"><UserRound size={18}/></div><span>{name}</span></div>
        </header>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
