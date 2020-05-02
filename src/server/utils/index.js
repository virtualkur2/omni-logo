const https = require('https');
const querystring = require('querystring');

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const utils = {
  userQuery: (req) => {
    if(!req.body || (!req.body.email && !req.body.user)) return;
    const query = {};
    if(req.body.email) {
      query.email = req.body.email;
    } else {
      query.userName = req.body.user;
    }
    return query;
  },
  getToken: (req) => {
    if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    } else if(req.query && req.query.token) {
      return req.query.token;
    } else if(req.signedCookies) {
      let token = undefined;
      if(req.signedCookies[config.cookie.name]) {
        token = req.signedCookies[config.cookie.name];
      }
      // console.log(token);
      return token;
    } else {
      return;
    }
  },
  activationTemplate: (activationRecipient, activateToken, activationURI, redirectURI) => {
    return `
      <h3>Bienvenido a <a href="https://omnipc.ddns.net">OmniPC Sistemas</a></h3>
      <p>Por favor haga clic en el siguiente enlace para activar su cuenta:</p>
      <a href="${activationURI}?token=${activateToken}&email=${activationRecipient}&activate=true&redirect=${redirectURI}">Activar cuenta en OmniPC</a>
      <p>Gracias por su confianza.</p>
    `;
  },
  verifyCaptcha: (token, ip) => {
    return new Promise((resolve, reject) => {
      
      const postMessage = querystring.stringify({
        secret: process.env.RECAPTCHA_SECRET,
        response: token,
        remoteip: ip
      });
      
      const options = {
        hostname: 'www.google.com',
        // hostname: 'omnipc.ddns.net',
        path: '/recaptcha/api/siteverify',
        // path: '/api/quotes/random',
        method: 'POST',
        // method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postMessage)
        }
      }
      
      const request = https.request(options, (response) => {
        response.on('data', data => {
          try {
            const json = JSON.parse(data);
            response.emit('json', json);
          } catch(error) {
            console.log(error.messsage);
            response.emit('error', error);
          }
        });
        response.on('json', resolve);
        response.on('error', reject);
      });

      request.on('error', error => {
        console.log(error);
        return resolve(error);
      });
  
      request.write(postMessage);
      request.end();
    });
  }
  
}

module.exports = utils;