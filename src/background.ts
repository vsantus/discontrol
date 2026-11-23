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
    if (platform === "Micup") {
      // Embed the Micup icon so the injected panel needs no external requests.
      icon.discord = '<img class="discordLogo" alt="" src="data:image/jpeg;base64,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"/>';
    }
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
