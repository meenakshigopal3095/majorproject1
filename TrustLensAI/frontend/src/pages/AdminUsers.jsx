import React, { useEffect, useState } from "react";
import api from "../api";
import { Edit3, Trash2, Save, X, UsersRound } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  const load = () => api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`).then(r=>setUsers(r.data));
  useEffect(load, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this user and all of their stored reviews permanently?")) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  const save = async () => {
    await api.patch(`/admin/users/${editing.id}`, editing);
    setEditing(null);
    load();
  };

  return <div>
    <div className="section-head">
      <div><span className="eyebrow">ACCOUNT MANAGEMENT</span><h3>User Management</h3></div>
      <div className="admin-count"><UsersRound size={15}/> {users.length} USERS</div>
    </div>

    <div className="toolbar">
      <input className="plain-input" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search by name or email..." />
      <button className="primary-btn compact" onClick={load}>SEARCH USERS</button>
    </div>

    <div className="table-card">
      <table>
        <thead><tr><th>ID</th><th>USER</th><th>EMAIL</th><th>REVIEWS</th><th>JOINED</th><th>ACTIONS</th></tr></thead>
        <tbody>
          {users.map(u=><tr key={u.id}>
            {editing?.id === u.id ? <>
              <td>{u.id}</td>
              <td><input className="table-input" value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})}/></td>
              <td><input className="table-input" value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})}/></td>
              <td>{u.review_count}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td><div className="table-actions"><button onClick={save}><Save size={14}/></button><button onClick={()=>setEditing(null)}><X size={14}/></button></div></td>
            </> : <>
              <td>#{u.id}</td>
              <td><b>{u.name}</b></td>
              <td className="table-email">{u.email}</td>
              <td><span className="count-pill">{u.review_count}</span></td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td><div className="table-actions"><button onClick={()=>setEditing({...u,password:""})} title="Edit"><Edit3 size={14}/></button><button className="danger-action" onClick={()=>remove(u.id)} title="Delete"><Trash2 size={14}/></button></div></td>
            </>}
          </tr>)}
        </tbody>
      </table>
      {!users.length && <div className="empty-state"><b>No users found</b></div>}
    </div>
  </div>
}
