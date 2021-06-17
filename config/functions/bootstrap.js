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
 const pkg = require('getmac').default
 let students = []
// const moveFile = require('move-file');
 module.exports = async () => {
   process.nextTick(() =>{
    test()
     console.log('starting socketio on strapi', strapi.server);
     console.log(pkg());
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
       io.on('connection', function(socket){
         students.push(socket.id)
         for (let index = 0; index < students.length; index++) {
          const student = students[index];
          io.to(student).emit('custom', students)
        }
         console.log('Socket connected.');
         io.to(socket.id).emit('custom', students)
         socket.on('disconnect', () => {
          console.log('disconected', socket.id)
          const ind = students.findIndex(x => x === socket.id)
          students.splice(ind, 1)
          for (let index = 0; index < students.length; index++) {
            const student = students[index];
            io.to(student).emit('custom', students)
          }
        })
        socket.on('newimage', (image) => {
          console.log('newimage', image)
          for (let index = 0; index < students.length; index++) {
            const student = students[index];
            io.to(student).emit('newimage', image)
          }
        })
       });
      
       }
       async function test () {
        var tests = await strapi.services.tests.find()
        console.log(tests, 'test')
       }
     })
 };