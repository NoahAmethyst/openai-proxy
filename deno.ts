import { serve } from "https://deno.land/std@0.181.0/http/server.ts";

const OPENAI_API_HOST = "api.openai.com";

serve(async (request) => {
    const url = new URL(request.url);

    if (url.pathname === "/") {
        return fetch(new URL("./Readme.md", import.meta.url));
    }

    url.host = OPENAI_API_HOST;
    var resp;
    try{
        resp= await fetch(url, request);
    } catch(e){
        console.error("Unable to make fetch request:", e.message);
        return e;
    }
    return resp;

});
