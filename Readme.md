# Electron + GraphQL + Hybrid Web App

This sample shows how to use GraphQL as the interprocess channel in an Electron app that loads an external web page into a webview and empowers it with Electron derived backend superpowers. The sample allows your web page to detect whether it is hosted in Electron or a conventional browser and if it's in Electron it can then use a GraphQL API to communicate with the Electron main process and ask Electron to do things on its behalf. 

The stock IPC communications channels are still there under the hood and are used to do the handshaking to set up an authenticated GraphQL connection, but if you're building the rest of your system on GraphQL based APIs the goal is to not have to maintain yet another antiquated string-based API structure for communications within Electron. The Electron main (backend) process spawns an express GraphQL webserver and provides a randomly generated authentication token to both the webserver and the Electron renderer (frontend) process for use in authenticating messages sent between the frontend and the webserver. 

The webserver currently exposes a GraphQL endpoint for the frontend to interact with but the backend is just a plain old express server so you can tweak it to host whatever sort of REST or similar web services as might be needed by your application. The React frontend part of the sample is similarly based on a stock create-react-app site, so it should be easy to customize as needed. The only significant embelishments to the stock cra app are (1) the bare minimal amount of https://github.com/sharegate/craco to support hooking into electron without needing to eject the create react app and (2) typescript support, which you don't have to use but I personally can't imagine building a serious javascript project without it so it's there if you need it.

This example builds a stand-alone Electron application that loads an external web page and uses GraphQL for interprocess communication rather than IPC. On Windows it builds the app into `./dist/win-unpacked/My Electron App.exe` and the optional installer into `./dist/My Electron App Setup 1.0.0.exe` (OSX and Linux destinations are similar). You can change the name of the application by changing the `name` property in `package.json`.

# Step 1 - Running the electron app

```bash
cd electron-app

npm install

# Depending on the packages you install, with Electron projects you may need to do 
# an npm rebuild to rebuild any included binaries for the current OS. It's probably
# not needed here but I do it out of habit because its fast and the issues can be
# a pain to track down if they come up and you dont realize a rebuild is needed
npm rebuild

# run a dev build of electron - by default this will load a demo page that is
# hosted at https://yodon.github.io/electron-hybrid-app/ (you can change what
# page is loaded by editing src/app.tsx and you can change the contents of
# the hosted page by using the next section to modify and run or publish the
# companion react web app project)
npm run start

# Build the electron app into a subdirectory of dist/, then run electron-packager to 
# package the electron app as a platform-specific installer in dist/
npm run build

# double-click to run the either the platform-specific app that is built into 
# a subdirectory of dist/ or the platform-specific installer that is built and 
# placed in the dist/ folder
```


# Step 2 - Modifying the react web app

```bash
cd web-app

npm install

# run a dev build of electron - by default this will load a demo page that is
# hosted at https://yodon.github.io/electron-hybrid-app/ (you can change what
# page is loaded by editing src/app.tsx and you can change the contents of
# the hosted page by using the next section to modify and run or publish the
# companion react web app project)
#
# IMPORTANT you will need to modify electron-app/src/App.tsx to load
# http://localhost:3001/ instead of https://yodon.github.io/electron-hybrid-app/
# (this web-app sample defaults to hosting on port 3001 to avoid conflict
# with other npm projects like electron-app that might be running on port 3000
# you can change the port it runs on by editing web-app/project.json)
#
npm run start

# Build the web app into build/ for publishing somewhere like S3, your 
# webserver, or a CDN
npm run build
```

# Debugging the GraphQL server

To test the GraphQL server, cd into `electron-app`, run `npm run start`, then browse to `http://127.0.0.1:5000/graphiql/` to access a GraphiQL view of the server. For a more detailed example, try `http://127.0.0.1:5000/graphiql/?query={calc(math:"1/2",signingkey:"devkey")}` which works great if you copy and paste into the browser but which is a complex enough URL that it will confuse chrome if you try to click directly on it.
