// Discontrol v0.6.0 — by devsantos
// Source of the Chrome extension (Manifest V3).
function openDiscontrol(): void {
  type PipAPI = { window: Window | null; requestWindow(o:{width:number;height:number}):Promise<Window> };
  type VoiceControl = { element:HTMLElement; muted:boolean|null };
  type Action = "mic" | "audio" | "disconnect";
  const api=(window as Window & { documentPictureInPicture?:PipAPI }).documentPictureInPicture;
  if (!api) { alert("Discontrol requer Chrome 116+."); return; }
  if (api.window && !api.window.closed) { api.window.focus(); return; }
  // Request the window synchronously while the extension click activation is valid.
  const opening=api.requestWindow({width:322,height:150});
  void opening.then(pip=>{
    const doc=pip.document; doc.title="Discontrol";
    const css=doc.createElement("style");css.textContent=`
      *{box-sizing:border-box}html,body{margin:0;background:#101116;color:#f2f3f5;font:12px system-ui,sans-serif}
      body{padding:10px}main{background:#191b22;border:1px solid #2b2e39;border-radius:14px;padding:12px 13px;display:grid;gap:13px}
      .status{display:flex;align-items:center;justify-content:center;gap:7px;font-size:11px;color:#bec4cf;min-height:14px}
      .dot{width:8px;height:8px;border-radius:100%;background:#858b97}.dot.connected{background:#35c77d}.dot.partial{background:#e7a536}
      .controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      button{border:1px solid #363a48;background:#252934;color:#eef0f4;border-radius:12px;min-width:0;height:48px;padding:0;display:grid;place-items:center;cursor:pointer}
      button:hover:not(:disabled){filter:brightness(1.15)}button:focus-visible{outline:2px solid #8a96ff;outline-offset:2px}
      button:disabled{opacity:.3;cursor:not-allowed}button svg{width:22px;height:22px}
      button.discord{background:#343d80;border-color:#4f5ed0}button.muted{background:#38252c;border-color:#7e3b4a;color:#ff8799}
      button.unmuted{background:#1d3530;border-color:#346f58;color:#91e7ba}button.disconnect{background:#522229;border-color:#9b3947;color:#ffd5db}
    `;doc.head.append(css);
    const icon={
      discord:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.73 4.28c-1.47-.69-3.06-1.19-4.73-1.47-.2.35-.43.81-.58 1.18a18 18 0 0 0-4.84 0c-.16-.37-.38-.83-.59-1.18-1.67.28-3.26.78-4.73 1.47C1.3 8.6.5 12.81.9 16.96a19.26 19.26 0 0 0 5.82 2.94c.47-.64.89-1.33 1.25-2.05-.69-.26-1.35-.58-1.97-.96.16-.12.32-.25.48-.38 3.81 1.79 7.94 1.79 11.7 0 .16.13.32.48.38-.62.38-1.28.7-1.97.96.36.72.78 1.41 1.25 2.05a19.26 19.26 0 0 0 5.82-2.94c.48-4.82-.82-9.02-3.28-12.68ZM8.5 14.4c-1.14 0-2.07-1.04-2.07-2.33 0-1.29.92-2.33 2.07-2.33s2.07 1.04 2.07 2.33-.93 2.33-2.07 2.33Zm5 0c-1.14 0-2.07-1.04-2.07-2.33s.93-2.33 2.07-2.33 2.07 1.04 2.07 2.33-.93 2.33-2.07 2.33Z"/></svg>',
      mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/></svg>',
      micOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20M9 9v2a3 3 0 0 0 5.1 2.1M15 9V5a3 3 0 0 0-5.8-1.1"/><path d="M5 10a7 7 0 0 0 12 4.9M19 10a7 7 0 0 1-.5 2.5M12 19v3M8 22h8"/></svg>',
      headphones:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h4v7H6a2 2 0 0 1-2-2v-5ZM20 14h-4v7h2a2 2 0 0 0 2-2v-5Z"/></svg>',
      headphonesOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h4v7H6a2 2 0 0 1-2-2v-5ZM20 14h-4v7h2a2 2 0 0 0 2-2v-5Z"/><path d="M3 3 21 21" stroke="#38252c" stroke-width="5"/><path d="M3 3 21 21" stroke="currentColor" stroke-width="2"/></svg>',
      hangup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3.3 11.5c4.8-4.6 12.6-4.6 17.4 0 1 .9 1 2.2.1 3l-1.8 1.6c-.7.6-1.7.6-2.4 0l-1.5-1.4a1.7 1.7 0 0 1-.5-1.4l.1-1.4a10 10 0 0 0-5.4 0l.1 1.4a1.7 1.7 0 0 1-.5 1.4l-1.5 1.4c-.7.6-1.7.6-2.4 0l-1.8-1.6c-.9-.8-.9-2.1.1-3Z"/></svg>'
    };
    const main=doc.createElement("main"), status=doc.createElement("div"), dot=doc.createElement("span"), label=doc.createElement("span"), controls=doc.createElement("div");
    status.className="status";dot.className="dot";status.append(dot,label);controls.className="controls";
    const make=(name:string,svg:string)=>{const b=doc.createElement("button");b.type="button";b.className=name;b.innerHTML=svg;return b;};
    const discord=make("discord",icon.discord),mic=make("mic",icon.mic),audio=make("audio",icon.headphones),disconnect=make("disconnect",icon.hangup);
    controls.append(discord,mic,audio,disconnect);main.append(status,controls);doc.body.replaceChildren(main);
    const normalize=(s:string)=>s.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
    const visible=(e:Element):e is HTMLElement=>e instanceof HTMLElement && getComputedStyle(e).display!=="none" && getComputedStyle(e).visibility!=="hidden" && e.getClientRects().length>0 && e.getAttribute("aria-hidden")!=="true";
    const enabled=(e:HTMLElement)=>e.getAttribute("aria-disabled")!=="true" && !(e instanceof HTMLButtonElement && e.disabled);
    const muteState=(e:HTMLElement)=>e.getAttribute("role")==="switch"?(e.getAttribute("aria-checked")==="true"?true:e.getAttribute("aria-checked")==="false"?false:null):null;
    const getName=(e:HTMLElement)=>normalize([e.getAttribute("aria-label"),e.getAttribute("title"),e.getAttribute("data-tooltip"),e.getAttribute("data-tooltip-content")].filter(Boolean).join(" "));
    function find(which:Action):VoiceControl|null{
      for(const e of document.querySelectorAll('button,[role="button"],[role="switch"]')){
        if(!visible(e)||!enabled(e))continue;
        const l=getName(e), isSwitch=e.getAttribute("role")==="switch";
        if(which==="mic"){
          if(!isSwitch)continue;
          const on=/^(silenciar|silenciar microfone|mute|mute microphone|turn off microphone)$/;
          const off=/^(ativar som|ativar microfone|reativar microfone|ligar microfone|unmute|unmute microphone|turn on microphone|desmutar|desativar mudo)$/;
          if(on.test(l)||off.test(l))return {element:e,muted:muteState(e)??off.test(l)};
        }else if(which==="audio"){
          const on=/^(silenciar audio|desativar audio|deafen|disable audio|deafen audio|desativar som)$/;
          const off=/^(ativar audio|reativar audio|ouvir novamente|undeafen|enable audio|desativar surdez|ativar som)$/;
          if(on.test(l)||off.test(l))return {element:e,muted:muteState(e)??off.test(l)};
        }else if(/^(desconectar|disconnect|disconnect from voice|sair da chamada|disconnect call)$/.test(l))return {element:e,muted:null};
      }
      return null;
    }
    let disposed=false, timer:number|undefined;
    function refresh(){
      if(disposed||pip.closed)return;
      const m=find("mic"),a=find("audio"),d=find("disconnect"),connected=!!d;
      dot.className="dot"+(connected?" connected":(m||a?" partial":""));
      label.textContent=connected?"Conectado à voz":(m||a?"Conexão parcial":"Não conectado");
      mic.disabled=!connected||!m;audio.disabled=!connected||!a;disconnect.disabled=!connected;
      for(const [button,item,on,off] of [[mic,m,icon.mic,icon.micOff],[audio,a,icon.headphones,icon.headphonesOff]] as const){
        const muted=item?.muted===true;button.classList.toggle("muted",!!item&&muted);button.classList.toggle("unmuted",!!item&&!muted);
        const svg=muted?off:on;if(button.innerHTML!==svg)button.innerHTML=svg;
        const title=!item?"Indisponível":muted?"Ativar":"Silenciar";button.title=title;button.setAttribute("aria-label",title);
      }
      disconnect.title="Desconectar";disconnect.setAttribute("aria-label","Desconectar");
      discord.title="Voltar ao Discord";discord.setAttribute("aria-label","Voltar ao Discord");
    }
    function schedule(){if(timer!==undefined)clearTimeout(timer);timer=window.setTimeout(refresh,120);}
    function trigger(action:Action){const target=find(action);if(!target){refresh();return;}target.element.click();schedule();setTimeout(refresh,500);}
    discord.addEventListener("click",()=>window.focus());mic.addEventListener("click",()=>trigger("mic"));audio.addEventListener("click",()=>trigger("audio"));disconnect.addEventListener("click",()=>trigger("disconnect"));
    const observer=new MutationObserver(schedule);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-label","aria-checked","title","disabled","aria-disabled","data-tooltip-content"]});
    const poll=window.setInterval(refresh,1200);
    pip.addEventListener("pagehide",()=>{disposed=true;observer.disconnect();clearInterval(poll);if(timer!==undefined)clearTimeout(timer);},{once:true});
    refresh();
  }).catch(e=>{console.error("[Discontrol]",e);alert("Não foi possível abrir o Discontrol.");});
}
declare const chrome:{
  action:{onClicked:{addListener(cb:(tab:{id?:number;url?:string})=>void):void}};
  scripting:{executeScript(a:{target:{tabId:number};world:"MAIN";func:typeof openDiscontrol}):Promise<unknown>};
};
chrome.action.onClicked.addListener(tab=>{
  if(!tab.id||!tab.url)return;
  let u:URL;try{u=new URL(tab.url);}catch{return;}
  if(u.hostname!=="discord.com"||!(u.pathname==="/app"||u.pathname.startsWith("/channels")))return;
  void chrome.scripting.executeScript({target:{tabId:tab.id},world:"MAIN",func:openDiscontrol}).catch(console.error);
});
