import { createHmac,timingSafeEqual } from 'node:crypto';
export type Ticket={id:string;kind:'game'|'form';exp:number;version?:number;issued:number};
export function signTicket(value:Ticket,secret:string){const payload=Buffer.from(JSON.stringify(value)).toString('base64url');return `${payload}.${createHmac('sha256',secret).update(`fed3-engagement:${payload}`).digest('base64url')}`;}
export function verifyTicket(token:string,kind:Ticket['kind'],secret:string,now=Date.now()):Ticket{
  const [payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length)throw new Error('invalid_ticket');
  const expected=createHmac('sha256',secret).update(`fed3-engagement:${payload}`).digest();const found=Buffer.from(signature,'base64url');
  if(found.length!==expected.length||!timingSafeEqual(found,expected))throw new Error('invalid_ticket');
  const value=JSON.parse(Buffer.from(payload,'base64url').toString()) as Ticket;
  if(value.kind!==kind||!Number.isFinite(value.exp)||value.exp<now||value.issued>now||value.exp-value.issued>86400000||!/^\w{8}-\w{4}-4\w{3}-[89ab]\w{3}-\w{12}$/.test(value.id))throw new Error('expired_ticket');
  return value;
}
