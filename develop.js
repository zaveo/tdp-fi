const liveServer = require("live-server");
const chokidar = require('chokidar');
const build = require('./build')

const params = {
    port: 8000, // Set the server port. Defaults to 8080.
    host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "./public", // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    file: "404.html", // When set, serve this file for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    mount: [['/components', './node_modules']], // Mount a directory to a route.
    logLevel: 2 // 0 = errors only, 1 = some, 2 = lot
};

let building = build();

building.then(function(){
  liveServer.start(params);
})


// Initialize watcher.
var watcher = chokidar.watch('src', {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

// Add event listeners.
watcher.on('change', function(){
  build();
})
