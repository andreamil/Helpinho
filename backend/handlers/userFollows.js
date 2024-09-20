

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.follow = async (event) => {
  const { id } = event.pathParameters;
  const user = event.requestContext.authorizer.claims;

  if (!user) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Não autenticado' }),
    };
  }

  const userId = user.sub;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_USER_FOLLOWS,
    Item: {
      userId,
      helpinhoId:id,
      followedAt: new Date().toISOString(),
    },
    ConditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(helpinhoId)',
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Helpinho seguido com sucesso' }),
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: 'Você já está seguindo este helpinho' }),
      };
    }
    console.error('Erro ao seguir helpinho:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao seguir helpinho', error }),
    };
  }
};

module.exports.unfollow = async (event) => {
    const { id } = event.pathParameters;
    const user = event.requestContext.authorizer.claims;
  
    if (!user) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Não autenticado' }),
      };
    }
  
    const userId = user.sub;
  
    const params = {
      TableName: process.env.DYNAMODB_TABLE_USER_FOLLOWS,
      Key: {
        userId,
        helpinhoId:id,
      },
    };
  
    try {
      await dynamoDb.delete(params).promise();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Você deixou de seguir o helpinho' }),
      };
    } catch (error) {
      console.error('Erro ao deixar de seguir helpinho:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Erro ao deixar de seguir helpinho', error }),
      };
    }
  };
  
  module.exports.listFollowedHelpinhos = async (event) => {
    const user = event.requestContext.authorizer.claims;
  
    if (!user) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Não autenticado' }),
      };
    }
  
    const userId = user.sub;
  
    const params = {
      TableName: process.env.DYNAMODB_TABLE_USER_FOLLOWS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };
  
    try {
      const result = await dynamoDb.query(params).promise();
      const helpinhoIds = result.Items.map((item) => item.helpinhoId);
  
      if (helpinhoIds.length === 0) {
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({ items: [] }),
        };
      }
  
      
      const helpinhoTable = process.env.DYNAMODB_TABLE_HELPINHOS;
  
      const batchGetParams = {
        RequestItems: {
          [helpinhoTable]: {
            Keys: helpinhoIds.map((id) => ({ id })),
          },
        },
      };
  
      const batchResult = await dynamoDb.batchGet(batchGetParams).promise();
      const helpinhos = batchResult.Responses[helpinhoTable].filter(
        (item) => !item.deleted
      );
  
      
      helpinhos.forEach((item) => delete item.bankInfo);
  
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ items: helpinhos }),
      };
    } catch (error) {
      console.error('Erro ao listar helpinhos seguidos:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Erro ao listar helpinhos seguidos', error }),
      };
    }
  };
  