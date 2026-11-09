const fs=require('node:fs'),path=require('node:path');
module.exports=name=>{
 const module={exports:{}};
 new Function('module',fs.readFileSync(path.join(__dirname,'../../public/teaching/applied-micro/assets',name),'utf8'))(module);
 return module.exports;
};
