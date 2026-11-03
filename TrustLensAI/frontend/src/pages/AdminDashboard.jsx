import React, { useEffect, useState } from "react";
import { Users, ShieldAlert, ShieldCheck, ClipboardCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import StatCard from "../components/StatCard";

export default function AdminDashboard() {
  const [stats, setStats] = useState({total_reviews:0,suspicious:0,genuine:0,pending:0,users:0,products:0});
  const [reviews, setReviews] = useState([]);
  const nav = useNavigate();

  useEffect(()=>{
    api.get("/admin/stats").then(r=>setStats(r.data));
    api.get("/admin/reviews").then(r=>setReviews(r.data.slice(0,6)));
  },[]);

  return <div>
    <div className="admin-hero"><div><span className="eyebrow">PLATFORM OVERVIEW</span><h1>Trust & Safety<br/><em>Command Center.</em></h1><p>Monitor review authenticity, investigate risk signals and keep the platform reliable.</p></div><div className="admin-score"><span>PLATFORM RISK</span><strong>{stats.total_reviews ? Math.round(stats.suspicious/stats.total_reviews*100) : 0}%</strong><small>SUSPICIOUS RATE</small></div></div>
    <div className="stats-grid">
      <StatCard label="TOTAL REVIEWS" value={stats.total_reviews} sub={`${stats.products} products`} icon={<ClipboardCheck/>}/>
      <StatCard label="SUSPICIOUS" value={stats.suspicious} sub="AI flagged" icon={<ShieldAlert/>}/>
      <StatCard label="GENUINE" value={stats.genuine} sub="Low risk" icon={<ShieldCheck/>}/>
      <StatCard label="USERS" value={stats.users} sub={`${stats.pending} pending reviews`} icon={<Users/>}/>
    </div>
    <div className="section-head"><div><span className="eyebrow">MODERATION</span><h3>Latest Review Signals</h3></div><button className="text-btn" onClick={()=>nav("/admin/reviews")}>OPEN QUEUE <ArrowRight size={16}/></button></div>
    <div className="review-list">
      {reviews.map(r=><div className="review-row" key={r.id}><div className={`risk-dot ${r.prediction.toLowerCase()}`}></div><div className="review-main"><b>{r.product}</b><p>{r.text}</p><small>{r.user?.email}</small></div><div className="review-score"><strong>{r.fake_probability}%</strong><small>RISK</small></div><span className={`status-pill ${r.prediction.toLowerCase()}`}>{r.prediction}</span></div>)}
    </div>
  </div>
}
