import { registerClientReference } from "react-server-dom-webpack/server";

export const ClientCounter = registerClientReference(
    function() {
        throw new Error("Counter should not be called on the server");
    },
    "./src/client/ClientCounter.tsx",
    'default'
)