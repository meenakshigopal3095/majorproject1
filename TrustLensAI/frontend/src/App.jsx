import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from "./api";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import Analyze from "./pages/Analyze";
import History from "./pages/History";
import Products from "./pages/Products";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReviews from "./pages/AdminReviews";
import AdminUsers from "./pages/AdminUsers";

function Guard({ children, role }) {
  const token = localStorage.getItem("frs_token");
  const savedRole = localStorage.getItem("frs_role");
  if (!token) return <Navigate to="/login" replace />;
  if (role && savedRole !== role) return <Navigate to={savedRole === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

export default function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("frs_token"),
    role: localStorage.getItem("frs_role"),
    name: localStorage.getItem("frs_name")
  });

  const login = (data) => {
    localStorage.setItem("frs_token", data.token);
    localStorage.setItem("frs_role", data.role);
    localStorage.setItem("frs_name", data.name);
    setAuth({ token: data.token, role: data.role, name: data.name });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null, name: null });
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={login} />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={
        <Guard role="user"><Layout onLogout={logout}><UserDashboard /></Layout></Guard>
      } />
      <Route path="/analyze" element={
        <Guard role="user"><Layout onLogout={logout}><Analyze /></Layout></Guard>
      } />
      <Route path="/history" element={
        <Guard role="user"><Layout onLogout={logout}><History /></Layout></Guard>
      } />
      <Route path="/products" element={
        <Guard role="user"><Layout onLogout={logout}><Products /></Layout></Guard>
      } />

      <Route path="/admin" element={
        <Guard role="admin"><AdminLayout onLogout={logout}><AdminDashboard /></AdminLayout></Guard>
      } />
      <Route path="/admin/reviews" element={
        <Guard role="admin"><AdminLayout onLogout={logout}><AdminReviews /></AdminLayout></Guard>
      } />
      <Route path="/admin/users" element={
        <Guard role="admin"><AdminLayout onLogout={logout}><AdminUsers /></AdminLayout></Guard>
      } />

      <Route path="*" element={<Navigate to={
        auth.role === "admin" ? "/admin" : auth.token ? "/dashboard" : "/login"
      } replace />} />
    </Routes>
  );
}
