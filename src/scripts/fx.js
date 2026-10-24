const d=document.documentElement,p=u=>/\/projects\//.test(u),c=d.classList
addEventListener('pageswap',e=>{const u=e.activation?.entry?.url;u&&!p(u)&&!p(location.href)&&c.add('ch')})
addEventListener('pagereveal',e=>{const f=navigation.activation?.from?.url,t=e.viewTransition;f&&t&&!p(f)&&!p(location.href)&&(c.add('ch'),t.finished.finally(()=>c.remove('ch')))})
addEventListener('pageshow',e=>e.persisted&&c.remove('ch'))
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const b=document.createElement('div'),s=[];let x,y,r
b.className='trail';b.setAttribute('aria-hidden','true')
for(let i=0;i<6;i++){const e=document.createElement('i');e.style.opacity=1-i*.15;s.push({e,x:0,y:0});b.append(e)}
document.body.append(b)
const f=()=>{let a=x,t=y,m=0;s.forEach((q,i)=>{const k=.5-i*.05,dx=a-q.x,dy=t-q.y;q.x+=dx*k;q.y+=dy*k;m=Math.max(m,Math.abs(dx),Math.abs(dy));q.e.style.transform=`translate(${q.x}px,${q.y}px)`;a=q.x;t=q.y});r=m>.4?requestAnimationFrame(f):0;r||(b.style.opacity=0)}
addEventListener('pointermove',e=>{if(x==null)s.forEach(q=>{q.x=e.clientX;q.y=e.clientY});x=e.clientX;y=e.clientY;b.style.opacity=1;r||(r=requestAnimationFrame(f))},{passive:true})
d.addEventListener('mouseleave',()=>b.style.opacity=0)}
