# education-platform Frontend

## Local Development

To Start the dev server for the Angular 9 frontend follow these steps:

```bash
# navigate to project root (containing package.json)
$ cd frontend/education-platform
# globally install angular cli
$ npm install -g @angular/cli

```

Locally install required packages

```bash
$ npm install
```

Start the dev server. Can optionally specify the `--host` with `0.0.0.0` to serve the app on the local network

```bash
$ ng serve --host 0.0.0.0
```
As we're using Angular Universal to enable server-side-rendering, our App must be compatible with this
Always test your changes with: 
```bash
$ npm run dev:ssr
```

Both servers are available @ http://localhost:4200 after starting

## Deployment

To deploy your changes to https://when will the domain push your changes to the `origin/deploy` branch. 
Then shh into the education-platform server at (requires your public key to be added by @eshpilevsky): 
```bash
$ ssh root@d......
# change to web user account
$ su - web
# run the build script to pull origin/deploy branch, compile and reload assets
$ ./build.sh
# changes on origin/deploy are now live
```

## Deployment details

To deploy the app with server-side rendering:
```bash
$ npm run build:ssr
# run server with node:
$ node dist/education-platform/server/main.js
# you can also use something like pm2:
$ pm2 start dist/education-platform/server/main.js
```

After starting the server, it will be available at http://localhost:4000
You can use a reverse-proxy nginx-config to proxy requests to the server securely