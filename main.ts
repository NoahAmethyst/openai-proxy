import {serve} from "https://deno.land/std@0.181.0/http/server.ts";
import { acceptWebSocket, isWebSocketCloseEvent } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

serve(async (request) => {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
        const { conn, r: bufReader, w: bufWriter, headers } = request;
        try {
            const ws = await acceptWebSocket({
                conn,
                bufReader,
                bufWriter,
                headers,
            });

            // Forward WebSocket messages to remote server
            const remote = headers.get("remote");
            if (remote !== null && remote.length > 0) {
                const remoteWS = new WebSocket(remote);
                remoteWS.onmessage = (event) => {
                    ws.send(event.data);
                };
                ws.onmessage = (event) => {
                    remoteWS.send(event.data);
                };
                remoteWS.onclose = (event) => {
                    if (!isWebSocketCloseEvent(event)) {
                        console.error("Remote WebSocket closed with unexpected error", event);
                    }
                    ws.close();
                };
                ws.onclose = (event) => {
                    if (!isWebSocketCloseEvent(event)) {
                        console.error("Local WebSocket closed with unexpected error", event);
                    }
                    remoteWS.close();
                };
            } else {
                const errorObj = { error: "no remote specified" };
                const errorJSON = JSON.stringify(errorObj);
                ws.send(errorJSON);
                ws.close();
            }
        } catch (err) {
            console.error(`Failed to accept WebSocket: ${err}`);
        }
    } else if (url.pathname === "/") {
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
