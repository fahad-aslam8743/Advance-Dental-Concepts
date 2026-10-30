"use client";

import { useEffect, useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import { services } from "@/data/services";

type Settings = { clinicName:string; phone:string; addressLine:string; city:string; openingHours:string; logoUrl:string; googleReviewsUrl:string; mapUrl:string };
type Review = { id:number; display_name:string; rating:number; treatment_slug:string; review_text:string; status:string; source:string; created_at:string };
type Media = { id:number; treatment_slug:string; kind:string; url:string; alt_text:string; created_at:string };
type Dashboard = { reviews:{total:number;pending:number;approved:number;average_rating:number}; media:{total:number}; trend:{day:string;date:string;count:number}[]; topTreatments:{treatment_slug:string;count:number}[] };

const inputStyle: React.CSSProperties = { width:"100%", border:"1px solid #d9e2dc", borderRadius:10, padding:"12px 13px", background:"#fff", color:"#183b39", outline:"none", fontSize:14 };
const labelStyle: React.CSSProperties = { display:"grid", gap:7, color:"#52645c", fontSize:12, fontWeight:700 };
const cardStyle: React.CSSProperties = { background:"#fff", border:"1px solid #e2e9e2", borderRadius:16, padding:22, boxShadow:"0 8px 24px rgba(23,57,54,.04)" };
const buttonStyle: React.CSSProperties = { border:0, borderRadius:9, padding:"11px 15px", background:"#183b39", color:"#fff", fontWeight:700, cursor:"pointer" };
const defaultSettings:Settings = { clinicName:"Advance Dental Concepts", phone:"0332 4625847", addressLine:"44 F/1, Block F1, Phase 1", city:"Johar Town, Lahore, Pakistan", openingHours:"Monday–Saturday · 10:30 am–2:30 pm & 5:45 pm–10:00 pm", logoUrl:"", googleReviewsUrl:"", mapUrl:"https://www.google.com/maps/search/?api=1&query=Advance+Dental+Concepts+44F1+Johar+Town+Lahore" };

async function api(url:string, options:RequestInit = {}) {
  const response = await fetch(url, { ...options, headers:{ "Content-Type":"application/json", ...(options.headers || {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function AdminPage() {
  const [authenticated,setAuthenticated] = useState(false);
  const [mustChange,setMustChange] = useState(false);
  const [email,setEmail] = useState("admin@dental.com");
  const [password,setPassword] = useState("");
  const [newPassword,setNewPassword] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [tab,setTab] = useState("overview");
  const [dashboard,setDashboard] = useState<Dashboard|null>(null);
  const [settings,setSettings] = useState<Settings>(defaultSettings);
  const [reviews,setReviews] = useState<Review[]>([]);
  const [media,setMedia] = useState<Media[]>([]);
  const [reviewStatus,setReviewStatus] = useState("pending");
  const [manual,setManual] = useState({displayName:"",rating:"5",treatmentSlug:"",reviewText:""});
  const [mediaTreatment,setMediaTreatment] = useState(services[0].slug);
  const [mediaAlt,setMediaAlt] = useState("");
  const [mediaKind,setMediaKind] = useState("image");
  const [message,setMessage] = useState("");
  const [editingReview,setEditingReview] = useState<Review|null>(null);
  const [editDraft,setEditDraft] = useState({displayName:"",rating:"5",treatmentSlug:"",reviewText:""});
  const [accountPassword,setAccountPassword] = useState("");

  async function refresh() {
    const [d,s,r,m] = await Promise.all([
      api("/api/admin/dashboard"), api("/api/admin/settings"),
      api("/api/admin/reviews?status="+reviewStatus), api("/api/admin/media")
    ]);
    setDashboard(d); setSettings(s); setReviews(r); setMedia(m);
  }

  useEffect(() => {
    api("/api/admin/dashboard").then(async()=>{setAuthenticated(true); await refresh();}).catch(()=>{});
  }, []);
  useEffect(() => { if(authenticated && !mustChange) refresh().catch(e=>setError(e.message)); }, [reviewStatus,authenticated,mustChange]);

  async function login(event:React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const data = await api("/api/admin/auth",{method:"POST",body:JSON.stringify({email,password})});
      setAuthenticated(true); setMustChange(Boolean(data.mustChangePassword)); setPassword("");
      if (!data.mustChangePassword) await refresh();
    } catch(e) { setError(e instanceof Error ? e.message : "Login failed"); }
    finally { setBusy(false); }
  }

  async function changePassword(event:React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api("/api/admin/password",{method:"POST",body:JSON.stringify({password:newPassword})}); setMustChange(false); setNewPassword(""); await refresh(); setMessage("Password updated. Your new password is active."); }
    catch(e) { setError(e instanceof Error ? e.message : "Password update failed"); }
    finally { setBusy(false); }
  }

  async function uploadLogo(event:React.ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0]; if(!file)return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result=await upload(file.name,file,{access:"public",handleUploadUrl:"/api/admin/media/upload",clientPayload:JSON.stringify({treatmentSlug:"site-logo",kind:"logo",altText:"Clinic logo"})});
      setSettings({...settings,logoUrl:result.url}); await refresh(); setMessage("Clinic logo uploaded and saved.");
    } catch(e) { setError(e instanceof Error ? e.message : "Logo upload failed"); }
    finally { setBusy(false); event.target.value=""; }
  }

  async function saveSettings(event:React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try { const data=await api("/api/admin/settings",{method:"PUT",body:JSON.stringify(settings)}); setSettings(data.settings); setMessage("Clinic settings saved. They will appear across the website after refresh."); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not save settings"); }
    finally { setBusy(false); }
  }

  async function reviewAction(id:number,action:string) {
    try { await api("/api/admin/reviews",{method:"PATCH",body:JSON.stringify({id,action})}); await refresh(); setMessage("Review updated."); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not update review"); }
  }

  function editReview(review:Review) {
    setEditingReview(review);
    setEditDraft({displayName:review.display_name,rating:String(review.rating),treatmentSlug:review.treatment_slug,reviewText:review.review_text});
  }

  async function saveEditedReview(event:React.FormEvent) {
    event.preventDefault();
    if(!editingReview)return;
    try {
      await api("/api/admin/reviews",{method:"PATCH",body:JSON.stringify({id:editingReview.id,action:"edit",...editDraft,rating:Number(editDraft.rating)})});
      setEditingReview(null); await refresh(); setMessage("Review updated.");
    } catch(e) { setError(e instanceof Error ? e.message : "Could not edit review"); }
  }

  async function updateAccountPassword(event:React.FormEvent) {
    event.preventDefault();
    try {
      await api("/api/admin/password",{method:"POST",body:JSON.stringify({password:accountPassword})});
      setAccountPassword(""); setMessage("Your admin password has been changed.");
    } catch(e) { setError(e instanceof Error ? e.message : "Could not change password"); }
  }

  async function addManualReview(event:React.FormEvent) {
    event.preventDefault();
    try { await api("/api/admin/reviews",{method:"POST",body:JSON.stringify(manual)}); setManual({displayName:"",rating:"5",treatmentSlug:"",reviewText:""}); await refresh(); setMessage("Manual review added and published."); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not add review"); }
  }

  async function uploadMedia(event:React.ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0]; if(!file)return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result=await upload(file.name,file,{
        access:"public", handleUploadUrl:"/api/admin/media/upload",
        clientPayload:JSON.stringify({treatmentSlug:mediaTreatment,kind:mediaKind,altText:mediaAlt})
      });
      await refresh(); setMessage("Media uploaded: "+result.pathname);
    } catch(e) { setError(e instanceof Error ? e.message : "Upload failed"); }
    finally { setBusy(false); event.target.value=""; }
  }

  async function deleteMedia(id:number) {
    if(!window.confirm("Delete this media file from the website?"))return;
    try { await api("/api/admin/media",{method:"DELETE",body:JSON.stringify({id})}); await refresh(); setMessage("Media deleted."); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not delete media"); }
  }

  const maxTrend = useMemo(()=>Math.max(1,...(dashboard?.trend || []).map(x=>Number(x.count))),[dashboard]);
  const treatmentName = (slug:string)=>services.find(s=>s.slug===slug)?.name || slug;

  if(!authenticated) return <main className="admin-app" style={{minHeight:"100vh",background:"#edf2ed",display:"grid",placeItems:"center",padding:20,fontFamily:"Arial,sans-serif"}}>
    <form onSubmit={login} style={{...cardStyle,width:"min(430px,100%)",padding:32}}>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#9a805d"}}>ADVANCE DENTAL CONCEPTS</div>
      <h1 style={{fontSize:30,color:"#183b39",margin:"12px 0 8px"}}>Admin sign in</h1>
      <p style={{color:"#708078",fontSize:13,lineHeight:1.7,marginBottom:24}}>Manage clinic information, patient reviews and treatment media.</p>
      <div style={{display:"grid",gap:15}}>
        <label style={labelStyle}>Email<input style={inputStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/></label>
        <label style={labelStyle}>Password<input style={inputStyle} type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/></label>
        {error&&<p style={{color:"#b42318",fontSize:12}}>{error}</p>}
        <button style={buttonStyle} disabled={busy}>{busy?"Signing in...":"Sign in securely"}</button>
      </div>
    </form>
  </main>;

  if(mustChange) return <main style={{minHeight:"100vh",background:"#edf2ed",display:"grid",placeItems:"center",padding:20,fontFamily:"Arial,sans-serif"}}>
    <form onSubmit={changePassword} style={{...cardStyle,width:"min(450px,100%)",padding:32}}>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:"#9a805d"}}>SECURITY REQUIRED</div>
      <h1 style={{fontSize:28,color:"#183b39"}}>Create a new password</h1>
      <p style={{fontSize:13,color:"#708078",lineHeight:1.7}}>Your temporary password can only be used for this first sign-in. Choose a unique password with at least 10 characters, including letters and numbers.</p>
      <label style={labelStyle}>New password<input style={inputStyle} type="password" minLength={10} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required autoComplete="new-password"/></label>
      {error&&<p style={{color:"#b42318",fontSize:12}}>{error}</p>}
      <button style={{...buttonStyle,marginTop:18}} disabled={busy}>{busy?"Saving...":"Save new password"}</button>
    </form>
  </main>;

  const tabs=[["overview","Overview"],["reviews","Reviews"],["media","Treatment media"],["settings","Clinic settings"]];
  return <main className="admin-app" style={{minHeight:"100vh",background:"#f3f6f2",fontFamily:"Arial,sans-serif",color:"#183b39"}}>
    <header style={{background:"#173936",color:"#fff",padding:"18px 24px"}}>
      <div style={{maxWidth:1250,margin:"auto",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <div><div style={{fontSize:10,letterSpacing:2,color:"#d8c59f",fontWeight:800}}>ADVANCE DENTAL CONCEPTS</div><strong style={{fontSize:20}}>Website administration</strong></div>
        <div style={{display:"flex",gap:14,alignItems:"center",fontSize:12}}><span>{email}</span><button onClick={async()=>{await api("/api/admin/auth",{method:"DELETE"});setAuthenticated(false);}} style={{...buttonStyle,background:"#fff",color:"#173936"}}>Sign out</button></div>
      </div>
    </header>
    <div style={{maxWidth:1250,margin:"auto",padding:24}}>
      <nav style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{...buttonStyle,background:tab===id?"#173936":"#fff",color:tab===id?"#fff":"#34574e",border:"1px solid #dce5dc"}}>{label}</button>)}</nav>
      {error&&<div style={{...cardStyle,color:"#b42318",marginBottom:15}}>{error}</div>}
      {message&&<div style={{...cardStyle,color:"#256344",marginBottom:15}}>{message}</div>}

      {tab==="overview"&&<section style={{display:"grid",gap:18}}>
        <div><h1 style={{fontSize:30,margin:"0 0 5px"}}>Good day</h1><p style={{color:"#728078",margin:0}}>These numbers come directly from your website database.</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          {[["Total reviews",dashboard?.reviews.total ?? 0],["Awaiting approval",dashboard?.reviews.pending ?? 0],["Published reviews",dashboard?.reviews.approved ?? 0],["Average approved rating",dashboard?.reviews.average_rating ?? "—"],["Treatment media files",dashboard?.media.total ?? 0]].map(([label,value])=><div key={String(label)} style={cardStyle}><div style={{fontSize:11,color:"#718078",fontWeight:700}}>{label}</div><div style={{fontSize:32,fontWeight:800,marginTop:10}}>{value}</div></div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
          <div style={cardStyle}><h2 style={{fontSize:17,marginTop:0}}>Review submissions · last 7 days</h2><div style={{height:180,display:"flex",alignItems:"end",gap:12,borderBottom:"1px solid #dce5dc",paddingTop:12}}>{(dashboard?.trend || []).map(point=><div key={point.date} style={{flex:1,height:"100%",display:"flex",flexDirection:"column",justifyContent:"end",alignItems:"center",gap:7}}><span style={{fontSize:11,color:"#53665d"}}>{point.count}</span><div title={point.date} style={{width:"70%",height:Math.max(4,Number(point.count)/maxTrend*115),background:"#3d7465",borderRadius:"6px 6px 0 0"}}/><small style={{fontSize:10,color:"#7c8981"}}>{point.day}</small></div>)}</div><p style={{fontSize:10,color:"#829087"}}>Counts include all submitted reviews, including pending and rejected.</p></div>
          <div style={cardStyle}><h2 style={{fontSize:17,marginTop:0}}>Top reviewed treatments</h2>{(dashboard?.topTreatments || []).length===0?<p style={{color:"#829087",fontSize:13}}>No approved reviews yet. The chart will populate when genuine reviews are approved.</p>:(dashboard?.topTreatments || []).map(item=><div key={item.treatment_slug} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #edf0ec",fontSize:12}}><span>{treatmentName(item.treatment_slug)}</span><b>{item.count}</b></div>)}</div>
        </div>
      </section>}

      {tab==="reviews"&&<section style={{display:"grid",gap:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:15,flexWrap:"wrap"}}><div><h1 style={{fontSize:28,margin:"0 0 5px"}}>Patient reviews</h1><p style={{color:"#728078",margin:0,fontSize:13}}>Public submissions stay hidden until approved.</p></div><select style={{...inputStyle,width:180}} value={reviewStatus} onChange={e=>setReviewStatus(e.target.value)}><option value="pending">Pending queue</option><option value="approved">Published</option><option value="rejected">Rejected</option><option value="all">All reviews</option></select></div>
        <div style={cardStyle}><h2 style={{fontSize:17,marginTop:0}}>Add a review manually</h2><form onSubmit={addManualReview} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
          <label style={labelStyle}>Display name<input style={inputStyle} value={manual.displayName} onChange={e=>setManual({...manual,displayName:e.target.value})} required/></label>
          <label style={labelStyle}>Rating<select style={inputStyle} value={manual.rating} onChange={e=>setManual({...manual,rating:e.target.value})}>{[5,4,3,2,1].map(x=><option key={x}>{x}</option>)}</select></label>
          <label style={labelStyle}>Treatment<select style={inputStyle} value={manual.treatmentSlug} onChange={e=>setManual({...manual,treatmentSlug:e.target.value})} required><option value="">Choose treatment</option>{services.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
          <label style={{...labelStyle,gridColumn:"1/-1"}}>Review<textarea style={inputStyle} rows={3} value={manual.reviewText} onChange={e=>setManual({...manual,reviewText:e.target.value})} required minLength={10}/></label>
          <button style={{...buttonStyle,justifySelf:"start"}}>Add and publish review</button>
        </form></div>
        <div style={{display:"grid",gap:12}}>{reviews.length===0?<div style={cardStyle}>No reviews in this view yet.</div>:reviews.map(review=><article key={review.id} style={cardStyle}>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><b>{review.display_name}</b><div style={{color:"#b28b45",marginTop:4}}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</div><small style={{color:"#829087"}}>{treatmentName(review.treatment_slug)} · {review.source} · {new Date(review.created_at).toLocaleString()}</small></div><span style={{fontSize:11,fontWeight:800,color:review.status==="approved"?"#24724d":review.status==="pending"?"#956d26":"#9b4545"}}>{review.status.toUpperCase()}</span></div>
          <p style={{fontSize:13,lineHeight:1.7,color:"#53665d"}}>{review.review_text}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button style={buttonStyle} onClick={()=>editReview(review)}>Edit</button>{review.status!=="approved"&&<button style={{...buttonStyle,background:"#286a4e"}} onClick={()=>reviewAction(review.id,"approve")}>Approve</button>}{review.status!=="rejected"&&<button style={{...buttonStyle,background:"#8e4545"}} onClick={()=>reviewAction(review.id,"reject")}>Reject</button>}</div>
        </article>)}</div>
      </section>}

      {tab==="media"&&<section style={{display:"grid",gap:18}}>
        <div><h1 style={{fontSize:28,margin:"0 0 5px"}}>Treatment photos & videos</h1><p style={{color:"#728078",margin:0,fontSize:13}}>Uploads are stored in Vercel Blob and linked to the selected treatment page.</p></div>
        <div style={cardStyle}><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,alignItems:"end"}}>
          <label style={labelStyle}>Treatment<select style={inputStyle} value={mediaTreatment} onChange={e=>setMediaTreatment(e.target.value)}>{services.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
          <label style={labelStyle}>Media type<select style={inputStyle} value={mediaKind} onChange={e=>setMediaKind(e.target.value)}><option value="image">Photo</option><option value="video">Video</option></select></label>
          <label style={labelStyle}>Caption / alt text<input style={inputStyle} value={mediaAlt} onChange={e=>setMediaAlt(e.target.value)} placeholder="Describe this media"/></label>
          <label style={labelStyle}>Choose file<input style={inputStyle} type="file" accept={mediaKind==="video"?"video/mp4,video/webm,video/quicktime":"image/jpeg,image/png,image/webp,image/avif"} onChange={uploadMedia} disabled={busy}/></label>
        </div><p style={{fontSize:11,color:"#829087"}}>Images: up to 15 MB. Videos: up to 100 MB. Use clinic-owned or patient-consented media only.</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14}}>{media.length===0?<div style={cardStyle}>No treatment media uploaded yet.</div>:media.map(item=><article key={item.id} style={cardStyle}><div style={{height:150,background:"#edf2ed",borderRadius:10,overflow:"hidden",display:"grid",placeItems:"center"}}>{item.kind==="video"?<video src={item.url} controls style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<img src={item.url} alt={item.alt_text} style={{width:"100%",height:"100%",objectFit:"cover"}}/>}</div><b style={{display:"block",marginTop:12}}>{treatmentName(item.treatment_slug)}</b><small style={{color:"#829087"}}>{item.kind} · {item.alt_text}</small><button onClick={()=>deleteMedia(item.id)} style={{...buttonStyle,background:"#8e4545",marginTop:12}}>Delete media</button></article>)}</div>
      </section>}

      {tab==="settings"&&<section style={{display:"grid",gap:18}}>
        <div><h1 style={{fontSize:28,margin:"0 0 5px"}}>Clinic settings</h1><p style={{color:"#728078",margin:0,fontSize:13}}>These settings are shared by the website header, footer and contact details.</p></div>
        <form onSubmit={saveSettings} style={cardStyle}><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
          {([["clinicName","Clinic / website name"],["phone","Phone number"],["addressLine","Street address"],["city","City / location"],["openingHours","Opening hours"],["logoUrl","Logo image URL"],["googleReviewsUrl","Google reviews link"],["mapUrl","Google Maps / directions link"]] as [keyof Settings,string][]).map(([key,label])=><label key={key} style={labelStyle}>{label}<input style={inputStyle} value={settings[key]} onChange={e=>setSettings({...settings,[key]:e.target.value})}/></label>)}
        </div><label style={{...labelStyle,marginTop:18,maxWidth:420}}>Upload clinic logo (PNG, JPG, WebP · max 5 MB)<input style={inputStyle} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={uploadLogo} disabled={busy}/></label>{settings.logoUrl&&<img src={settings.logoUrl} alt="Current clinic logo" style={{width:90,height:90,objectFit:"contain",marginTop:12,background:"#f2f4f0",borderRadius:10,padding:8}}/>}<button style={{...buttonStyle,marginTop:20}} disabled={busy}>{busy?"Saving...":"Save clinic settings"}</button></form>
        <form onSubmit={updateAccountPassword} style={{...cardStyle,display:"grid",gap:14}}>
          <div><h2 style={{fontSize:18,margin:"0 0 5px"}}>Admin account security</h2><p style={{fontSize:12,color:"#728078",margin:0}}>Change your password whenever you need to. Use at least 10 characters with letters and numbers.</p></div>
          <label style={{...labelStyle,maxWidth:440}}>New password<input style={inputStyle} type="password" minLength={10} value={accountPassword} onChange={e=>setAccountPassword(e.target.value)} autoComplete="new-password" required/></label>
          <button style={{...buttonStyle,justifySelf:"start"}}>Update admin password</button>
        </form>
      </section>}
    </div>

    {editingReview&&<div className="admin-edit-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setEditingReview(null);}}>
      <form className="admin-edit-dialog" data-review-editor onSubmit={saveEditedReview}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:15,marginBottom:18}}>
          <div><small style={{fontWeight:800,letterSpacing:1.5,color:"#087f78"}}>REVIEW MANAGEMENT</small><h2 style={{fontSize:24,margin:"5px 0 0"}}>Edit patient review</h2></div>
          <button type="button" onClick={()=>setEditingReview(null)} style={{background:"#e8f3f0",color:"#173447"}}>Close</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
          <label style={labelStyle}>Display name<input style={inputStyle} value={editDraft.displayName} onChange={e=>setEditDraft({...editDraft,displayName:e.target.value})} required/></label>
          <label style={labelStyle}>Rating<select style={inputStyle} value={editDraft.rating} onChange={e=>setEditDraft({...editDraft,rating:e.target.value})}>{[5,4,3,2,1].map(x=><option key={x} value={x}>{x} stars</option>)}</select></label>
          <label style={{...labelStyle,gridColumn:"1/-1"}}>Treatment<select style={inputStyle} value={editDraft.treatmentSlug} onChange={e=>setEditDraft({...editDraft,treatmentSlug:e.target.value})} required>{services.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
          <label style={{...labelStyle,gridColumn:"1/-1"}}>Review text<textarea style={inputStyle} rows={5} minLength={10} maxLength={1500} value={editDraft.reviewText} onChange={e=>setEditDraft({...editDraft,reviewText:e.target.value})} required/></label>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18}}><button type="button" onClick={()=>setEditingReview(null)} style={{background:"#edf4f2",color:"#173447"}}>Cancel</button><button type="submit" style={buttonStyle}>Save changes</button></div>
      </form>
    </div>}

  </main>;
}
