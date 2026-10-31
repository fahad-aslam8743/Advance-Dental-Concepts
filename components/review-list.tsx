"use client";
import { useEffect, useMemo, useState } from "react";
type Review = { id: number | string; display_name: string; rating: number; review_text: string; source?: string; created_at?: string };
export default function ReviewList({ reviews, variant = "home" }: { reviews: Review[]; variant?: string }) {
 const [initialCount,setInitialCount]=useState(3);
 const [visibleCount,setVisibleCount]=useState(3);
 const [expanded,setExpanded]=useState(false);
 const [isMobile,setIsMobile]=useState(true);
 useEffect(()=>{
  const media=window.matchMedia("(min-width: 768px)");
  const update=()=>{const mobile=!media.matches;const count=mobile?3:6;setIsMobile(mobile);setInitialCount(count);setVisibleCount(current=>expanded?current:count);};
  update();media.addEventListener?.("change",update);return()=>media.removeEventListener?.("change",update);
 },[expanded]);
 const ordered=useMemo(()=>{
  if(!reviews.length)return [];
  const seed=Array.from(variant).reduce((sum,char)=>sum+char.charCodeAt(0),0);
  const offset=seed%reviews.length;
  return [...reviews.slice(offset),...reviews.slice(0,offset)];
 },[reviews,variant]);
 const canShowMore=visibleCount<ordered.length;
 const canShowLess=visibleCount>=ordered.length&&visibleCount>initialCount;
 function showMore(){setVisibleCount(current=>Math.min(current+3,ordered.length));setExpanded(true);}
 function showLess(){setVisibleCount(initialCount);setExpanded(false);}
 if(!ordered.length)return <div className="shared-review-empty"><p>There are no approved reviews published yet.</p></div>;
 return <div className="shared-review-list-wrap">
  <div className="shared-review-list" style={{maxHeight:(visibleCount>=ordered.length?Math.max(1,Math.ceil(ordered.length/(isMobile?1:2))):Math.ceil(visibleCount/(isMobile?1:2)))*520+"px"}} aria-live="polite">
   {ordered.slice(0,visibleCount).map(review=><article className="shared-review-card" key={review.id}>
    <div className="shared-review-card-top"><span className="shared-review-stars" aria-label={review.rating+" out of 5 stars"}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span><small>{review.source==="google"?"GOOGLE REVIEW":"PATIENT REVIEW"}</small></div>
    <p>{review.review_text}</p>
    <div className="shared-review-author"><b>{review.display_name}</b>{review.created_at&&<time>{new Date(review.created_at).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}</time>}</div>
   </article>)}
  </div>
  <div className="shared-review-actions">{canShowMore&&<button type="button" onClick={showMore}>Show more <span aria-hidden="true">↓</span></button>}{canShowLess&&<button type="button" onClick={showLess}>Show less <span aria-hidden="true">↑</span></button>}</div>
 </div>;
}
