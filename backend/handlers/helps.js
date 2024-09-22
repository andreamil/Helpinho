'use strict';

require('dotenv').config();

const AWS = require('aws-sdk');
AWS.config.update({ region: 'sa-east-1' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

module.exports.create = async (event) => {  
  const user = event.requestContext.authorizer.claims;

  if (!user) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Não autenticado' }),
    };
  }

  const data = JSON.parse(event.body);
  const userId = user.sub;
  const helpinhoId = data.helpinhoId;
  const amount = data.amount;

  
  if (!helpinhoId || !amount) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Campos obrigatórios faltando: helpinhoId ou amount' }),
    };
  }

  const paramsHelpinho = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Key: { id: helpinhoId }
  };

  try {
    
    const helpinhoResult = await dynamoDb.get(paramsHelpinho).promise();
    if (!helpinhoResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Helpinho não encontrado' }),
      };
    }

    
    const paramsDonation = {
      TableName: process.env.DYNAMODB_TABLE_HELPS,
      Item: {
        id: uuidv4(),
        userId: userId,
        helpinhoId: helpinhoId,
        amount: amount,
        createdAt: new Date().toISOString(),
      },
    };

    await dynamoDb.put(paramsDonation).promise();

    
    const paramsUpdateHelpinho = {
      TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
      Key: { id: helpinhoId },
      UpdateExpression: 'SET receivedAmount = receivedAmount + :amount',
      ExpressionAttributeValues: {
        ':amount': amount,
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const updateResult = await dynamoDb.update(paramsUpdateHelpinho).promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Doação realizada com sucesso!',
        donation: paramsDonation.Item,
        updatedHelpinho: updateResult.Attributes,
      }),
    };
  } catch (error) {
    console.error('Erro ao realizar doação:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao realizar doação', error }),
    };
  }
};

module.exports.listByUser = async (event) => {
  const { id } = event.pathParameters;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_HELPS,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': id,
    },
  };

  try {
    const result = await dynamoDb.query(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Erro ao listar doações do usuário:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao listar doações', error }),
    };
  }
};

module.exports.listByHelpinho = async (event) => {
  const { id } = event.pathParameters;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_HELPS,
    IndexName: 'HelpinhoIdIndex',
    KeyConditionExpression: '#helpinhoId = :helpinhoId',
    ExpressionAttributeNames: {
      '#helpinhoId': 'helpinhoId',
    },
    ExpressionAttributeValues: {
      ':helpinhoId': id,
    },
  };

  try {
    const result = await dynamoDb.query(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Erro ao listar doações do helpinho:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao listar doações', error }),
    };
  }
};
