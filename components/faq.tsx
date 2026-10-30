"use client";
import {useState} from "react";import {Plus,Minus} from "lucide-react";
export function FAQ({items}:{items:{q:string;a:string}[]}){const [active,setActive]=useState<number|null>(0);return <div className="faq-list">{items.map((x,i)=><div className={"faq-item "+(active===i?"active":"")} key={x.q}><button onClick={()=>setActive(active===i?null:i)} aria-expanded={active===i}><span>{x.q}</span>{active===i?<Minus size={18}/>:<Plus size={18}/>}</button>{active===i&&<div className="faq-answer"><p>{x.a}</p></div>}</div>)}</div>}
