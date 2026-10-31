import { getTreatmentMedia } from "@/lib/db";
import EducationalComparisons from "@/components/educational-comparisons";
export default async function TreatmentMediaSection({name,slug}:{name:string;slug:string}) {
 const rows=await getTreatmentMedia(slug) as any[];
 const photos=rows.filter(x=>x.placement==="gallery"&&x.kind==="image");
 const videos=rows.filter(x=>x.kind==="video");
 const before=rows.filter(x=>x.placement==="comparison_before");
 const after=rows.filter(x=>x.placement==="comparison_after");
 const items=[1,2].map(pairNumber=>{const a=before.find(x=>Number(x.pair_number)===pairNumber);const b=after.find(x=>Number(x.pair_number)===pairNumber);return a&&b?{pairNumber,title:name+" example "+pairNumber,beforeUrl:a.url,afterUrl:b.url}:null;}).filter(Boolean) as any[];
 return <section className="media-section"><div className="wrap"><div className="clinical-comparisons-heading"><span>TREATMENT IMAGE GALLERY</span><h2>Explore {name.toLowerCase()}.</h2><p>Two draggable educational before-and-after illustrations are included. They are examples only, not real cases or guaranteed outcomes.</p></div><div className="media-grid">{photos.map(x=><figure className="treatment-media-item" key={x.id}><img src={x.url} alt={x.alt_text||name} loading="lazy"/>{x.alt_text&&<figcaption>{x.alt_text}</figcaption>}</figure>)}<EducationalComparisons items={items}/>{videos.map(x=><figure className="treatment-media-item" key={x.id}><video src={x.url} controls preload="metadata"/>{x.alt_text&&<figcaption>{x.alt_text}</figcaption>}</figure>)}</div></div></section>;
}
