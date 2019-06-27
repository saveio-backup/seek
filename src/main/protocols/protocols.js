/* import {
  app,
  protocol
} from 'electron'
import fs from 'fs';
import path from 'path';
protocol.registerSchemesAsPrivileged([{
  scheme: 'seek',
  privileges: {
    standard: true,
    secure: true,
    allowServiceWorkers: true,
    supportFetchAPI: true,
    corsEnabled: true
  }
}]);
// const winURL = process.env.NODE_ENV === 'development' ?
//   `http://localhost:9080/#/navigation` :
//   `file://${__dirname}/index.html#/navigation`
const host = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080/#/` :
  `file://${__dirname}/index.html#/`
// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'development') {
//     protocol.registerHttpProtocol('seek', seekHttpProtocol, err => {
//       if (err) throw new Error('Failed to create protocol: seek. ' + err)
//     });
//   } else {
//     protocol.registerStreamProtocol('seek', seekStreamProtocol, err => {
//       if (err) throw new Error('Failed to create protocol: seek. ' + err)
//     })
//   }
// })
app.on('ready', () => {
  protocol.registerStreamProtocol('seek', seekStreamProtocol, err => {
    if (err) throw new Error('Failed to create protocol: seek. ' + err)
  })
})

function seekHttpProtocol(request, callback) {
  console.log('seekProtocol!!!!');
  console.log(request);
  const url = request.url.replace('seek://', `${host}`);
  console.log('url now is : ', url);
  callback({
    url: url,
    method: 'GET',
    uploadData: {
      contentType: 'text/html'
    }
  });
}

function seekStreamProtocol(request, callback) {
  console.log('seek stream!!!!');
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  }
  // const url= request.url.replace('seek://', `${host}`);
  const url = path.join(__dirname, 'helloworld/hello.html');
  callback({
    statusCode: '200',
    headers,
    data: fs.createReadStream(url)
  })
} */