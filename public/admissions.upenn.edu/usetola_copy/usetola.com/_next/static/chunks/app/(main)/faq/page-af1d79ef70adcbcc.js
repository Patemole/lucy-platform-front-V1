(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2461],{4020:function(e,t,n){Promise.resolve().then(n.bind(n,2060)),Promise.resolve().then(n.bind(n,8758)),Promise.resolve().then(n.bind(n,2571)),Promise.resolve().then(n.bind(n,5573)),Promise.resolve().then(n.bind(n,7458))},8762:function(e,t,n){"use strict";n.d(t,{p:function(){return i}});var s=n(2265),r=n(1762),a=n(1577);function i(e){let t=(0,s.useRef)(0),{isStatic:n}=(0,s.useContext)(r._);(0,s.useEffect)(()=>{if(n)return;let s=({timestamp:n,delta:s})=>{t.current||(t.current=n),e(n-t.current,s)};return a.Wi.update(s,!0),()=>(0,a.Pn)(s)},[e])}},7935:function(e,t,n){"use strict";n.d(t,{c:function(){return l}});var s=n(2265),r=n(5758),a=n(1762),i=n(1721);function l(e){let t=(0,i.h)(()=>(0,r.BX)(e)),{isStatic:n}=(0,s.useContext)(a._);if(n){let[,n]=(0,s.useState)(e);(0,s.useEffect)(()=>t.on("change",n),[])}return t}},2060:function(e,t,n){"use strict";n.d(t,{BackedBlock:function(){return m}});var s=n(7437),r=n(7935),a=n(8762),i=n(5795),l=n(2265);let c=[{id:1,centerX:47,centerY:45,width:33,height:33,color:"#635BFF20"},{id:2,centerX:20,centerY:75,width:25,height:25,color:"#00D63220"},{id:3,centerX:75,centerY:80,width:25,height:25,color:"#00402220"},{id:4,centerX:80,centerY:45,width:20,height:20,color:"#186AFE20"},{id:5,centerX:20,centerY:20,width:20,height:20,color:"#FFFFFF20"},{id:6,centerX:65,centerY:15,width:20,height:20,color:"#FFB3C720"}],o=[{id:1,containerId:1,size:144,color:"#635BFF",image:"/images/brands/stripe.png"},{id:2,containerId:2,size:112,color:"#00D632",image:"/images/brands/cashapp.png"},{id:3,containerId:3,size:96,color:"#004022",image:"/images/brands/robinhood.png"},{id:4,containerId:4,size:64,color:"#186AFE",image:"/images/brands/checkout.png"},{id:5,containerId:5,size:64,color:"#ffffff",image:"/images/brands/paypal.png"},{id:6,containerId:6,size:64,color:"#FFB3C7",image:"/images/brands/klarna.png"}],d=e=>{let{size:t,color:n,image:c,containerWidth:o,containerHeight:d}=e,u=(0,r.c)(o/2),h=(0,r.c)(d/2),f=(0,r.c)(5*Math.random()+10),x=(0,r.c)(5*Math.random()+10),p=(0,l.useRef)({x:Math.random()-.5,y:Math.random()-.5}),m=e=>-(0*e);return(0,a.p)(()=>{let e=u.get()+.01*f.get(),n=h.get()+.01*x.get();(e<0||e>o-t)&&(p.current.x*=-1,f.set(m(f.get()))),(n<0||n>d-t)&&(p.current.y*=-1,x.set(m(x.get())));let s={x:.75*p.current.x,y:.75*p.current.y};u.set(Math.max(0,Math.min(o-t,e))),h.set(Math.max(0,Math.min(d-t,n)));let r=Math.max(-15,Math.min(15,f.get()+s.x)),a=Math.max(-15,Math.min(15,x.get()+s.y)),i=Math.sqrt(r*r+a*a);if(i<10){let e=10/i;f.set(r*e),x.set(a*e)}else f.set(r),x.set(a)}),(0,s.jsx)(i.E.div,{className:"absolute overflow-hidden shadow-lg",style:{width:"".concat(t,"px"),height:"".concat(t,"px"),backgroundColor:n,borderRadius:"".concat(t/4,"px"),x:u,y:h,transform:"translate(".concat(-t/2,"px, ").concat(-t/2,"px)")},children:(0,s.jsx)("img",{src:c,alt:"",className:"h-full w-full object-contain p-2"})})},u=e=>{let{centerX:t,centerY:n,width:r,height:a,color:i,children:l}=e;return(0,s.jsx)("div",{className:"absolute",style:{width:"".concat(r,"%"),height:"".concat(a,"%"),left:"".concat(t,"%"),top:"".concat(n,"%"),transform:"translate(-50%, -50%)",backgroundColor:"transparent"},children:l})};var h=()=>{let e=(0,l.useRef)(null),[t,n]=(0,l.useState)(600);return(0,l.useEffect)(()=>{let t=()=>{if(e.current){let{width:t}=e.current.getBoundingClientRect();n(t)}};return t(),window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]),(0,s.jsx)("div",{className:"flex h-full w-full items-center justify-center",children:(0,s.jsx)("div",{ref:e,className:"relative aspect-square w-full max-w-[640px]",children:c.map(e=>(0,s.jsx)(u,{...e,children:o.filter(t=>t.containerId===e.id).map(n=>(0,s.jsx)(d,{...n,containerWidth:e.width/100*t,containerHeight:e.height/100*t},n.id))},e.id))})})},f=n(7842),x=n(5573),p=n(1128);function m(){return(0,s.jsx)(x.AnimateIn,{className:"grid w-full",variants:"fadeInAndUp",children:(0,s.jsxs)(f.rj,{layout:"spacious",className:"justify-self-center",children:[(0,s.jsx)(f.sg,{layout:"split",className:"aspect-square h-full w-full justify-center bg-surface-muted lg:col-span-5",spacing:"none",children:(0,s.jsx)("div",{className:"h-full w-full",children:(0,s.jsx)(h,{})})}),(0,s.jsx)(f.sg,{layout:"split",className:"py-6 md:py-8",children:(0,s.jsx)(f.Uc,{children:(0,s.jsxs)(p.s0,{children:["Tola is backed by investors and creators behind the world's leading technology brands."," "]})})})]})})}},8758:function(e,t,n){"use strict";n.d(t,{TryForFreeBlock:function(){return u}});var s=n(7437),r=n(9733),a=n(7842),i=n(6534),l=n(5573),c=n(1128),o=n(5795),d=n(2265);function u(){let e=(0,d.useRef)(null),[t,n]=(0,d.useState)(0);return(0,s.jsxs)(l.AnimateIn,{className:"grid w-full",variants:"fadeInAndUp",children:[(0,s.jsx)(a.rj,{id:"try-for-free",layout:"spacious",className:"justify-self-center",children:(0,s.jsx)(a.sg,{layout:"split",children:(0,s.jsx)(c.Dx,{className:"text-foreground",children:"Try Tola today"})})}),(0,s.jsx)("div",{className:"grid w-full",children:(0,s.jsx)("div",{className:"grid-bleed justify-self-center pb-4",ref:e,onMouseMove:t=>{if(!e.current)return;if(t.target instanceof HTMLButtonElement){n(0);return}let s=e.current.offsetHeight;n(Math.max(-45,Math.min(45,t.clientY/s*90-45)))},children:(0,s.jsx)("div",{className:"col-span-full flex aspect-video items-center justify-center bg-surface-inverse portrait:aspect-[3/4]",children:(0,s.jsx)(r.z,{asChild:!0,size:"lg",className:"!text-title scale-75 gap-6 px-10 py-14 sm:scale-100 [&_.icon]:size-16",children:(0,s.jsxs)("a",{href:"https://app.tolahq.com/get-started",target:"_blank",children:["Get started",(0,s.jsx)(o.E.div,{animate:{rotate:t},transition:{type:"easeOut",duration:.1},className:"pointer-events-none",children:(0,s.jsx)(i.ol,{})})]})})})})})]})}},7842:function(e,t,n){"use strict";n.d(t,{Uc:function(){return u},rj:function(){return c},sg:function(){return d}});var s=n(7437),r=n(9840),a=n(3350),i=n(500);let l=(0,r.jS)({base:"grid-bleed",variants:{layout:{spacious:"pt-10 pb-6 md:pt-[12.5rem] md:pb-8"}}});function c(e){let{className:t,children:n,asChild:r,layout:i,...c}=e,o=r?a.g7:"div";return(0,s.jsx)(o,{className:l({layout:i,className:t}),...c,children:n})}let o=(0,r.jS)({base:"gap-6 px-3 lg:gap-8 lg:px-4",variants:{layout:{split:"col-span-full lg:col-span-6",full:"col-span-full lg:col-span-full",center:"col-span-full justify-center lg:col-span-6 lg:col-start-6"},spacing:{none:"px-0 lg:px-0"}}});function d(e){let{children:t,className:n,layout:r,spacing:a,...l}=e;return(0,s.jsx)(i.gC,{className:o({layout:r,spacing:a,className:n}),...l,children:t})}function u(e){let{children:t,className:n,...a}=e;return(0,s.jsx)(i.gC,{className:(0,r.cx)("max-w-prose md:max-w-4xl md:gap-4",n),gap:"4",...a,children:t})}},2571:function(e,t,n){"use strict";n.d(t,{Mdx:function(){return o}});var s=n(7437),r=n(4151),a=n(7138),i=n(9840),l=n(1128);let c={wrapper:e=>{let{children:t,components:n,...r}=e;return(0,s.jsx)("div",{className:(0,i.cx)("flex flex-col gap-4"),...r,children:t})},h2:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)(l.gR,{className:(0,i.cx)(t),asChild:!0,...r,children:(0,s.jsx)("h2",{children:n})})},h3:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)(l.gR,{className:(0,i.cx)(t),asChild:!0,...r,children:(0,s.jsx)("h3",{children:n})})},p:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)(l.gR,{className:(0,i.cx)("max-w-prose text-pretty",t),asChild:!0,...r,children:(0,s.jsx)("p",{children:n})})},ul:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)("ul",{className:(0,i.cx)("flex list-inside list-disc flex-col gap-1 md:list-outside",t),...r,children:n})},li:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)(l.gR,{className:(0,i.cx)(t),asChild:!0,...r,children:(0,s.jsx)("li",{children:n})})},a:e=>{let{className:t,href:n,children:r,...c}=e,o=(null==n?void 0:n.startsWith("http"))?"a":a.default;return(0,s.jsx)(l.gR,{className:(0,i.cx)("rounded-sm text-foreground underline decoration-1 underline-offset-2 outline-none focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",t),asChild:!0,...c,children:(0,s.jsx)(o,{href:n,children:r})})},strong:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)("strong",{...r,className:(0,i.cx)("font-medium",t),children:n})},table:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)("table",{className:(0,i.cx)("w-full caption-bottom text-sm",t),...r,children:n})},tr:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)("tr",{className:(0,i.cx)("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",t),...r,children:n})},td:e=>{let{className:t,children:n,...r}=e;return(0,s.jsx)("td",{className:(0,i.cx)("p-2 align-top [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",t),...r,children:n})}};function o(e){let{code:t,components:n={}}=e,a=(0,r.z)(t);return(0,s.jsx)(a,{components:{...c,...n}})}},5573:function(e,t,n){"use strict";n.r(t),n.d(t,{AnimateIn:function(){return i}});var s=n(7437),r=n(8326);let a={fadeInAndUp:{hidden:{opacity:0,y:48},visible:{opacity:1,y:0,transition:{duration:.6}}}};function i(e){let{children:t,className:n,variants:i="fadeInAndUp",...l}=e;return(0,s.jsx)(r.m.div,{variants:a[i],initial:"hidden",whileInView:"visible",viewport:{once:!0},className:n,...l,children:t})}},7458:function(e,t,n){"use strict";n.d(t,{Question:function(){return u},QuestionList:function(){return d},QuestionPrompt:function(){return h},QuestionResponse:function(){return f}});var s=n(7437),r=n(6534),a=n(500),i=n(1128),l=n(9840),c=n(1274),o=n(2265);let d=(0,o.forwardRef)((e,t)=>{let{children:n,className:r,...i}=e;return(0,s.jsx)(c.fC,{type:"single",className:(0,l.cx)("",r),...i,asChild:!0,children:(0,s.jsx)(a.Kq,{direction:"vertical",children:n})})});d.displayName="QuestionList";let u=(0,o.forwardRef)((e,t)=>{let{className:n,...r}=e;return(0,s.jsx)(c.ck,{ref:t,className:(0,l.cx)("",n),...r})});u.displayName="Question";let h=(0,o.forwardRef)((e,t)=>{let{className:n,children:a,...o}=e;return(0,s.jsx)(c.h4,{className:"flex",asChild:!0,children:(0,s.jsx)("div",{children:(0,s.jsxs)(c.xz,{ref:t,className:(0,l.cx)("grid flex-1 grid-cols-[1fr_min-content] justify-start gap-3 py-5 text-start outline-none transition-all",n),...o,children:[(0,s.jsx)(i.s0,{children:a}),(0,s.jsxs)("div",{className:"relative size-6 shrink-0",children:[(0,s.jsx)(r.v3,{className:"absolute inset-0 size-6 transition-opacity [[data-state=closed]_&]:opacity-100 [[data-state=open]_&]:opacity-0"}),(0,s.jsx)(r.WF,{className:"absolute inset-0 size-6 transition-opacity [[data-state=closed]_&]:opacity-0 [[data-state=open]_&]:opacity-100"})]})]})})})});h.displayName=c.xz.displayName;let f=(0,o.forwardRef)((e,t)=>{let{className:n,html:r,children:a,...i}=e;return(0,s.jsxs)(c.VY,{ref:t,className:(0,l.cx)("ml-[-2rem] overflow-hidden pr-10 pl-8 text-foreground-secondary transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",n),...i,children:[r&&(0,s.jsx)("div",{className:"prose pt-0 pb-6",dangerouslySetInnerHTML:{__html:r}}),!r&&(0,s.jsx)("div",{className:"pt-0 pb-6",children:a})]})});f.displayName=c.VY.displayName}},function(e){e.O(0,[5476,231,5795,9396,8807,8991,2971,7023,1744],function(){return e(e.s=4020)}),_N_E=e.O()}]);