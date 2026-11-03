import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, LockKeyhole, Mail, Eye, EyeOff, Sparkles } from "lucide-react";
import api from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      onLogin(data);
      nav(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="brand-lockup auth-brand">
          <div className="brand-symbol"><ShieldCheck size={27} strokeWidth={2.2}/></div>
          <div><strong>TRUST<span>LENSAI</span></strong><small>REVIEW INTELLIGENCE</small></div>
        </div>

        <div className="brand-showcase">
          <div className="showcase-orbit orbit-one"></div>
          <div className="showcase-orbit orbit-two"></div>
          <div className="showcase-core"><ShieldCheck size={66}/><span>AI</span></div>
        </div>

        <div className="auth-brand-copy">
          <span className="eyebrow inverse">INTELLIGENCE YOU CAN TRUST</span>
          <h1>See Beyond<br/><em>The Rating.</em></h1>
          <p>TrustLensAI turns review text into transparent risk signals, helping you separate authentic feedback from suspicious patterns.</p>
          <div className="brand-pills"><span>AI ANALYSIS</span><span>EXPLAINABLE SIGNALS</span><span>TRUST ANALYTICS</span></div>
        </div>

        <div className="auth-footer-brand">TRUSTLENSAI <span>•</span> SMART REVIEW INTELLIGENCE</div>
      </div>

      <div className="auth-form-panel auth-login-panel">
        <div className="auth-mobile-brand">
          <div className="brand-symbol"><ShieldCheck size={22}/></div>
          <b>TRUST<span>LENSAI</span></b>
        </div>

        <form className="auth-form-card" onSubmit={submit}>
          <div className="auth-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign In</h2>
            <p>Enter your account details to continue to your workspace.</p>
          </div>

          {error && <div className="auth-alert error-box">{error}</div>}

          <label>Email Address</label>
          <div className="auth-input">
            <Mail size={17}/>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <LockKeyhole size={17}/>
            <input type={showPassword ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required />
            <button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
            </button>
          </div>

          <div className="auth-options">
            <label className="check-option"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Remember me</span></label>
            <span className="auth-hint">Secure AI workspace</span>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "SIGNING IN..." : "SIGN IN"}
            {!loading && <ArrowRight size={17}/>}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-switch">New to TrustLensAI? <Link to="/signup">Create an account</Link></p>

          <div className="admin-access-note">
            <Sparkles size={15}/>
            <div><b>ADMIN ACCESS</b><span>Use the predefined administrator credentials. Admin registration is disabled.</span></div>
          </div>
        </form>
      </div>
    </div>
  );
}
