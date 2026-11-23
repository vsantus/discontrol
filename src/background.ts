// Discontrol v0.7.0 — teste Micup — by devsantos
// Source of the Chrome extension (Manifest V3).
function openDiscontrol(): void {
  type PipAPI = { window: Window | null; requestWindow(o:{width:number;height:number}):Promise<Window> };
  type VoiceControl = { element:HTMLElement; muted:boolean|null };
  type Action = "mic" | "audio" | "disconnect";
  const platform = location.hostname === "discord.com" ? "Discord" : "Micup";
  const api=(window as Window & { documentPictureInPicture?:PipAPI }).documentPictureInPicture;
  if (!api) { alert("Discontrol requer Chrome 116+."); return; }
  if (api.window && !api.window.closed) { api.window.focus(); return; }
  // Request the window synchronously while the extension click activation is valid.
  const opening=api.requestWindow({width:267,height:100});
  void opening.then(pip=>{
    const doc=pip.document; doc.title=`Discontrol · ${platform}`;
    const css=doc.createElement("style");css.textContent=`
      *{box-sizing:border-box}html,body{margin:0;background:#000;color:#f2f3f5;font:12px system-ui,sans-serif}
      body{padding:12px}main{display:grid;gap:13px}
      .status{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px;color:#bec4cf;min-height:14px;min-width:0}
      .channel{display:block;min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f2f3f5;font-size:11px;font-weight:600;text-align:left}
      .connection{display:flex;align-items:center;gap:6px;flex:none;white-space:nowrap;font-size:10px}
      .dot{width:8px;height:8px;border-radius:100%;background:#858b97}.dot.connected{background:#35c77d}.dot.partial{background:#e7a536}
      .controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      button{border:1px solid #363a48;background:#252934;color:#eef0f4;border-radius:12px;min-width:0;height:48px;padding:0;display:grid;place-items:center;cursor:pointer}
      button:hover:not(:disabled){filter:brightness(1.15)}button:focus-visible{outline:2px solid #8a96ff;outline-offset:2px}
      button:disabled{opacity:.3;cursor:not-allowed}button svg{width:22px;height:22px} button .discordLogo{width:27px;height:27px;object-fit:contain;display:block}
      button.discord{background:#343d80;border-color:#4f5ed0}button.micup .discordLogo{width:40px;height:40px}button.muted{background:#38252c;border-color:#7e3b4a;color:#ff8799}
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
    if (platform === "Micup") {
      // Embed the Micup icon so the injected panel needs no external requests.
      icon.discord = '<img class="discordLogo" alt="" src="data:image/png;base64,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"/>';
    }
    const main=doc.createElement("main"), status=doc.createElement("div"), dot=doc.createElement("span"), label=doc.createElement("span"), controls=doc.createElement("div");
    status.className="status";dot.className="dot";
    const channelLabel=doc.createElement("span");channelLabel.className="channel";channelLabel.textContent="Identificando canal…";
    const connection=doc.createElement("span");connection.className="connection";connection.append(dot,label);
    status.append(channelLabel,connection);controls.className="controls";
    const make=(name:string,svg:string)=>{const b=doc.createElement("button");b.type="button";b.className=name;b.innerHTML=svg;return b;};
    const discord=make("discord",icon.discord),mic=make("mic",icon.mic),audio=make("audio",icon.headphones),disconnect=make("disconnect",icon.hangup);
    if (platform === "Micup") discord.classList.add("micup");
    controls.append(discord,mic,audio,disconnect);main.append(status,controls);doc.body.replaceChildren(main);
    const normalize=(s:string)=>s.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
    const visible=(e:Element):e is HTMLElement=>e instanceof HTMLElement && getComputedStyle(e).display!=="none" && getComputedStyle(e).visibility!=="hidden" && e.getClientRects().length>0 && e.getAttribute("aria-hidden")!=="true";
    const enabled=(e:HTMLElement)=>e.getAttribute("aria-disabled")!=="true" && !(e instanceof HTMLButtonElement && e.disabled);
    const muteState=(e:HTMLElement)=>e.getAttribute("role")==="switch"?(e.getAttribute("aria-checked")==="true"?true:e.getAttribute("aria-checked")==="false"?false:null):null;
    const getName=(e:HTMLElement)=>normalize([e.getAttribute("aria-label"),e.getAttribute("title"),e.getAttribute("data-tooltip"),e.getAttribute("data-tooltip-content")].filter(Boolean).join(" "));

    // Discord's voice connection details contain "Channel / Server" in this
    // labelled, clamped text node. Avoid reading unrelated menu buttons.
    function getActiveVoiceChannel():string|null{
      const selector='div[data-text-variant="body-xs/medium"][class*="lineClamp1"]';
      const candidates=[...document.querySelectorAll<HTMLElement>(selector)]
        .filter(el=>visible(el))
        .map(el=>({el,raw:(el.textContent||"").trim()}))
        .filter(x=>x.raw.length>3 && x.raw.length<=160 && x.raw.includes(" / "));
      if(!candidates.length)return null;

      // When multiple candidates exist, prefer the one in the voice-connected
      // panel. If there is no unique match, do not guess another channel name.
      const connectionWords=["voz conectada","voice connected","connected to voice","conectado a voz"];
      function inVoicePanel(el:HTMLElement):boolean{
        let node:HTMLElement|null=el;
        for(let depth=0;node&&depth<7;depth++,node=node.parentElement){
          const text=normalize(node.textContent||"");
          if(text.length>700)break;
          if(connectionWords.some(word=>text.includes(word)))return true;
        }
        return false;
      }
      const scoped=candidates.filter(x=>inVoicePanel(x.el));
      const matches=scoped.length?scoped:candidates;
      if(matches.length!==1)return null;

      const label=matches[0].raw;
      const separator=label.lastIndexOf(" / ");
      const channel=label.slice(0,separator).trim();
      return channel && !/^(?:detalhes de voz|voice details)$/i.test(channel)?channel:null;
    }
    function findDiscordControl(which:Action):VoiceControl|null{
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
    interface VoiceAdapter {
      find(action: Action): VoiceControl | null;
      getChannel(): string | null;
      isConnected(): boolean;
    }

    // Micup exposes pressed=true for muted controls in the call toolbar.
    // The user-area controls remain available when another channel is selected.
    function findMicupControl(action: Action): VoiceControl | null {
      const selectors = action === "disconnect"
        ? ['[class*="VoiceConnectionStatus.module__"] button[aria-label]',
           '[class*="VoiceControlBar.module__"] button[aria-label]']
        : ['[class*="VoiceControlBar.module__"] button[aria-label]',
           '[class*="UserArea.module__"] button[aria-label]'];
      const labels = {
        mic: {
          mute: /^(silenciar|silenciar microfone|desativar microfone|mute|mute microphone|turn off microphone)$/,
          unmute: /^(reativar microfone|ativar microfone|ligar microfone|unmute|unmute microphone|turn on microphone)$/
        },
        audio: {
          mute: /^(desativar audio|desativar audio para mim|silenciar audio|deafen|disable audio)$/,
          unmute: /^(ativar audio|ativar audio para mim|reativar audio|reativar audio para mim|undeafen|enable audio)$/
        }
      };
      for (const selector of selectors) {
        for (const element of document.querySelectorAll<HTMLElement>(selector)) {
          if (!visible(element) || !enabled(element)) continue;
          const name = normalize(element.getAttribute("aria-label") || "");
          if (action === "disconnect") {
            if (/^(desconectar|disconnect|sair da chamada|leave call)$/.test(name)) {
              return { element, muted: null };
            }
            continue;
          }
          const pattern = labels[action];
          if (!pattern.mute.test(name) && !pattern.unmute.test(name)) continue;
          const pressed = element.getAttribute("aria-pressed");
          return {
            element,
            muted: pressed === "true" ? true : pressed === "false" ? false : pattern.unmute.test(name)
          };
        }
      }
      return null;
    }

    function getMicupChannel(): string | null {
      const element = document.querySelector<HTMLElement>(
        '[data-flx="voice.voice-connection-status.voice-connection-status-inner.channel-source-channel"],'
        + '[class*="VoiceConnectionStatus.module__channelSourceChannel"]'
      );
      return element && visible(element) ? element.textContent?.trim() || null : null;
    }

    const discordAdapter: VoiceAdapter = {
      find: findDiscordControl,
      getChannel: getActiveVoiceChannel,
      isConnected: () => !!findDiscordControl("disconnect")
    };
    const micupAdapter: VoiceAdapter = {
      find: findMicupControl,
      getChannel: getMicupChannel,
      isConnected: () => {
        const status = document.querySelector('[class*="VoiceConnectionStatus.module__statusConnected"]');
        return !!status && visible(status) && !!findMicupControl("disconnect");
      }
    };
    const adapter = platform === "Discord" ? discordAdapter : micupAdapter;
    let disposed=false, timer:number|undefined;
    function refresh(){
      if(disposed||pip.closed)return;
      const m=adapter.find("mic"),a=adapter.find("audio"),connected=adapter.isConnected();
      dot.className="dot"+(connected?" connected":(m||a?" partial":""));
      label.textContent=connected?"Conectado":(m||a?"Parcial":"Desconectado");
      const channel=connected?adapter.getChannel():null;
      channelLabel.textContent=connected?(channel||"Canal indisponível"):"Nenhum canal";
      channelLabel.title=connected?(channel||"Canal de voz não identificado"):"Nenhum canal conectado";
      mic.disabled=!connected||!m;audio.disabled=!connected||!a;disconnect.disabled=!connected;
      for(const [button,item,on,off] of [[mic,m,icon.mic,icon.micOff],[audio,a,icon.headphones,icon.headphonesOff]] as const){
        const muted=item?.muted===true;button.classList.toggle("muted",!!item&&muted);button.classList.toggle("unmuted",!!item&&!muted);
        const svg=muted?off:on;if(button.innerHTML!==svg)button.innerHTML=svg;
        const title=!item?"Indisponível":muted?"Ativar":"Silenciar";button.title=title;button.setAttribute("aria-label",title);
      }
      disconnect.title="Desconectar";disconnect.setAttribute("aria-label","Desconectar");
      discord.title=`Voltar ao ${platform}`;discord.setAttribute("aria-label",`Voltar ao ${platform}`);
    }
    function schedule(){if(timer!==undefined)clearTimeout(timer);timer=window.setTimeout(refresh,120);}
    function trigger(action:Action){const target=adapter.isConnected()?adapter.find(action):null;if(!target){refresh();return;}target.element.click();schedule();setTimeout(refresh,500);}
    discord.addEventListener("click",()=>window.focus());mic.addEventListener("click",()=>trigger("mic"));audio.addEventListener("click",()=>trigger("audio"));disconnect.addEventListener("click",()=>trigger("disconnect"));
    const observer=new MutationObserver(schedule);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-label","aria-checked","aria-pressed","class","title","disabled","aria-disabled","data-tooltip-content"]});
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
  const supportedHost = u.hostname === "discord.com" || u.hostname === "micup.gg";
  const supportedPath = u.pathname === "/app" || u.pathname === "/channels" || u.pathname.startsWith("/channels/");
  if(u.protocol !== "https:" || !supportedHost || !supportedPath)return;
  void chrome.scripting.executeScript({target:{tabId:tab.id},world:"MAIN",func:openDiscontrol}).catch(console.error);
});
