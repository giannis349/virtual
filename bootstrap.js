/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#bootstrap
 */
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
const { executionAsyncResource } = require('async_hooks');
const moveFile = require('move-file');
module.exports = async () => {
  process.nextTick(() =>{
    console.log('starting socketio on strapi', strapi.server);
    var io;
    if (strapi.server) {
      initio()
    } else {
      loop()
    }
    function loop() {
      if (strapi.server) {
        console.log('foundit', strapi.server)
        initio()
      } else {
        setTimeout(() => {
          console.log('loop')
          loop()
        }, 200);
      }
    }
    function initio () {
      io = require('socket.io')(strapi.server, {
        path: "/socket.io",
        cors: {
          origin: ["https://neweditor.schoovr.com", "http://localhost:8080", "http://localhost:8081", "http://192.168.1.6:8080", "http://192.168.1.6:1337", "http://192.168.1.6:8080/#/"],
          methods: ["GET", "POST"]
        },
        serveClient: false,
        // below are engine.IO options
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false
      });
      const SocketIOFile = require('socket.io-file');
      io.on('connection', function(socket){
        console.log('Socket connected.');
        var uploader = new SocketIOFile(socket, {
          // uploadDir: {     // multiple directories
          //  music: 'data/music',
          //  document: 'data/document'
          // },
          uploadDir: {      // multiple directories
            data: './protected/data',
            document: './protected/presentations',
            media: './protected/media',
            panos: './protected/panos',
            models: './protected/models'
          },
          accepts: ['audio/mpeg', 'audio/mp3', 'model/gltf+json', 'application/octet-stream', 'model/gltf-binary', 'model/mtl', 'model/obj', 'video/mp4', 'video/*', 'audio/mpeg-3', 'application/pdf', 'application/docx', 'image/png', 'image/jpeg', 'video/*', 'video/mp4', 'video/avi', 'video/mpeg', '.pdf', '.xls', '.xlsx', '.ppt', '.pptx', '.doc', '.docx', '.pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint', 'application/pdf', 'application/pptx', 'application/ppt', '.pdf', '.ppt', '.pptx', '.gltf'],   // chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
          maxFileSize: 419430400,             // 4 MB. default is undefined(no limit)
          chunkSize: 102400,              // default is 10240(1KB)
          transmissionDelay: 0,           // delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
          overwrite: false              // overwrite file if exists, default is true.
        });
        uploader.on('start', (fileInfo) => {
          console.log('Start uploading');
          console.log(fileInfo);
        });
        uploader.on('stream', (fileInfo) => {
          console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
        });
        uploader.on('complete', (fileInfo) => {
          console.log('Upload Complete.');
          console.log(fileInfo);
          if (fileInfo.uploadDir.indexOf('/panos/') > -1) {
            executekrpano(fileInfo, socket)
          } else if (fileInfo.uploadDir.indexOf('/models/') > -1) {
            executemodelmover(fileInfo, socket)
          }
        });
        uploader.on('error', (err) => {
          console.log('Error!', err);
        });
        uploader.on('abort', (fileInfo) => {
          console.log('Aborted: ', fileInfo);
        });
      })
      async function executemodelmover (test, socket) {
        await moveFile('/home/theodore/cdn-strapi/' + test.uploadDir, '/home/theodore/cdn-strapi/public/models/' + test.data.where + '/' + test.name);
        console.log('The model has been moved');
        io.to(socket.id).emit('modeluploaded', 'models/'+ test.data.where + '/' + test.name)
      }
      function executekrpano (test, socket) {
        const comm = "/home/theodore/cdn-strapi/krpano/krpanotools makepano -config=templates/multires.config -tilepath=/home/theodore/cdn-strapi/public/tiles/%BASENAME%/%BASENAME%.tiles/[c/]l%Al/%Av/l%Al[_c]_%Av_%Ah.jpg -previewpath=/home/theodore/cdn-strapi/public/tiles/%BASENAME%/%BASENAME%.tiles/preview.jpg -customimage[mobile].path=/home/theodore/cdn-strapi/public/tiles/%BASENAME%/%BASENAME%.tiles/mobile_%s.jpg -xmlpath=/home/theodore/cdn-strapi/public/tiles/%BASENAME%/pano.xml -htmlpath=/home/theodore/cdn-strapi/public/tiles/%BASENAME%/index.html /home/theodore/cdn-strapi/" + test.uploadDir
        exec(comm, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          console.log(`stdout: ${stdout}`);
          io.to(socket.id).emit('stdout', test)
      });
      }
    }
  });
};
