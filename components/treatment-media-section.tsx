import { getTreatmentMedia } from "@/lib/db";

type MediaRow={id:number;kind:string;url:string;alt_text:string;placement:string;pair_number:number|null;is_illustrative:boolean;patient_consent_verified:boolean};

export default async function TreatmentMediaSection({name,slug}:{name:string;slug:string}) {
 const rows=await getTreatmentMedia(slug) as MediaRow[];
 const photos=rows.filter(x=>x.placement==="gallery"&&x.kind==="image");
 const videos=rows.filter(x=>x.kind==="video");
 const comparisons=[1,2].map(pair=>({
  pair,
  before:rows.find(x=>x.placement==="comparison_before"&&x.pair_number===pair),
  after:rows.find(x=>x.placement==="comparison_after"&&x.pair_number===pair)
 })).filter(x=>x.before||x.after);
 return <section className="media-section"><div className="wrap">
  <div className="clinical-comparisons-heading"><span>TREATMENT IMAGE GALLERY</span><h2>See the difference.</h2></div>
  <p className="comparison-disclaimer">Illustrative images are labelled as examples. Individual treatment results vary. Patient photographs are displayed only when the clinic has confirmed permission to publish them.</p>
  <div className="clinical-comparisons-grid">
   {comparisons.length?comparisons.map(({pair,before,after})=><article className="clinical-compare-card" key={pair}>
    <div className="clinical-compare-card-heading"><h3>Before &amp; after · Example {pair}</h3></div>
    <div className="clinical-pair-images">
     <div className="clinical-photo-slot"><span>BEFORE</span>{before?<img src={before.url} alt={before.alt_text||name+" before treatment"} loading="lazy"/>:<div className="clinical-photo-empty"><span>Before photo not added</span></div>}</div>
     <div className="clinical-photo-slot"><span>AFTER</span>{after?<img src={after.url} alt={after.alt_text||name+" after treatment"} loading="lazy"/>:<div className="clinical-photo-empty"><span>After photo not added</span></div>}</div>
    </div>
    {(before?.is_illustrative||after?.is_illustrative)&&<small className="comparison-label">Illustrative example — not a patient result</small>}
   </article>):<article className="clinical-compare-card comparison-empty"><div className="clinical-compare-card-heading"><h3>Before &amp; after examples</h3></div><p>Clinic-approved comparison photographs will appear here when added by the administrator.</p></article>}
  </div>
  <div className="gallery-subheading"><span>PHOTOS</span><h3>{name} photos</h3></div>
  <div className="media-grid treatment-gallery-grid">{photos.map(x=><figure className="treatment-media-item" key={x.id}><img src={x.url} alt={x.alt_text||name+" treatment photo"} loading="lazy"/></figure>)}</div>
  <div className="gallery-subheading videos-subheading"><span>VIDEOS</span><h3>{name} videos</h3></div>
  <div className="media-grid treatment-videos-grid">{videos.length?videos.map(x=><figure className="treatment-media-item" key={x.id}><video src={x.url} controls preload="metadata" aria-label={name+" treatment video"}/></figure>):<div className="video-empty-skeleton" aria-label="No videos uploaded yet"><span className="video-skeleton-play">▶</span><span className="video-skeleton-line"/><span className="video-skeleton-line short"/></div>}</div>
 </div></section>;
}