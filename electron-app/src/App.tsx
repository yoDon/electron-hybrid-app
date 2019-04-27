import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import Electron from "electron"; // tslint:disable-line
import gql from "graphql-tag";
import fetch from "isomorphic-fetch";
import React, { Component } from "react";
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

// const electronWebViewSrc = "http://localhost:3001/";
const electronWebViewSrc = "https://yodon.github.io/electron-hybrid-app/";

const ipcRenderer = (window as any).isInElectronRenderer
        ? (window as any).nodeRequire("electron").ipcRenderer
        : (window as any).ipcRendererStub;

interface IOwnProps {} // tslint:disable-line

class App extends Component<IOwnProps> {

    public resultDiv:HTMLDivElement | null = null;

    private apiPort = 5000;
    private apiSigningKey = "";

    private appGlobalClient = null as unknown as ApolloClient<NormalizedCacheObject>;

    constructor(props:IOwnProps) {
        super(props);
        if (ipcRenderer) {
            //
            // Use the stock Electron IPC channel to request info on the
            // GraphQL communication channel
            //
            ipcRenderer.on("apiDetails", ({}, argString:string) => {
                //
                // Record the received apiDetails so the renderer process can
                // call the main process via GraphQl
                //
                const arg:{ port:number, signingKey:string } = JSON.parse(argString);
                this.apiPort = arg.port;
                this.apiSigningKey = arg.signingKey;
                this.appGlobalClient = new ApolloClient({
                    cache: new InMemoryCache(),
                    link: new HttpLink({
                        fetch:(fetch as any),
                        uri: "http://127.0.0.1:" + this.apiPort + "/graphql/",
                    }),
                });
                //
                // Forward the apiDetails to the WebView when requested over IPC
                //
                ipcRenderer.on("w2r-getApiDetails", (event:Electron.Event) => {
                    event.sender.send("r2w-apiDetails", argString);
                });
            });
            ipcRenderer.send("getApiDetails");
        }
    }

    public render() {
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
                    onKeyDown={this.handleKeyDown}
                />
                <div ref={(elem) => this.resultDiv = elem}/>
            </div>
        );
    }

    private handleKeyDown = (event:React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const math = event.currentTarget.value;
            if (ipcRenderer === null || ipcRenderer === undefined || this.appGlobalClient === null) { // tslint:disable-line
                this.resultDiv!.textContent = "this page only works when hosted in electron";
                return;
            }
            this.appGlobalClient.query({
                query:gql`query calc($signingkey:String!, $math:String!) {
                    calc(signingkey:$signingkey, math:$math)
                }`,
                variables: {
                    math,
                    signingkey: this.apiSigningKey,
                },
            })
                .then(({ data }) => {
                    this.resultDiv!.textContent = data.calc;
                })
                .catch((e) => {
                    console.log("Error contacting graphql server");
                    console.log(e);
                    this.resultDiv!.textContent = "Error getting result with port=" + this.apiPort + " and signingkey='" + this.apiSigningKey + "'";
                });
        }
    }
}

export default App;
