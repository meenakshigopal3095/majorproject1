import React, { useEffect, useState } from "react";
import api from "../api";
import { Edit3, Trash2, Save, X } from "lucide-react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState(null);

  const load = () => {
    const params = new URLSearchParams();
    if (status !== "All") params.set("status", status);
    if (search) params.set("search", search);
    api.get(`/admin/reviews?${params}`).then(r=>setReviews(r.data));
  };

  useEffect(load, [status]);

  const updateStatus = async (id, next) => {
    await api.patch(`/admin/reviews/${id}`, {status: next});
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    await api.delete(`/admin/reviews/${id}`);
    load();
  };

  const saveEdit = async () => {
    await api.patch(`/admin/reviews/${editing.id}`, {
      product: editing.product,
      rating: editing.rating,
      text: editing.text,
      status: editing.moderation_status
    });
    setEditing(null);
    load();
  };

  return <div>
    <div className="section-head">
      <div><span className="eyebrow">REVIEW MANAGEMENT</span><h3>Moderation & Review Control</h3></div>
    </div>

    <div className="toolbar">
      <input className="plain-input" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search product, review, user or prediction..." />
      <button className="primary-btn compact" onClick={load}>SEARCH</button>
      <select value={status} onChange={e=>setStatus(e.target.value)}>
        <option>All</option><option>Pending</option><option>Reviewed</option><option>Escalated</option>
      </select>
    </div>

    <div className="admin-review-grid">
      {reviews.map(r=><div className="admin-review-card" key={r.id}>
        {editing?.id === r.id ? <div className="admin-edit-form">
          <label>Product</label><input className="plain-input" value={editing.product} onChange={e=>setEditing({...editing,product:e.target.value})}/>
          <label>Rating</label><select value={editing.rating} onChange={e=>setEditing({...editing,rating:Number(e.target.value)})}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select>
          <label>Review Text</label><textarea value={editing.text} onChange={e=>setEditing({...editing,text:e.target.value})}/>
          <label>Moderation</label><select value={editing.moderation_status} onChange={e=>setEditing({...editing,moderation_status:e.target.value})}><option>Pending</option><option>Reviewed</option><option>Escalated</option></select>
          <div className="card-actions"><button onClick={saveEdit}><Save size={14}/> SAVE</button><button onClick={()=>setEditing(null)}><X size={14}/> CANCEL</button></div>
        </div> : <>
          <div className="card-top"><span className={`status-pill ${r.prediction.toLowerCase()}`}>{r.prediction}</span><b>{r.fake_probability}% RISK</b></div>
          <h3>{r.product}</h3><p>{r.text}</p>
          <div className="card-info"><span>{r.user?.name}</span><span>{r.rating} ★</span><span>{r.moderation_status}</span></div>
          <div className="signal-tags">{r.signals.map((s,i)=><span key={i}>{s}</span>)}</div>
          <div className="card-actions">
            <button onClick={()=>setEditing(r)}><Edit3 size={14}/> EDIT</button>
            <button onClick={()=>updateStatus(r.id,"Reviewed")}>MARK REVIEWED</button>
            <button onClick={()=>updateStatus(r.id,"Escalated")}>ESCALATE</button>
            <button className="danger-action" onClick={()=>remove(r.id)}><Trash2 size={14}/> DELETE</button>
          </div>
        </>}
      </div>)}
      {!reviews.length && <div className="empty-state"><b>No reviews found</b></div>}
    </div>
  </div>
}
