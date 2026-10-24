const d=document.documentElement,p=u=>/\/projects\//.test(u),c=d.classList
addEventListener('pageswap',e=>{const u=e.activation?.entry?.url;u&&!p(u)&&!p(location.href)&&c.add('ch')})
addEventListener('pagereveal',e=>{const f=navigation.activation?.from?.url,t=e.viewTransition;f&&t&&!p(f)&&!p(location.href)&&(c.add('ch'),t.finished.finally(()=>c.remove('ch')))})
addEventListener('pageshow',e=>e.persisted&&c.remove('ch'))
