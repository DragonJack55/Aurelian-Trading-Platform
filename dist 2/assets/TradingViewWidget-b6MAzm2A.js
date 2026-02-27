import{j as i,r as a,u as b}from"./index-DmkRDwGP.js";const f=({width:e="100%",height:t=20,variant:o="rectangular",borderRadius:s,style:u={}})=>{const d=(()=>{switch(o){case"text":return{borderRadius:"4px",height:"1em",width:e};case"circular":return{borderRadius:"50%",width:t,height:t};case"chart":return{borderRadius:"12px",background:"linear-gradient(90deg, var(--bg-light) 0%, var(--bg-white) 50%, var(--bg-light) 100%)",backgroundSize:"200% 100%",position:"relative",overflow:"hidden"};case"rectangular":default:return{borderRadius:s||"8px"}}})();return i.jsxs("div",{style:{width:typeof e=="number"?`${e}px`:e,height:`${t}px`,background:o==="chart"?d.background:"linear-gradient(90deg, var(--bg-light) 0%, #e0e0e0 50%, var(--bg-light) 100%)",backgroundSize:"200% 100%",animation:"skeleton-pulse 1.5s ease-in-out infinite",...d,...u},children:[o==="chart"&&i.jsx("div",{style:{position:"absolute",bottom:"20px",left:"20px",right:"20px",height:"60%",display:"flex",alignItems:"flex-end",gap:"8px"},children:[30,50,40,60,35,55,45,65].map((c,l)=>i.jsx("div",{style:{flex:1,height:`${c}%`,background:"rgba(255, 215, 0, 0.1)",borderRadius:"4px 4px 0 0",animation:`skeleton-bar ${1.5+l*.1}s ease-in-out infinite`}},l))}),i.jsx("style",{children:`
                    @keyframes skeleton-pulse {
                        0% {
                            background-position: 200% 0;
                        }
                        100% {
                            background-position: -200% 0;
                        }
                    }
                    
                    @keyframes skeleton-bar {
                        0%, 100% {
                            opacity: 0.3;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }
                `})]})};function w({symbol:e="OANDA:XAUUSD",interval:t="1h",theme:o}){const s=a.useRef(),{theme:u}=b(),n=o||u||"dark",[d,c]=a.useState(!0),[l,h]=a.useState(e),[g,p]=a.useState(n),[m,x]=a.useState(t),v=r=>({"5m":"5","15m":"15","30m":"30","1h":"60","4h":"240","8h":"480","1d":"D","1w":"W"})[r]||"60";return(e!==l||n!==g||t!==m)&&(h(e),p(n),x(t),c(!0)),a.useEffect(()=>{s.current&&(s.current.innerHTML="");const r=document.createElement("script");r.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js",r.type="text/javascript",r.async=!0,r.innerHTML=`
        {
          "autosize": true,
          "symbol": "${e}",
          "interval": "${v(t)}",
          "timezone": "Etc/UTC",
          "theme": "${n}",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_top_toolbar": true,
          "hide_legend": true,
          "save_image": false,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`,r.onload=()=>{setTimeout(()=>{c(!1)},1500)},s.current.appendChild(r)},[e,n,t]),i.jsxs("div",{className:"tradingview-widget-container",style:{height:"100%",width:"100%",position:"relative"},children:[d&&i.jsx("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:10},children:i.jsx(f,{width:"100%",height:400,variant:"chart"})}),i.jsx("div",{className:"tradingview-widget-container__widget",style:{height:"100%",width:"100%",opacity:d?0:1,transition:"opacity 0.3s"},children:i.jsx("div",{ref:s,style:{height:"100%",width:"100%"}})})]})}const j=a.memo(w);export{j as default};
