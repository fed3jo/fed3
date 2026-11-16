'use client';
export function metricsAllowed(){
  if(typeof window==='undefined')return false;
  if(navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return false;
  try{return localStorage.getItem('fed3:metrics-disabled')!=='1';}catch{return false;}
}
async function post(path:string,data:unknown){if(!metricsAllowed())throw new Error('measurement_disabled');const r=await fetch(`/api/engagement/${path}/`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),keepalive:true});if(!r.ok)throw new Error('measurement_unavailable');return r.json();}
export function recordDownload(app:string,platform='general'){
  if(!metricsAllowed())return;
  void post('download',{id:crypto.randomUUID(),app,platform}).catch(()=>undefined);
}
type Attempt={id:string;token?:string;expires:number;stage:number;done:boolean};
// A tab-scoped attempt, independent of the local gameplay save. It expires in 24h.
export class GameMeasurement{
  private attempt:Attempt|null=null;private queue:Promise<unknown>=Promise.resolve();
  start(initialStage:number,resume=false){
    if(!metricsAllowed()){this.attempt=null;return;}
    let previous:Attempt|null=null;try{previous=JSON.parse(sessionStorage.getItem('fed3:game-measurement')||'null');}catch{}
    if(resume&&previous&&previous.expires>Date.now()&&!previous.done&&previous.stage===initialStage)this.attempt=previous;
    else this.attempt={id:crypto.randomUUID(),expires:Date.now()+86400000,stage:initialStage,done:false};
    const attempt=this.attempt;this.persist();
    this.queue=post('game/start',{id:attempt.id,initialStage}).then(r=>{attempt.token=r.token;this.persist();}).catch(()=>undefined);
  }
  observe(stage:number,complete:boolean){
    const attempt=this.attempt;if(!attempt||attempt.done||!metricsAllowed()||attempt.expires<Date.now())return;
    if(stage>attempt.stage){const target=stage;const before=attempt.stage;attempt.stage=stage;this.persist();this.queue=this.queue.then(async()=>{if(!attempt.token)return;for(let i=before+1;i<=target;i++)await post('game/progress',{token:attempt.token,stage:i});}).catch(()=>undefined);}
    if(complete){attempt.done=true;this.persist();this.queue=this.queue.then(async()=>{if(!attempt.token)return;for(let i=0;i<3;i++){try{await post('game/complete',{token:attempt.token});return;}catch{await new Promise(r=>setTimeout(r,1500));}}}).catch(()=>undefined);}
  }
  private persist(){try{if(this.attempt)sessionStorage.setItem('fed3:game-measurement',JSON.stringify(this.attempt));}catch{}}
}
