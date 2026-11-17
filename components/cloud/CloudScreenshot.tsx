import Image from 'next/image';
import type { Locale } from '@/lib/fed3/config';
import { cloudScreenshots,type CloudScreenshotId } from '@/lib/fed3/cloud-screenshots';
import styles from './screenshots.module.css';

export function CloudScreenshot({id,locale,compact=false,sizes='(max-width: 800px) 88vw, 44vw'}:{id:CloudScreenshotId;locale:Locale;compact?:boolean;sizes?:string}){
 const shot=cloudScreenshots[id],ar=locale==='ar';
 return <figure className={`${styles.figure} ${compact?styles.compact:''}`} data-cloud-screenshot={id}>
   <a className={styles.imageLink} href={shot.src} target="_blank" rel="noopener noreferrer" aria-label={`${ar?'افتح اللقطة بحجمها الكامل':'Open screenshot at full size'}: ${shot.caption[locale]}`}>
    <Image src={shot.src} width={shot.width} height={shot.height} alt={shot.alt[locale]} sizes={sizes} unoptimized/>
    <span className={styles.zoom}>{ar?'افتح بحجم كامل':'Open full size'} <span aria-hidden="true">+</span></span>
   </a>
   <figcaption><span>{shot.caption[locale]}</span><span className={styles.credit}><a href={shot.source} target="_blank" rel="noopener noreferrer">{shot.origin==='guide'?(ar?'من دليل المبادرة':'From the initiative guide'):(ar?'توثيق Nextcloud':'Nextcloud documentation')}</a>{shot.origin==='nextcloud'&&<> · Nextcloud contributors · <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a></>}</span></figcaption>
 </figure>;
}

export function CloudGuideScreenshots({locale}:{locale:Locale}){
 const ar=locale==='ar';
 return <section className={styles.guide} aria-labelledby="cloud-guide-shots-heading" data-cloud-guide-screenshots>
  <header><p>{ar?'من دليل المبادرة / لقطات التجربة':'FROM THE INITIATIVE GUIDE / TRIAL SCREENSHOTS'}</p><h3 id="cloud-guide-shots-heading">{ar?'شوفوا الخطوات على الشاشة.':'See the steps on screen.'}</h3><p>{ar?'لقطات أصلية من Home-cloud guide. قد تختلف الواجهة حسب الإصدار؛ افتحوا الصورة بحجمها الكامل لقراءة التفاصيل.':'Original screenshots from Home-cloud guide. Interfaces vary by version; open each image at full size to read the details.'}</p></header>
  <div className={styles.guideGrid}>{(['lubuntu','collabora','updates'] as const).map(id=><CloudScreenshot key={id} id={id} locale={locale} compact sizes="(max-width: 800px) 88vw, 29vw"/>)}</div>
 </section>;
}
