import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardCheck, UsersRound, LogOut, Menu, X, ShieldAlert } from "lucide-react";

export function AdminLayout({ children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell admin-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar admin-sidebar">
        <div className="brand">
          <div className="brand-mark admin-mark"><ShieldAlert size={22}/></div>
          {!collapsed && <div><strong>TRUST<span className="brand-green">LENSAI</span></strong><span>ADMIN CONSOLE</span></div>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={19}/> : <X size={19}/>}
        </button>
        <nav>
          <NavLink to="/admin" end className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={19}/>{!collapsed && <span>Admin Dashboard</span>}
          </NavLink>
          <NavLink to="/admin/reviews" className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>
            <ClipboardCheck size={19}/>{!collapsed && <span>Review Management</span>}
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>
            <UsersRound size={19}/>{!collapsed && <span>User Management</span>}
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-user">
            <div className="avatar"><ShieldAlert size={18}/></div>
            {!collapsed && <div><b>System Admin</b><small>Administrator</small></div>}
          </div>
          <button className="logout-btn" onClick={onLogout}><LogOut size={18}/>{!collapsed && "Logout"}</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">SECURITY & MODERATION</span><h2>ADMIN CONTROL CENTER</h2></div>
          <div className="admin-badge">ADMIN ACCESS</div>
        </header>
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}
