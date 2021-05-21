import {Context, send,Middleware} from "./deps.ts"
//'https://deno.land/x/oak/mod.ts'

export const staticFileMiddleware:Middleware = async (ctx: Context, next )=> { 
  // console.log("relativepath : ",ctx.request.url.pathname)
  const pp = String(ctx.request.url.pathname)
  const lst = pp.split("/") 
  if(lst.length < 3){
    console.log("lst.length < 3")
    await next()
  }
  if(lst.length >2 && lst[1] != "public"){
    // console.log("lst.length >2 && lst[1] != public")
    await next()
  }
  //console.log({lst})
  const path = `${Deno.cwd()}/${ctx.request.url.pathname}`; 
  //console.log({path})
  
  if (lst.length > 2 && await fileExists(path)) {
    console.log(path, " file exist") 
    await send(ctx,ctx.request.url.pathname, {root: `${Deno.cwd()}`} ) //p[1],  ,index: "index.html"
    //,,extensions:["css","js","html"],index:"index.html",
  } else { 
    await next();
  }
}


async function fileExists(path: string) {
  // console.log("fileExists")
  // console.log( {path})
  try {
    const stats = await Deno.lstat(path);  
    return  stats.isFile;
  } catch(e) { 
    // console.log("==============file erors===============")
    // console.log({e})
    if (e && e instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw e;
    }
  }
}