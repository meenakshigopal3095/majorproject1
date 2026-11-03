import React, { useEffect, useState } from "react";
import api from "../api";

export default function History() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("All");
  useEffect(()=>{api.get("/reviews/my").then(r=>setReviews(r.data));},[]);
  const shown = filter==="All" ? reviews : reviews.filter(r=>r.prediction===filter);

  return <div>
    <div className="section-head"><div><span className="eyebrow">PERSONAL RECORD</span><h3>Your Analysis History</h3></div>
      <div className="filter-tabs">{["All","Genuine","Suspicious"].map(x=><button className={filter===x?"selected":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div>
    </div>
    <div className="table-card">
      <table><thead><tr><th>PRODUCT</th><th>REVIEW</th><th>AI RESULT</th><th>RISK</th><th>DATE</th></tr></thead>
      <tbody>{shown.map(r=><tr key={r.id}><td><b>{r.product}</b></td><td className="table-review">{r.text}</td><td><span className={`status-pill ${r.prediction.toLowerCase()}`}>{r.prediction}</span></td><td><b>{r.fake_probability}%</b></td><td>{new Date(r.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>
      {!shown.length && <div className="empty-state"><b>No matching reviews</b></div>}
    </div>
  </div>
}
