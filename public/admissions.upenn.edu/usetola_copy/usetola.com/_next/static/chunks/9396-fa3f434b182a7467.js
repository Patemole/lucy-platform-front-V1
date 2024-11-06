"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9396],{2120:function(e,n,t){t.d(n,{M:function(){return r}});function r(e,n,{checkForDefaultPrevented:t=!0}={}){return function(r){if(null==e||e(r),!1===t||!r.defaultPrevented)return null==n?void 0:n(r)}}},2610:function(e,n,t){t.d(n,{B:function(){return i}});var r=t(2265),u=t(8970),o=t(5206),l=t(3350);function i(e){let n=e+"CollectionProvider",[t,i]=(0,u.b)(n),[c,a]=t(n,{collectionRef:{current:null},itemMap:new Map}),f=e+"CollectionSlot",d=r.forwardRef((e,n)=>{let{scope:t,children:u}=e,i=a(f,t),c=(0,o.e)(n,i.collectionRef);return r.createElement(l.g7,{ref:c},u)}),s=e+"CollectionItemSlot",m="data-radix-collection-item";return[{Provider:e=>{let{scope:n,children:t}=e,u=r.useRef(null),o=r.useRef(new Map).current;return r.createElement(c,{scope:n,itemMap:o,collectionRef:u},t)},Slot:d,ItemSlot:r.forwardRef((e,n)=>{let{scope:t,children:u,...i}=e,c=r.useRef(null),f=(0,o.e)(n,c),d=a(s,t);return r.useEffect(()=>(d.itemMap.set(c,{ref:c,...i}),()=>void d.itemMap.delete(c))),r.createElement(l.g7,{[m]:"",ref:f},u)})},function(n){let t=a(e+"CollectionConsumer",n);return r.useCallback(()=>{let e=t.collectionRef.current;if(!e)return[];let n=Array.from(e.querySelectorAll(`[${m}]`));return Array.from(t.itemMap.values()).sort((e,t)=>n.indexOf(e.ref.current)-n.indexOf(t.ref.current))},[t.collectionRef,t.itemMap])},i]}},8970:function(e,n,t){t.d(n,{b:function(){return u}});var r=t(2265);function u(e,n=[]){let t=[],u=()=>{let n=t.map(e=>(0,r.createContext)(e));return function(t){let u=(null==t?void 0:t[e])||n;return(0,r.useMemo)(()=>({[`__scope${e}`]:{...t,[e]:u}}),[t,u])}};return u.scopeName=e,[function(n,u){let o=(0,r.createContext)(u),l=t.length;function i(n){let{scope:t,children:u,...i}=n,c=(null==t?void 0:t[e][l])||o,a=(0,r.useMemo)(()=>i,Object.values(i));return(0,r.createElement)(c.Provider,{value:a},u)}return t=[...t,u],i.displayName=n+"Provider",[i,function(t,i){let c=(null==i?void 0:i[e][l])||o,a=(0,r.useContext)(c);if(a)return a;if(void 0!==u)return u;throw Error(`\`${t}\` must be used within \`${n}\``)}]},function(...e){let n=e[0];if(1===e.length)return n;let t=()=>{let t=e.map(e=>({useScope:e(),scopeName:e.scopeName}));return function(e){let u=t.reduce((n,{useScope:t,scopeName:r})=>{let u=t(e)[`__scope${r}`];return{...n,...u}},{});return(0,r.useMemo)(()=>({[`__scope${n.scopeName}`]:u}),[u])}};return t.scopeName=n.scopeName,t}(u,...n)]}},2844:function(e,n,t){t.d(n,{gm:function(){return o}});var r=t(2265);let u=(0,r.createContext)(void 0);function o(e){let n=(0,r.useContext)(u);return e||n||"ltr"}},8405:function(e,n,t){t.d(n,{M:function(){return c}});var r,u=t(2265),o=t(8727);let l=(r||(r=t.t(u,2)))["useId".toString()]||(()=>void 0),i=0;function c(e){let[n,t]=u.useState(l());return(0,o.b)(()=>{e||t(e=>null!=e?e:String(i++))},[e]),e||(n?`radix-${n}`:"")}},4048:function(e,n,t){t.d(n,{z:function(){return i}});var r=t(2265),u=t(4887),o=t(5206),l=t(8727);let i=e=>{let{present:n,children:t}=e,i=function(e){var n,t;let[o,i]=(0,r.useState)(),a=(0,r.useRef)({}),f=(0,r.useRef)(e),d=(0,r.useRef)("none"),[s,m]=(n=e?"mounted":"unmounted",t={mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}},(0,r.useReducer)((e,n)=>{let r=t[e][n];return null!=r?r:e},n));return(0,r.useEffect)(()=>{let e=c(a.current);d.current="mounted"===s?e:"none"},[s]),(0,l.b)(()=>{let n=a.current,t=f.current;if(t!==e){let r=d.current,u=c(n);e?m("MOUNT"):"none"===u||(null==n?void 0:n.display)==="none"?m("UNMOUNT"):t&&r!==u?m("ANIMATION_OUT"):m("UNMOUNT"),f.current=e}},[e,m]),(0,l.b)(()=>{if(o){let e=e=>{let n=c(a.current).includes(e.animationName);e.target===o&&n&&(0,u.flushSync)(()=>m("ANIMATION_END"))},n=e=>{e.target===o&&(d.current=c(a.current))};return o.addEventListener("animationstart",n),o.addEventListener("animationcancel",e),o.addEventListener("animationend",e),()=>{o.removeEventListener("animationstart",n),o.removeEventListener("animationcancel",e),o.removeEventListener("animationend",e)}}m("ANIMATION_END")},[o,m]),{isPresent:["mounted","unmountSuspended"].includes(s),ref:(0,r.useCallback)(e=>{e&&(a.current=getComputedStyle(e)),i(e)},[])}}(n),a="function"==typeof t?t({present:i.isPresent}):r.Children.only(t),f=(0,o.e)(i.ref,a.ref);return"function"==typeof t||i.isPresent?(0,r.cloneElement)(a,{ref:f}):null};function c(e){return(null==e?void 0:e.animationName)||"none"}i.displayName="Presence"},8712:function(e,n,t){t.d(n,{WV:function(){return i},jH:function(){return c}});var r=t(6091),u=t(2265),o=t(4887),l=t(3350);let i=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,n)=>{let t=(0,u.forwardRef)((e,t)=>{let{asChild:o,...i}=e,c=o?l.g7:n;return(0,u.useEffect)(()=>{window[Symbol.for("radix-ui")]=!0},[]),(0,u.createElement)(c,(0,r.Z)({},i,{ref:t}))});return t.displayName=`Primitive.${n}`,{...e,[n]:t}},{});function c(e,n){e&&(0,o.flushSync)(()=>e.dispatchEvent(n))}},8312:function(e,n,t){t.d(n,{W:function(){return u}});var r=t(2265);function u(e){let n=(0,r.useRef)(e);return(0,r.useEffect)(()=>{n.current=e}),(0,r.useMemo)(()=>(...e)=>{var t;return null===(t=n.current)||void 0===t?void 0:t.call(n,...e)},[])}},9e3:function(e,n,t){t.d(n,{T:function(){return o}});var r=t(2265),u=t(8312);function o({prop:e,defaultProp:n,onChange:t=()=>{}}){let[o,l]=function({defaultProp:e,onChange:n}){let t=(0,r.useState)(e),[o]=t,l=(0,r.useRef)(o),i=(0,u.W)(n);return(0,r.useEffect)(()=>{l.current!==o&&(i(o),l.current=o)},[o,l,i]),t}({defaultProp:n,onChange:t}),i=void 0!==e,c=i?e:o,a=(0,u.W)(t);return[c,(0,r.useCallback)(n=>{if(i){let t="function"==typeof n?n(e):n;t!==e&&a(t)}else l(n)},[i,e,l,a])]}},8727:function(e,n,t){t.d(n,{b:function(){return u}});var r=t(2265);let u=(null==globalThis?void 0:globalThis.document)?r.useLayoutEffect:()=>{}},7138:function(e,n,t){t.d(n,{default:function(){return u.a}});var r=t(231),u=t.n(r)}}]);