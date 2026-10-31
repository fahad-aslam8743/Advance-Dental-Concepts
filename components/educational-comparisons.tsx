"use client";
import {useState} from "react";
function Slide({item}:{item:any}) {
 const [position,setPosition]=useState(52);
 return <article className="clinical-compare-card">
  <div className="clinical-compare-card-heading"><span>ILLUSTRATIVE PREVIEW · 0{item.pairNumber}</span><h3>{item.title}</h3></div>
  <div className="clinical-compare-stage">
   <img src={item.afterUrl} alt={"After example: "+item.title} loading="lazy"/>
   <div className="clinical-compare-before-layer" style={{clipPath:"inset(0 "+(100-position)+"% 0 0)"}}><img src={item.beforeUrl} alt={"Before example: "+item.title} loading="lazy"/></div>
   <div className="clinical-compare-divider" style={{left:position+"%"}} aria-hidden="true"><span>↔</span></div>
   <div className="clinical-compare-labels"><span>BEFORE</span><span>AFTER</span></div>
  </div>
  <div className="clinical-compare-control"><label>Drag to compare</label><input type="range" min="5" max="95" value={position} onChange={e=>setPosition(Number(e.target.value))}/></div>
  <p className="clinical-compare-caption">Illustrative artwork only. This is not a real case or a guaranteed outcome; the dentist will explain what is suitable for your own teeth.</p>
 </article>;
}
export default function EducationalComparisons({items}:{items:any[]}) { return <>{items.map(item=><Slide key={item.pairNumber} item={item}/>)}</>; }
