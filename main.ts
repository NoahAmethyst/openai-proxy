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

    const remote = request.headers["remote"] as string | undefined

    if (remote) {
        console.log("get url remote host:%s", remote)
        url.host = remote
    }


    return await fetch(url, request);
});
