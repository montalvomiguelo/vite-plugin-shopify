const c=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function r(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=r(e);fetch(e.href,t)}};c();const a=""+new URL("vite.4a748afd.svg",import.meta.url).href,u=""+new URL("shopify.ab6ef553.svg",import.meta.url).href;function d(i){let o=0;const r=n=>{o=n,i.innerHTML=`count is ${o}`};i.addEventListener("click",()=>r(++o)),r(0)}const l=document.createElement("div");l.className="app";l.innerHTML=`
  <a href="https://vitejs.dev" target="_blank">
    <img src="${a}" class="logo" alt="Vite logo" />
  </a>
  <a href="https://shopify.dev/themes" target="_blank">
    <img src="${u}" class="logo vanilla" alt="Shopify logo" />
  </a>
  <h1>Hello Vite!</h1>
  <div class="card">
    <button id="counter" type="button"></button>
  </div>
  <p class="read-the-docs">
    Click on the Vite logo to learn more
  </p>
`;document.body.appendChild(l);d(document.querySelector("#counter"));
//# sourceMappingURL=theme.1c247acc.js.map
