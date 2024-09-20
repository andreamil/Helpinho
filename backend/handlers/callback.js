

'use strict';

const querystring = require('querystring');
const axios = require('axios');

module.exports.handler = async (event) => {
  const params = event.queryStringParameters;

  if (params && params.code) {
    const authorizationCode = params.code;
    const state = params.state;

    
    const tokenUrl = `https://${process.env.COGNITO_DOMAIN}/oauth2/token`;

    const body = querystring.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.COGNITO_APP_CLIENT_ID,
      client_secret: '',
      redirect_uri: process.env.COGNITO_CALLBACK_URL,
      code: authorizationCode,
      state,
    });

    try {
      const response = await axios.post(tokenUrl, body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      const tokens = response.data;

      

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'Autenticação bem-sucedida',
          tokens: tokens,
        }),
      };
    } catch (error) {
      console.error('Erro ao trocar o código por tokens:', error.response.data);

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Erro ao trocar o código por tokens',
          error: error.response.data,
        }),
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Código de autorização não fornecido',
      }),
    };
  }
};
