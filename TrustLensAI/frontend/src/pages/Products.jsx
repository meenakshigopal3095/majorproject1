import React, { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import api from "../api";

export default function Products() {
  const [products, setProducts] = useState([]);
  useEffect(()=>{api.get("/products").then(r=>setProducts(r.data));},[]);
  return <div>
    <div className="section-head"><div><span className="eyebrow">AGGREGATED SIGNALS</span><h3>Product Risk Insights</h3></div></div>
    <div className="product-grid">
      {products.map(p=><div className="product-card" key={p.product}>
        <div className="product-icon"><PackageSearch size={22}/></div>
        <h3>{p.product}</h3>
        <div className="product-meta"><span>{p.reviews} reviews analyzed</span><span>{p.average_rating} ★ average</span></div>
        <div className="risk-bar"><i style={{width:`${Math.min(p.risk,100)}%`}}></i></div>
        <div className="product-risk"><span>SUSPICIOUS REVIEW RATE</span><b>{p.risk}%</b></div>
      </div>)}
      {!products.length && <div className="empty-state"><b>No product data yet</b><p>Analyze reviews to create product-level insights.</p></div>}
    </div>
  </div>
}
