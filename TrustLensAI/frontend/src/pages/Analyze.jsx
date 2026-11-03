import React, { useState } from "react";
import { ScanSearch, ShieldCheck, AlertTriangle, RotateCcw } from "lucide-react";
import api from "../api";

export default function Analyze() {
  const [form, setForm] = useState({product:"", rating:5, text:""});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const {data} = await api.post("/reviews/analyze", form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed");
    } finally { setLoading(false); }
  };

  return <div className="analyze-layout">
    <div className="form-card">
      <span className="eyebrow">AI REVIEW ANALYZER</span>
      <h2>Inspect A Review</h2>
      <p className="muted">Enter the review exactly as it appears online. The model combines language patterns with interpretable risk signals.</p>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={submit}>
        <label>Product / Service Name</label>
        <input className="plain-input" value={form.product} onChange={e=>setForm({...form,product:e.target.value})} placeholder="Example: Wireless Headphones" required />
        <label>Star Rating</label>
        <div className="rating-picker">{[1,2,3,4,5].map(n=><button type="button" key={n} className={form.rating>=n?"star selected":"star"} onClick={()=>setForm({...form,rating:n})}>★</button>)}</div>
        <label>Review Text</label>
        <textarea value={form.text} onChange={e=>setForm({...form,text:e.target.value})} placeholder="Paste or type the full review here..." required />
        <div className="character-note">{form.text.length} characters</div>
        <button className="primary-btn full" disabled={loading}>{loading ? "ANALYZING..." : "RUN AI ANALYSIS"} <ScanSearch size={18}/></button>
      </form>
    </div>

    <div className="result-card">
      {!result ? <div className="result-empty"><div className="result-icon"><ScanSearch size={32}/></div><h3>Analysis Result</h3><p>Your prediction, risk score and explanation signals will appear here.</p></div> :
      <div className="result-content">
        <div className={`result-status ${result.prediction.toLowerCase()}`}>
          {result.prediction === "Suspicious" ? <AlertTriangle size={26}/> : <ShieldCheck size={26}/>}
          <div><span>AI ASSESSMENT</span><h2>{result.prediction}</h2></div>
        </div>
        <div className="score-ring" style={{"--score": `${result.fake_probability}%`}}><strong>{result.fake_probability}%</strong><span>FAKE RISK</span></div>
        <div className="prob-grid"><div><b>{result.genuine_probability}%</b><span>GENUINE PROBABILITY</span></div><div><b>{result.confidence}%</b><span>CONFIDENCE</span></div></div>
        <h4>RISK SIGNALS</h4>
        <div className="signals">{result.signals.map((s,i)=><div key={i}>• {s}</div>)}</div>
        <div className="recommendation"><b>RECOMMENDATION</b><p>{result.recommendation}</p></div>
        <button className="secondary-btn" onClick={()=>setResult(null)}><RotateCcw size={16}/> ANALYZE ANOTHER</button>
      </div>}
    </div>
  </div>
}
