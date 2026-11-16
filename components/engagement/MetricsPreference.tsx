'use client';
import { useEffect,useState } from 'react';
import { metricsAllowed } from '@/lib/engagement/client';
export function MetricsPreference({ar}:{ar:boolean}){
 const [enabled,setEnabled]=useState(false),[loaded,setLoaded]=useState(false);
 useEffect(()=>{setEnabled(metricsAllowed());setLoaded(true);},[]);
 return <div><p>{ar?'تقدر توقف إرسال إحصاءات النقر واللعب من هالمتصفح. نحترم أيضًا Do Not Track وGlobal Privacy Control. هالخيار ما بمنع إرسال استبيان تختار إرساله.':'You can stop click and game measurements in this browser. We also respect Do Not Track and Global Privacy Control. This does not block a survey you choose to submit.'}</p><button type="button" disabled={!loaded} style={{minHeight:44,padding:'10px 16px',border:'1px solid',borderRadius:8,background:'#fffdf8',color:'#062759',cursor:'pointer'}} onClick={()=>{try{localStorage.setItem('fed3:metrics-disabled',enabled?'1':'0');setEnabled(metricsAllowed());}catch{setEnabled(false);}}}>{ar?(enabled?'إيقاف إحصاءات هذا المتصفح':'السماح بالإحصاءات (مع احترام إعدادات المتصفح)'):(enabled?'Disable measurements in this browser':'Allow measurements (respect browser privacy settings)')}</button><p role="status">{ar?(enabled?'الإرسال مفعّل.':'الإرسال متوقف في هالمتصفح.'):(enabled?'Measurement is enabled.':'Measurement is disabled in this browser.')}</p></div>;
}
