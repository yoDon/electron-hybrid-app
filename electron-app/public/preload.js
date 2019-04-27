//
// Note: the WebView preload attribute only accepts file: protocols
//       and only accepts js files so this file needs to be pure
//       browser-readable javascript
//
// SECURITY NOTE The preload script is part of the electron app so it has 
// access to the node.js and electron APIs. The remote web app should not 
// have access to Electron or the ipcRenderer except as explicitly allowed
// by the electron copy of this file (so the following line is allowed
// as web pages can't provide their own malicious copy of this file)
//
const { ipcRenderer } = require("electron");

(function() {
    //
    // SECURITY WARNING here we do work to prevent exposing any functionality
    // or APIs that could compromise the user's computer. WebViews hold
    // potentially untrusted pages that potentially render untrusted content.
    // It's critical to limit the Electron main functionality the WebView can
    // access. Only allow specific ipc routes to be registered and called that
    // start with "w2m-" (a shorthand way of saying webview->main). This helps 
    // the app and the developer easily tell whether a message came from the 
    // webview as opposed to from the backend or renderer. The electron renderer
    // should similarly never register or expose any routes starting with "w2m-"
    // (all "w2m-" routes should be handled by main and if main chooses to relay
    // them to the renderer then main should do so over a different channel.
    // Messages sent the other direction should be on "m2w-" channels (eg. webview
    // sends w2m-foo to main and main replys to webview via m2w-bar). This
    // separation of routes is important but it's still even more important to
    // be careful what Electron main process functionality can accessed via those
    // routes and minimize core Electron capabilities exposed to the loaded web
    // page to prevent malicious pages or maliciously injected web content from
    // taking control of the user's PC. 
    //
    // It is possible to add an additional sendToHost() method that uses the
    // ipc.sendToHost() to send from the webView directly to the renderer.
    //
    window.ipcRendererStub = {
        on: (ipc, handler) => {
            if ((ipc.indexOf("m2w-") === 0)) {
                //
                // NOTE: ipcRenderer.on can potentiall register
                //       for messages from either main or the
                //       renderer. Require the "m2w-" prefix to make
                //       sure the WebView can only receive messages
                //       intended for it
                //
                ipcRenderer.on(ipc, handler);
            }
        },
        send: (ipc, arg) => {
            if ((ipc.indexOf("w2m-") === 0)) {
                //
                // NOTE: ipcRenderer.send sends to the main
                //       process. ipcRenderer.sendToHost sends 
                //       to the containing renderer process
                //
                ipcRenderer.send(ipc,arg);
            }
        }
    };
})();
