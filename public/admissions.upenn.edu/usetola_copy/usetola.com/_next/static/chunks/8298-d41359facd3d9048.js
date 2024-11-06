"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8298],{3523:function(e,r,t){t.d(r,{I:function(){return a}});var s=t(6405);function a(e,r,t){var a;if("string"==typeof e){let n=document;r&&((0,s.k)(!!r.current,"Scope provided, but no element detected."),n=r.current),t?(null!==(a=t[e])&&void 0!==a||(t[e]=n.querySelectorAll(e)),e=t[e]):e=n.querySelectorAll(e)}else e instanceof Element&&(e=[e]);return Array.from(e||[])}},7943:function(e,r,t){t.d(r,{Y:function(){return l}});var s=t(2265),a=t(3523);let n={some:0,all:1};function l(e,{root:r,margin:t,amount:l,once:c=!1}={}){let[o,i]=(0,s.useState)(!1);return(0,s.useEffect)(()=>{if(!e.current||c&&o)return;let s={root:r&&r.current||void 0,margin:t,amount:l};return function(e,r,{root:t,margin:s,amount:l="some"}={}){let c=(0,a.I)(e),o=new WeakMap,i=new IntersectionObserver(e=>{e.forEach(e=>{let t=o.get(e.target);if(!!t!==e.isIntersecting){if(e.isIntersecting){let t=r(e);"function"==typeof t?o.set(e.target,t):i.unobserve(e.target)}else t&&(t(e),o.delete(e.target))}})},{root:t,rootMargin:s,threshold:"number"==typeof l?l:n[l]});return c.forEach(e=>i.observe(e)),()=>i.disconnect()}(e.current,()=>(i(!0),c?void 0:()=>i(!1)),s)},[r,e,t,c]),o}},1973:function(e,r,t){t.d(r,{FeatureCallouts:function(){return d}});var s=t(7437),a=t(7842),n=t(5573),l=t(1128),c=t(9840),o=t(7943),i=t(6648),u=t(2265);function d(e){let{items:r}=e;return(0,s.jsx)(s.Fragment,{children:r.map((e,r)=>(0,s.jsx)(p,{index:r,...e},r))})}function f(e){let{children:r,position:t="center",aspect:a="square"}=e;return(0,s.jsx)(n.AnimateIn,{className:(0,c.cx)("absolute inset-0"),variants:"fadeInAndUp",children:(0,s.jsx)("div",{className:(0,c.cx)("-translate-x-1/2 absolute left-1/2 grid place-items-center","landscape"===a&&"h-full w-[70%] portrait:w-[90%]","square"===a&&"aspect-square h-3/4","top"===t&&" portrait:-translate-y-1/2 top-[9%] portrait:top-1/2","bottom"===t&&" bottom-[9%] portrait:bottom-1/2 portrait:translate-y-1/2","center"===t&&" -translate-y-1/2 top-1/2"),children:r})})}function m(e){let{src:r,className:t,position:a,aspect:n}=e,l=(0,u.useRef)(null),c=(0,o.Y)(l,{once:!1});return(0,u.useEffect)(()=>{l.current&&(c?l.current.play():l.current.pause())},[c]),(0,s.jsx)("div",{className:"absolute inset-0",children:(0,s.jsx)(f,{position:a,aspect:n,children:(0,s.jsx)("video",{ref:l,className:t,src:r,muted:!0,loop:!0,playsInline:!0})})})}function p(e){let{imageSrc:r,position:t,aspect:o,title:u,description:d,videoSrc:p,index:h=0}=e;return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.AnimateIn,{className:"grid w-full",variants:"fadeInAndUp",children:(0,s.jsx)(a.rj,{layout:"spacious",className:"justify-self-center",children:(0,s.jsx)(a.sg,{layout:"split",className:(0,c.cx)("pt-6 md:pt-8",h%2==1&&"lg:col-start-7"),children:(0,s.jsxs)("header",{children:[u&&(0,s.jsx)(l.s0,{children:u}),d&&(0,s.jsx)(l.s0,{className:"text-foreground-secondary",children:d})]})})})}),(0,s.jsx)(n.AnimateIn,{className:"grid w-full",variants:"fadeInAndUp",children:(0,s.jsx)(a.rj,{className:"justify-self-center",children:(0,s.jsxs)(a.sg,{className:"relative col-span-full aspect-[2/1] overflow-hidden bg-[#f3f4f6] portrait:aspect-square",children:[r&&(0,s.jsx)(f,{position:t,aspect:o,children:(0,s.jsx)(i.default,{className:"absolute inset-0 object-contain object-center",fill:!0,src:r,alt:u})}),p&&(0,s.jsx)(m,{src:p,position:t,aspect:o})]})})})]})}},8183:function(e,r,t){t.d(r,{FeatureGallery:function(){return u}});var s=t(7437),a=t(1128),n=t(7842),l=t(9840),c=t(5573),o=t(1529),i=t(7723);function u(e){let{featureItemList:r,title:t="Features",description:l="The best in class tools to manage the requirements of any small business."}=e;return(0,s.jsxs)(c.AnimateIn,{className:"grid w-full",variants:"fadeInAndUp",children:[(t||l)&&(0,s.jsx)(n.rj,{layout:"spacious",className:"justify-self-center",children:(0,s.jsx)(n.sg,{layout:"split",className:"lg:col-start-2",children:(0,s.jsxs)(n.Uc,{children:[t&&(0,s.jsx)(a.Dx,{children:t}),l&&(0,s.jsx)(a.s0,{children:l})]})})}),(0,s.jsx)(i.Carousel,{columnClass:"col-span-7 sm:col-span-4 lg:col-span-4 lg:col-start-2 xl:col-span-3 xl:col-start-2",children:r.map(e=>(0,s.jsx)(i.CarouselItem,{children:(0,s.jsx)(d,{item:e})},e.id))})]})}function d(e){let{item:r}=e;return(0,s.jsxs)("div",{className:"relative aspect-3/4 bg-surface-muted",children:[(0,s.jsx)("div",{className:"absolute inset-0 grid place-items-center pb-24",children:(0,s.jsx)(o.B,{name:r.icon||"arrow-down-left",className:"size-12"})}),(0,s.jsxs)("div",{className:(0,l.cx)("absolute bottom-0 p-4"),children:[(0,s.jsx)(a.uT,{children:r.title}),(0,s.jsx)(a.uT,{className:"text-foreground-secondary",children:r.description})]})]})}},1874:function(e,r,t){t.d(r,{TestomonialStack:function(){return p}});var s=t(7437),a=t(9733),n=t(7842),l=t(1128),c=t(5795),o=t(2265),i=t(5573);let u=[{quote:"Tola has been the easiest way to optimize our cashflow. The team is very responsive and hands on! ",logo:"/images/customers/homecourt.svg",role:"CEO of Homecourt",label:"E-commerce",name:"Sarah Jahnke"},{quote:"Tola has been a great tool for us to pay all our vendors and get the cash flow flexibility with just a few easy clicks.",logo:"/images/customers/bimbamboo.svg",role:"COO of Bim Bam Boo",label:"Wholesale",name:"McCay Johnson"},{quote:"Tola has been a great payments partner as we grow our business, providing flexibility and a great experience.",logo:"/images/customers/sunnie_logo.webp",role:"Co-founder of Sunnie",label:"E-commerce",name:"Katy Tucker"},{quote:"Tola really stands out from other solutions as a more modern, fast, flexible solution for AP & AR.",logo:"/images/customers/provencfo.svg",role:"Founder of ProvenCFO",label:"Accountants",name:"Dave Wilson"}],d=(e,r)=>(e%r+r)%r,f=()=>{let[e,r]=(0,o.useState)(!1);return(0,o.useEffect)(()=>{r("ontouchstart"in window||navigator.maxTouchPoints>0)},[]),e},m=e=>{let{cards:r}=e,t=r.length,[n,i]=(0,o.useState)(0),[u,m]=(0,o.useState)(0),[p,h]=(0,o.useState)(0),x=f(),g=(e,r)=>{let s=Math.abs(r.velocity.x)>100||Math.abs(r.offset.x)>200,a=Math.abs(r.velocity.y)>100||Math.abs(r.offset.y)>200;(s||a)&&(i(e=>(e+1)%t),h(r.offset.x)),m(0)},j=(e,r)=>{m(.05*r.offset.x)};return(0,s.jsx)("div",{className:"relative h-full w-full",children:r.map((e,r)=>{let o=d(r-n,t);return(0,s.jsxs)(c.E.div,{initial:!0,animate:{zIndex:o===t-1?[10*t,10*(t-o)]:10*(t-o),scale:1-.05*o,x:o===t-1?[p,-10*o]:-10*o,y:0,rotate:n===r?u:0,backgroundColor:"rgba(255,255,255, ".concat(Math.min(Math.max(1-.25*o,.1),.8),")"),left:16+-12*o},transition:{duration:.5,backgroundColor:{duration:1},rotate:{duration:n===r?.1:.7}},drag:n===r&&(!x||"x"),dragDirectionLock:x,dragSnapToOrigin:!0,onDragEnd:g,onDrag:j,className:"absolute flex h-full w-full cursor-grab flex-col items-start overflow-hidden rounded-3xl bg-surface p-8 backdrop-blur-lg active:cursor-grabbing md:p-12 [&>*]:pointer-events-none",children:[(0,s.jsx)(a.z,{intent:"secondary",disabled:!0,className:"pointer-events-none",children:e.label}),(0,s.jsx)("div",{className:"pointer-events-none flex w-full flex-1 items-center justify-center",children:(0,s.jsx)("img",{className:"w-full",src:e.logo,alt:e.name,height:240,width:1056})}),(0,s.jsxs)("div",{className:"flex flex-col gap-5",children:[(0,s.jsxs)(l.s0,{children:["“",e.quote,"”"]}),(0,s.jsxs)("div",{children:[(0,s.jsx)(l.uT,{children:e.name}),(0,s.jsx)(l.uT,{className:"text-foreground-secondary",children:e.role})]})]})]},e.name)})})};function p(e){let{list:r,title:t="From our customers"}=e;return(0,s.jsxs)(i.AnimateIn,{className:"grid w-full",variants:"fadeInAndUp",children:[(0,s.jsx)(n.rj,{layout:"spacious",className:"justify-self-center",children:(0,s.jsx)(n.sg,{layout:"split",children:(0,s.jsx)(l.Dx,{children:t})})}),(0,s.jsxs)(n.rj,{className:"grid-rows-1 justify-self-center lg:h-[90vh] portrait:aspect-3/4",children:[(0,s.jsx)("div",{className:"col-span-full row-span-full bg-surface-muted"}),(0,s.jsx)("div",{className:"relative col-span-full row-span-full aspect-[3/4] max-h-[calc(90vh-4rem)] w-full select-none self-center p-8 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4 xl:col-span-4 xl:col-start-5 xl:p-0 2xl:col-span-4 2xl:col-start-5",children:(0,s.jsx)(m,{cards:r||u})})]})]})}},1529:function(e,r,t){t.d(r,{B:function(){return n}});var s=t(7437),a=t(6534);function n(e){let{name:r,...t}=e,n=function(e){switch(e){case"annotated-dots":return a.Ip;case"arrow-down-left":return a.l2;case"arrow-right":return a.ol;case"arrow-up-right":return a.Gu;case"arrows-two-way":return a.ft;case"bank":return a.Br;case"brush":return a.BD;case"bell-ring":return a.QH;case"calendar-plus":return a.j8;case"check-circle":return a.fU;case"chevron-down":return a._M;case"clipboard-check":return a.wc;case"crowd":return a.Bb;case"dollar":return a.B_;case"flag":return a.WN;case"envelope":return a.wr;case"face-sad":return a.Zx;case"face-smile":return a.BE;case"file-scan":return a.Ae;case"fingerprint":return a.IG;case"folder":return a.gt;case"key":return a.sr;case"keyhole":return a.ui;case"menu":return a.v2;case"minus":return a.WF;case"plus":return a.v3;case"cube-cross":return a.pl;case"puzzle":return a.rr;case"safe":return a.Wf;case"shield-tick":return a.Ld;case"trending-up":return a.kl;case"question-mark":return a.Zc;case"file-plus":return a.id;case"credit-card":return a.aB;case"face-smile-circle":return a.uJ;case"switch":return a.rs;case"painting":return a.aL;case"pay":return a.$S;case"get-paid":return a.TF;case"pay-later":return a.W$;case"pulse":case"cash-flow":return a.GM;case"get-paid-early":return a.An;case"accounting-integrations":return a.kg;case"window":return a.Rz;case"graph-bars":return a.uq;case"graph-arrow":return a.sp;case"paper-plane":return a.c5;case"gpu-chip":return a.OI;case"return-arrow":return a.Rc;case"users":return a.Q;case"hand-plus":return a.kn;case"paper-document":return a.lR}}(r);return(0,s.jsx)(n,{...t})}}}]);