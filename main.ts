import {serve} from "https://deno.land/std@0.181.0/http/server.ts";

serve(async (request) => {
    const url = new URL(request.url);

    if (url.pathname === "/") {
        return new Response(await Deno.readTextFile("./Readme.md"), {
            headers: {
                "content-type": "text/plain;charset=UTF-8",
            },
        });
    }

    console.log("request headers:", request.headers)
    const headers = new Headers(request.headers)
    console.log("get headers:", headers)
    const remote = headers.get("remote")
    if (remote !== null && remote.length > 0) {
        console.log("get url remote host:%s", remote)
        url.host = remote
    } else {
        let errorObj = {error: "no remote specified"};
        let errorJSON = JSON.stringify(errorObj);
        return new Response(errorJSON, {
            headers: {
                "content-type": "application/json"
            }
        });
    }


    return await fetch(url, request);
});
