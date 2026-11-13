// Discontrol v0.6.2 — by devsantos
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
      .status{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:#bec4cf;min-height:14px;min-width:0}
      .channel{display:block;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f2f3f5;font-size:11px;font-weight:600;text-align:left}
      .connection{display:flex;align-items:center;gap:6px;flex:none;white-space:nowrap;font-size:10px}
      .dot{width:8px;height:8px;border-radius:100%;background:#858b97}.dot.connected{background:#35c77d}.dot.partial{background:#e7a536}
      .controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      button{border:1px solid #363a48;background:#252934;color:#eef0f4;border-radius:12px;min-width:0;height:48px;padding:0;display:grid;place-items:center;cursor:pointer}
      button:hover:not(:disabled){filter:brightness(1.15)}button:focus-visible{outline:2px solid #8a96ff;outline-offset:2px}
      button:disabled{opacity:.3;cursor:not-allowed}button svg{width:22px;height:22px} button .discordLogo{width:27px;height:27px;object-fit:contain;display:block}
      button.discord{background:#343d80;border-color:#4f5ed0}button.muted{background:#38252c;border-color:#7e3b4a;color:#ff8799}
      button.unmuted{background:#1d3530;border-color:#346f58;color:#91e7ba}button.disconnect{background:#522229;border-color:#9b3947;color:#ffd5db}
    `;doc.head.append(css);
    const icon={
      discord:'<img class="discordLogo" alt="" src="data:image/png;base64,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"/>',
      mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8"/></svg>',
      micOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20M9 9v2a3 3 0 0 0 5.1 2.1M15 9V5a3 3 0 0 0-5.8-1.1"/><path d="M5 10a7 7 0 0 0 12 4.9M19 10a7 7 0 0 1-.5 2.5M12 19v3M8 22h8"/></svg>',
      headphones:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h4v7H6a2 2 0 0 1-2-2v-5ZM20 14h-4v7h2a2 2 0 0 0 2-2v-5Z"/></svg>',
      headphonesOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h4v7H6a2 2 0 0 1-2-2v-5ZM20 14h-4v7h2a2 2 0 0 0 2-2v-5Z"/><path d="M3 3 21 21" stroke="#38252c" stroke-width="5"/><path d="M3 3 21 21" stroke="currentColor" stroke-width="2"/></svg>',
      hangup:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3.3 11.5c4.8-4.6 12.6-4.6 17.4 0 1 .9 1 2.2.1 3l-1.8 1.6c-.7.6-1.7.6-2.4 0l-1.5-1.4a1.7 1.7 0 0 1-.5-1.4l.1-1.4a10 10 0 0 0-5.4 0l.1 1.4a1.7 1.7 0 0 1-.5 1.4l-1.5 1.4c-.7.6-1.7.6-2.4 0l-1.8-1.6c-.9-.8-.9-2.1.1-3Z"/></svg>'
    };
    const main=doc.createElement("main"), status=doc.createElement("div"), dot=doc.createElement("span"), label=doc.createElement("span"), controls=doc.createElement("div");
    status.className="status";dot.className="dot";
    const channelLabel=doc.createElement("span");channelLabel.className="channel";channelLabel.textContent="Identificando canal…";
    const connection=doc.createElement("span");connection.className="connection";connection.append(dot,label);
    status.append(channelLabel,connection);controls.className="controls";
    const make=(name:string,svg:string)=>{const b=doc.createElement("button");b.type="button";b.className=name;b.innerHTML=svg;return b;};
    const discord=make("discord",icon.discord),mic=make("mic",icon.mic),audio=make("audio",icon.headphones),disconnect=make("disconnect",icon.hangup);
    controls.append(discord,mic,audio,disconnect);main.append(status,controls);doc.body.replaceChildren(main);
    const normalize=(s:string)=>s.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
    const visible=(e:Element):e is HTMLElement=>e instanceof HTMLElement && getComputedStyle(e).display!=="none" && getComputedStyle(e).visibility!=="hidden" && e.getClientRects().length>0 && e.getAttribute("aria-hidden")!=="true";
    const enabled=(e:HTMLElement)=>e.getAttribute("aria-disabled")!=="true" && !(e instanceof HTMLButtonElement && e.disabled);
    const muteState=(e:HTMLElement)=>e.getAttribute("role")==="switch"?(e.getAttribute("aria-checked")==="true"?true:e.getAttribute("aria-checked")==="false"?false:null):null;
    const getName=(e:HTMLElement)=>normalize([e.getAttribute("aria-label"),e.getAttribute("title"),e.getAttribute("data-tooltip"),e.getAttribute("data-tooltip-content")].filter(Boolean).join(" "));

    // Read only the active voice connection area, not arbitrary channels in the sidebar.
    function getActiveVoiceChannel():string|null{
      const statuses=new Set(["voz conectada","voice connected","conectado a voz","connected to voice"]);
      const ignore=/^(?:voz conectada|voice connected|conectado a voz|connected to voice|conectar|desconectar|disconnect|connection info|informacoes da conexao)$/;
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      let n:Node|null;
      while((n=walker.nextNode())){
        if(!statuses.has(normalize(n.textContent||"")))continue;
        const title=n.parentElement;
        if(!title||!visible(title))continue;
        let group:HTMLElement|null=title;
        for(let depth=0;depth<5&&group;depth++,group=group.parentElement){
          if((group.textContent||"").trim().length>170)break;
          const leaves=[...group.querySelectorAll<HTMLElement>("span, div, button, a, strong")]
            .filter(e=>visible(e)&&!e.children.length)
            .map(e=>e.textContent?.trim()||"")
            .filter(value=>value.length>0&&value.length<=80&&!ignore.test(normalize(value)));
          const names=[...new Set(leaves)];
          if(names.length)return names[0];
        }
      }
      return null;
    }
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
      label.textContent=connected?"Conectado":(m||a?"Parcial":"Desconectado");
      const channel=connected?getActiveVoiceChannel():null;
      channelLabel.textContent=connected?(channel||"Canal indisponível"):"Nenhum canal";
      channelLabel.title=connected?(channel||"Canal de voz não identificado"):"Nenhum canal conectado";
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
