import { getTreatmentMedia } from "@/lib/db";

export default async function TreatmentMediaSection({name,slug}:{name:string;slug:string}) {
 const rows=await getTreatmentMedia(slug) as any[];
 const photos=rows.filter(x=>x.placement==="gallery"&&x.kind==="image");
 const videos=rows.filter(x=>x.kind==="video");
 return <section className="media-section"><div className="wrap">
  <div className="clinical-comparisons-heading"><span>TREATMENT IMAGE GALLERY</span><h2>See the difference.</h2></div>
  <div className="clinical-comparisons-grid">
   {[1,2].map(pair=><article className="clinical-compare-card" key={pair}>
    <div className="clinical-compare-card-heading"><h3>Before &amp; after</h3></div>
    <div className="clinical-pair-images">
     <div className="clinical-photo-slot"><span>BEFORE</span><div className="clinical-photo-empty" aria-label="Before photo not uploaded"><span>Photo coming soon</span></div></div>
     <div className="clinical-photo-slot"><span>AFTER</span><div className="clinical-photo-empty" aria-label="After photo not uploaded"><span>Photo coming soon</span></div></div>
    </div>
   </article>)}
  </div>
  <div className="gallery-subheading"><span>PHOTOS</span><h3>{name} photos</h3></div>
  <div className="media-grid treatment-gallery-grid">{photos.map(x=><figure className="treatment-media-item" key={x.id}><img src={x.url} alt={name+" treatment photo"} loading="lazy"/></figure>)}</div>
  <div className="gallery-subheading videos-subheading"><span>VIDEOS</span><h3>{name} videos</h3></div>
  <div className="media-grid treatment-videos-grid">{videos.length?videos.map(x=><figure className="treatment-media-item" key={x.id}><video src={x.url} controls preload="metadata" aria-label={name+" treatment video"}/></figure>):<div className="video-empty-skeleton" aria-label="No videos uploaded yet"><span className="video-skeleton-play">▶</span><span className="video-skeleton-line"/><span className="video-skeleton-line short"/></div>}</div>
 </div></section>;
}
