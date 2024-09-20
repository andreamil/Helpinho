

'use strict';

require('dotenv').config();

const AWS = require('aws-sdk');
AWS.config.update({ region: 'sa-east-1' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports.create = async (event) => {
  const data = JSON.parse(event.body);

  
  if (!data.name || !data.phone || !data.email || !data.password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Campos obrigatórios faltando' }),
    };
  }

  
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const params = {
    TableName: process.env.DYNAMODB_TABLE_USERS,
    Item: {
      id: uuidv4(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.put(params).promise();
    
    delete params.Item.password;
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao criar usuário', error }),
    };
  }
};

module.exports.get = async (event) => {
  
  const user = event.requestContext.authorizer.claims;
  const userId = user.sub; 

  
  const { id } = event.pathParameters;

  if (id !== userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Acesso negado' }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_USERS,
    Key: { id },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Usuário não encontrado' }),
      };
    }

    
    delete result.Item.password;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao obter usuário', error }),
    };
  }
};


module.exports.getStatistics = async (event) => {
  
  const user = event.requestContext.authorizer.claims;

  
  const { id } = event.pathParameters;

  if (!user || id !== user.sub) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Acesso negado' }),
    };
  }
  
  const userId = user.sub;

  
  const paramsCreated = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    Select: 'COUNT', 
  };

  
  const paramsTracking = {
    TableName: process.env.DYNAMODB_TABLE_USER_FOLLOWS,
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    Select: 'COUNT', 
  };

  
  const paramsDonated = {
    TableName: process.env.DYNAMODB_TABLE_HELPS,
    KeyConditionExpression: '#userId = :userId',
    IndexName: 'UserIdIndex',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    
    const createdHelpinhosResult = await dynamoDb.query(paramsCreated).promise();
    const createdCount = createdHelpinhosResult.Count;

    
    const trackingHelpinhosResult = await dynamoDb.query(paramsTracking).promise();
    const trackingCount = trackingHelpinhosResult.Count;

    
    const donatedHelpinhosResult = await dynamoDb.query(paramsDonated).promise();
    const donatedHelpinhos = donatedHelpinhosResult.Items || [];

    
    const totalDonated = donatedHelpinhos.reduce((total, donation) => total + (donation.amount || 0), 0);

    
    const helpinhosAjudados = new Set(donatedHelpinhos.map(donation => donation.helpinhoId)).size;

    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        trackingCount: trackingCount || 0,
        createdCount: createdCount || 0,
        totalDonated: totalDonated || 0,
        helpinhosAjudados: helpinhosAjudados || 0,
      }),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao obter estatísticas', error }),
    };
  }
};

