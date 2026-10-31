"use client";
import { useEffect, useMemo, useState } from "react";
type Review = { id: number | string; display_name: string; rating: number; review_text: string; date_label?: string | null; created_at?: string };
export default function ReviewList({ reviews, variant = "home" }: { reviews: Review[]; variant?: string }) {
 const [initialCount,setInitialCount]=useState(3);
 const [visibleCount,setVisibleCount]=useState(3);
 const [renderCount,setRenderCount]=useState(3);
 const [expanded,setExpanded]=useState(false);
 const [isMobile,setIsMobile]=useState(true);
 useEffect(()=>{
  const media=window.matchMedia("(min-width: 768px)");
  const update=()=>{const mobile=!media.matches;const count=mobile?3:6;setIsMobile(mobile);setInitialCount(count);if(!expanded){setVisibleCount(count);setRenderCount(count);}};
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
 const perRow=isMobile?1:2;
 const visibleRows=isMobile?visibleCount:Math.ceil(visibleCount/2);
 const rows:Review[][]=[];
 const rendered=ordered.slice(0,renderCount);
 for(let i=0;i<rendered.length;i+=perRow)rows.push(rendered.slice(i,i+perRow));
 function showMore(){const next=Math.min(visibleCount+3,ordered.length);setRenderCount(next);setVisibleCount(next);setExpanded(true);}
 function showLess(){setVisibleCount(initialCount);}
 if(!ordered.length)return <div className="shared-review-empty"><p>There are no approved reviews published yet.</p></div>;
 return <div className="shared-review-list-wrap">
  <div className="shared-review-list" aria-live="polite">
   {rows.map((row,index)=>{
    const visible=index<visibleRows;
    return <div className="shared-review-row" key={String(row[0]?.id||index)} style={{maxHeight:visible?"1000px":"0px",opacity:visible?1:0,marginBottom:visible?"14px":"0px"}} onTransitionEnd={event=>{if(event.propertyName==="max-height"&&index===rows.length-1&&visibleCount<renderCount){setRenderCount(visibleCount);setExpanded(false);}}}>
     {row.map(review=><article className="shared-review-card" key={review.id}>
      <div className="shared-review-card-top"><span className="shared-review-stars" aria-label={review.rating+" out of 5 stars"}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span></div>
      {review.review_text?.trim()&&<p>{review.review_text}</p>}
      <div className="shared-review-author"><b>{review.display_name}</b>{(review.date_label||review.created_at)&&<time>{review.date_label||new Date(review.created_at as string).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}</time>}</div>
     </article>)}
    </div>;
   })}
  </div>
  <div className="shared-review-actions">{canShowMore&&<button type="button" onClick={showMore}>Show more <span aria-hidden="true">↓</span></button>}{canShowLess&&<button type="button" onClick={showLess}>Show less <span aria-hidden="true">↑</span></button>}</div>
 </div>;
}
