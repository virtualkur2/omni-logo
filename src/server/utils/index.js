const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const utils = {
  userQuery: (req) => {
    const query = {};
    if (emailRegex.test(req.body.user)) {
      query.email = req.body.user;
    }
    else {
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
  }
  
}

module.exports = utils;