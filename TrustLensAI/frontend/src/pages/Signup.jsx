import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, UserRound, Mail, LockKeyhole, Eye, EyeOff, Check } from "lucide-react";
import api from "../api";

export default function Signup() {
  const [form, setForm] = useState({name:"", email:"", password:""});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      setMsg("Account created successfully. Taking you to sign in...");
      setTimeout(() => nav("/login"), 900);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-signup-page">
      <div className="auth-form-panel auth-signup-form-panel">
        <div className="auth-mobile-brand">
          <div className="brand-symbol"><ShieldCheck size={22}/></div>
          <b>TRUST<span>LENSAI</span></b>
        </div>

        <form className="auth-form-card" onSubmit={submit}>
          <div className="auth-heading">
            <span className="eyebrow">GET STARTED</span>
            <h2>Create Account</h2>
            <p>Build your personal review intelligence workspace.</p>
          </div>

          {error && <div className="auth-alert error-box">{error}</div>}
          {msg && <div className="auth-alert success-box">{msg}</div>}

          <label>Full Name</label>
          <div className="auth-input">
            <UserRound size={17}/>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" required />
          </div>

          <label>Email Address</label>
          <div className="auth-input">
            <Mail size={17}/>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <LockKeyhole size={17}/>
            <input type={showPassword ? "text" : "password"} minLength="6" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters" required />
            <button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
            </button>
          </div>

          <div className="password-rule"><Check size={13}/> Use at least 6 characters for a stronger account.</div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            {!loading && <ArrowRight size={17}/>}
          </button>

          <div className="auth-divider"><span>ALREADY A MEMBER?</span></div>
          <p className="auth-switch">Existing user? <Link to="/login">Sign in</Link></p>

          <div className="privacy-note">Your account is protected with secure password hashing and authenticated API sessions.</div>
        </form>
      </div>

      <div className="auth-brand-panel signup-brand-panel">
        <div className="brand-lockup auth-brand">
          <div className="brand-symbol"><ShieldCheck size={27} strokeWidth={2.2}/></div>
          <div><strong>TRUST<span>LENSAI</span></strong><small>REVIEW INTELLIGENCE</small></div>
        </div>

        <div className="signup-showcase">
          <div className="floating-insight insight-one"><span>AI RISK</span><b>14.2%</b><small>LOW RISK</small></div>
          <div className="floating-insight insight-two"><span>TRUST SCORE</span><b>92</b><small>HIGH CONFIDENCE</small></div>
          <div className="showcase-core signup-core"><ShieldCheck size={66}/><span>AI</span></div>
        </div>

        <div className="auth-brand-copy">
          <span className="eyebrow inverse">YOUR PERSONAL TRUST LAYER</span>
          <h1>Make Smarter<br/><em>Review Decisions.</em></h1>
          <p>Analyze review language, understand suspicious signals and build a clearer picture of product feedback.</p>
          <div className="feature-lines"><div><Check size={15}/> AI-powered review analysis</div><div><Check size={15}/> Transparent risk explanations</div><div><Check size={15}/> Personal analysis history</div></div>
        </div>

        <div className="auth-footer-brand">TRUSTLENSAI <span>•</span> SMART REVIEW INTELLIGENCE</div>
      </div>
    </div>
  );
}
