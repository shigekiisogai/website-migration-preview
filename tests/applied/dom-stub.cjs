/* Minimal DOM test double, not a browser or HTML conformance implementation.
 * Used only to run app event wiring offline. Layout/CSP/rendering are untested. */
class Element {
  constructor(tag='root',attrs={}) {
    this.tagName=tag;this.attrs=attrs;this.children=[];this.dataset={};this.listeners={};this.hidden=false;this.disabled=false;
    this.value=attrs.value||'';
    for(const [k,v] of Object.entries(attrs)) if(k.startsWith('data-')) this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;
  }
  setAttribute(name,value){this.attrs[name]=String(value);}
  getAttribute(name){return this.attrs[name];}
  addEventListener(event,fn){(this.listeners[event]??=[]).push(fn);}
  fire(event){if(event==='click'&&this.disabled)return;const e={target:this};this['on'+event]?.(e);for(const fn of this.listeners[event]||[])fn(e);}
  set textContent(text){this.children=[];this._text=String(text);this._html=String(text);}
  get textContent(){return this._text||this._html?.replace(/<[^>]*>/g,'')||'';}
  set innerHTML(html){this._text='';this._html=html;this.children=parse(html);}
  get innerHTML(){return this._html||'';}
  querySelectorAll(selector){
    const found=[];
    function visit(node){for(const child of node.children){let match=false;
      if(selector.startsWith('#')) match=child.attrs.id===selector.slice(1);
      else if(selector.startsWith('.')) match=(child.attrs.class||'').split(/\s+/).includes(selector.slice(1));
      else if(selector.startsWith('[')) match=selector.slice(1,-1) in child.attrs;
      else match=child.tagName===selector;
      if(match)found.push(child);visit(child);
    }}visit(this);return found;
  }
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
function parse(html){
  const root=new Element(),stack=[root],voidTags=new Set(['input','meta','link','br','hr','img','source']);
  for(const token of html.matchAll(/<\/?([a-z][\w-]*)\b([^>]*)>/gi)) {
    const [raw,tag,rest]=token;if(raw.startsWith('</')){for(let i=stack.length-1;i>0;i--)if(stack[i].tagName===tag){stack.length=i;break;}continue;}
    const attrs={};for(const a of rest.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))attrs[a[1]]=a[2]??a[3]??a[4]??'';
    const element=new Element(tag,attrs);stack.at(-1).children.push(element);
    if(!voidTags.has(tag)&&!raw.endsWith('/>'))stack.push(element);
  }
  return root.children;
}
module.exports={Element};
