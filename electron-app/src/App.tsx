import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";
import fetch from "isomorphic-fetch";
import React, { useMemo, useState } from "react";
import "./App.css";

// We want nodeEnv to contain either "production" or "development"
// "development" means running in a local server with files loaded from project not from asar
const nodeEnv = (process.env.NODE_ENV === undefined) ? "production" : process.env.NODE_ENV; // tslint:disable-line

//
// NOTE: the WebView tag only accepts the file: protocol for the preload script
//             so the preload.js file must be included in the app as a resource
//
const preloadScript = ((window as any).isInElectronRenderer === false)
                                        ? ""
                                        : (nodeEnv === "development")
                                        ? `file://${(window as any).nodeRequire("electron").remote.app.getAppPath() + "/public/preload.js"}`
                                        : `file://${(window as any).nodeRequire("electron").remote.app.getAppPath() + "/public/preload.js"}`;

// const electronWebViewSrc = "http://localhost:3000/";
const electronWebViewSrc = "https://yodon.github.io/electron-hybrid-app/";

const ipcRenderer = (window as any).isInElectronRenderer
        ? (window as any).nodeRequire("electron").ipcRenderer
        : (window as any).ipcRendererStub;

const App = () => {
    const [mathResult, setMathResult] = useState("");
    const [apiPort, setApiPort] = useState(0);
    const [apiSigningKey, setApiSigningKey] = useState("");

    const appGlobalClient = useMemo(() => {
        if (apiPort === 0) {
            if (ipcRenderer) {
                ipcRenderer.on("apiDetails", ({}, argString:string) => {
                    const arg:{ port:number, signingKey:string } = JSON.parse(argString);
                    setApiPort(arg.port); // setting apiPort causes useMemo'd appGlobalClient to be re-evaluated
                    setApiSigningKey(arg.signingKey);
                });
                ipcRenderer.send("getApiDetails");
            }
            return null;
        }
        return new ApolloClient({
            cache: new InMemoryCache(),
            link: new HttpLink({
                fetch:(fetch as any),
                uri: "http://127.0.0.1:" + apiPort + "/graphql/",
            }),
        });
    }, [apiPort]);

    const handleKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const math = event.currentTarget.value;
            if (appGlobalClient === null) {
                setMathResult("this page only works when hosted in electron");
                return;
            }
            appGlobalClient.query({
                query:gql`query calc($signingkey:String!, $math:String!) {
                    calc(signingkey:$signingkey, math:$math)
                }`,
                variables: {
                    math,
                    signingkey: apiSigningKey,
                },
            })
            .then(({ data }) => {
                setMathResult(data.calc);
            })
            .catch((e) => {
                console.log("Error contacting graphql server");
                console.log(e);
                setMathResult("Error getting result with port=" + apiPort + " and signingkey='" + apiSigningKey + "' (if this is the first call, the server may need a few seconds to initialize)");
            });
        }
    };

    return (
        <div>
            <webview
                src={electronWebViewSrc}
                preload={preloadScript}
                style={{ height:"500px" }}
            />
            <p>
                You can also access the resources locally below
            </p>
            <input
                style={{ color:"black" }}
                onKeyDown={handleKeyDown}
            />
            <div>
                {mathResult}
            </div>
        </div>
    );
};

export default App;
