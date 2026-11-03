import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanSearch, ShieldCheck, AlertTriangle, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import api from "../api";
import StatCard from "../components/StatCard";

export default function UserDashboard() {
  const [reviews, setReviews] = useState([]);
  const nav = useNavigate();

  useEffect(() => { api.get("/reviews/my").then(r=>setReviews(r.data)).catch(()=>{}); }, []);

  const suspicious = reviews.filter(r=>r.prediction==="Suspicious").length;
  const genuine = reviews.filter(r=>r.prediction==="Genuine").length;
  const avgRisk = reviews.length ? (reviews.reduce((a,r)=>a+r.fake_probability,0)/reviews.length).toFixed(1) : 0;

  return <div>
    <div className="hero-card">
      <div>
        <span className="eyebrow">YOUR REVIEW INTELLIGENCE</span>
        <h1>Make Every Review<br/><em>More Transparent.</em></h1>
        <p>Use AI to identify suspicious language patterns and review-risk signals before trusting online feedback.</p>
        <button className="primary-btn" onClick={()=>nav("/analyze")}>ANALYZE A REVIEW <ArrowRight size={18}/></button>
      </div>
      <div className="hero-orb"><ShieldCheck size={86}/><span>AI</span></div>
    </div>

    <div className="stats-grid">
      <StatCard label="REVIEWS ANALYZED" value={reviews.length} sub="Your total analyses" icon={<ScanSearch/>}/>
      <StatCard label="SUSPICIOUS" value={suspicious} sub="Need closer review" icon={<AlertTriangle/>}/>
      <StatCard label="GENUINE" value={genuine} sub="Low-risk results" icon={<ShieldCheck/>}/>
      <StatCard label="AVERAGE RISK" value={`${avgRisk}%`} sub="Across your analyses" icon={<TrendingUp/>}/>
    </div>

    <div className="section-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Latest Analyses</h3></div><button className="text-btn" onClick={()=>nav("/history")}>VIEW ALL <ArrowRight size={16}/></button></div>

    <div className="review-list">
      {reviews.slice(0,4).map(r=><div className="review-row" key={r.id}>
        <div className={`risk-dot ${r.prediction.toLowerCase()}`}></div>
        <div className="review-main"><b>{r.product}</b><p>{r.text}</p></div>
        <div className="review-score"><strong>{r.fake_probability}%</strong><small>FAKE RISK</small></div>
        <span className={`status-pill ${r.prediction.toLowerCase()}`}>{r.prediction}</span>
      </div>)}
      {!reviews.length && <div className="empty-state"><Sparkles size={28}/><b>No analyses yet</b><p>Start by analyzing your first review.</p></div>}
    </div>
  </div>
}
