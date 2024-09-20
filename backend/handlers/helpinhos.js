

'use strict';

require('dotenv').config();

const AWS = require('aws-sdk');
AWS.config.update({ region: 'sa-east-1' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const s3 = new AWS.S3();

module.exports.create = async (event) => {

    
    const user = event.requestContext.authorizer.claims;
    if (!user) {
        return {
            statusCode: 403,
            body: JSON.stringify({ message: 'Não autenticado' }),
        };
    }

    const data = JSON.parse(event.body);
    const userId = user.sub;
    const creatorName = user.name || data.creatorName;

    const requiredFields = [
        'title',
        'description',
        'goal',
        'category',
    ];

    
    for (const field of requiredFields) {
        if (!data[field]) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: `Campo obrigatório faltando: ${field}` }),
            };
        }
    }

    
    let photoUrl = '';
    if (data.photoBase64) {
        try {
            console.log(data.photoBase64.slice(0,100))
            
            const photoKey = `${uuidv4()}.jpg`;

            
            const buffer = Buffer.from(data.photoBase64, 'base64');
            const s3Params = {
                Bucket: process.env.S3_IMAGE_BUCKET,
                Key: photoKey,
                Body: buffer,
                ContentEncoding: 'base64', 
                ContentType: 'image/jpeg',  
            };

            const uploadResult = await s3.upload(s3Params).promise();
            photoUrl = uploadResult.Location; 
        } catch (error) {
            console.error('Erro ao carregar imagem no S3:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro ao carregar imagem', error }),
            };
        }
    }

    
    const params = {
        TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
        Item: {
            id: uuidv4(),
            userId: userId,
            photo: photoUrl, 
            title: data.title,
            titleLower: data.title.toLowerCase(), 
            description: data.description,
            goal: data.goal,
            creatorName: creatorName,
            category: data.category,
            deadline: data.deadline,
            bankInfo: data.bankInfo,
            createdAt: new Date().toISOString(),
            receivedAmount: 0,
        },
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 201,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(params.Item),
        };
    } catch (error) {
        console.error('Erro ao criar helpinho:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro ao criar helpinho', error }),
        };
    }
};


module.exports.get = async (event) => {
  const { id } = event.pathParameters;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Key: { id },
  };

  try {
    
    const result = await dynamoDb.get(params).promise();
    if (!result.Item || result.Item.deleted) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Helpinho not found' }),
      };
    }

    
    delete result.Item.bankInfo;

    
    const donationParams = {
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

    const donationsResult = await dynamoDb.query(donationParams).promise();
    const donations = donationsResult.Items || [];

    
    const totalRaised = donations.reduce((total, donation) => total + (donation.amount || 0), 0);

    
    const donorsIds = [...new Set(donations.map(donation => donation.userId))]; 
    const donors = [];
    
    for (let userId of donorsIds) {
      const userParams = {
        TableName: process.env.DYNAMODB_TABLE_USERS,
        Key: { id: userId },
      };
      const userResult = await dynamoDb.get(userParams).promise();
      if (userResult.Item) {
        donors.push({
          id: userResult.Item.id,
          name: userResult.Item.name,
          photo: userResult.Item.photo || 'default-photo-url', 
        });
      }
    }

    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        ...result.Item,
        totalRaised,
        donorsCount: donorsIds.length,
        donors,
      }),
    };
  } catch (error) {
    console.error('Error fetching helpinho:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching helpinho', error }),
    };
  }
};


module.exports.update = async (event) => {
  const { id } = event.pathParameters;
  const data = JSON.parse(event.body);

  
  const user = event.requestContext.authorizer.claims;

  if (!user) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Não autenticado' }),
    };
  }

  const userId = user.sub;

  
  const allowedFields = [
    'photo',
    'title',
    'description',
    'goal',
    'category',
    'deadline',
    'bankInfo',
  ];

  let updateExpression = 'SET';
  let expressionAttributeNames = {};
  let expressionAttributeValues = {};

  for (const field of allowedFields) {
    if (data[field]) {
      updateExpression += ` #${field} = :${field},`;
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = data[field];
    }
  }

  
  updateExpression += ' #titleLower = :titleLower,';
  expressionAttributeNames['#titleLower'] = 'titleLower';
  expressionAttributeValues[':titleLower'] = data.title.toLowerCase();

  
  
  updateExpression = updateExpression.slice(0, -1);

  if (updateExpression === 'SET') {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Nenhum campo para atualizar' }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Key: { id },
    UpdateExpression: updateExpression,
    ConditionExpression: '#userId = :userId AND attribute_not_exists(#deleted)',
    ExpressionAttributeNames: {
      ...expressionAttributeNames,
      '#userId': 'userId',
      '#deleted': 'deleted',
    },
    ExpressionAttributeValues: {
      ...expressionAttributeValues,
      ':userId': userId,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();

    
    delete result.Attributes.bankInfo;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Acesso negado ou helpinho já excluído' }),
      };
    }
    console.error('Erro ao atualizar helpinho:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao atualizar helpinho', error }),
    };
  }
};
module.exports.list = async (event) => {
  const {
    limit = 10,
    lastEvaluatedKey,
    search,
    category,
    goalMin,
    goalMax,
    deadline,
    sort = 'createdAt_desc',
  } = event.queryStringParameters || {};

  let params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Limit: parseInt(limit),
    ScanIndexForward: sort.endsWith('_desc') ? false : true,
  };

  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = {
      id: lastEvaluatedKey,
    };
  }

  
  let filterExpressions = [];
  let expressionAttributeNames = {};
  let expressionAttributeValues = {};

  
  filterExpressions.push('attribute_not_exists(#deleted)');
  expressionAttributeNames['#deleted'] = 'deleted';

  
  if (category) {
    filterExpressions.push('#category = :category');
    expressionAttributeNames['#category'] = 'category';
    expressionAttributeValues[':category'] = category;
  }

  
  if (goalMin) {
    filterExpressions.push('#goal >= :goalMin');
    expressionAttributeNames['#goal'] = 'goal';
    expressionAttributeValues[':goalMin'] = parseInt(goalMin);
  }
  if (goalMax) {
    filterExpressions.push('#goal <= :goalMax');
    expressionAttributeNames['#goal'] = 'goal';
    expressionAttributeValues[':goalMax'] = parseInt(goalMax);
  }

  
  if (deadline) {
    filterExpressions.push('#deadline <= :deadline');
    expressionAttributeNames['#deadline'] = 'deadline';
    expressionAttributeValues[':deadline'] = deadline;
  }

  
  if (search) {
    filterExpressions.push('contains(#titleLower, :searchLower)');
    expressionAttributeNames['#titleLower'] = 'titleLower';
    expressionAttributeValues[':searchLower'] = search.toLowerCase();
  }

  
  params.FilterExpression = filterExpressions.join(' AND ');
  params.ExpressionAttributeNames = expressionAttributeNames;
  if (Object.keys(expressionAttributeValues).length > 0) {
    params.ExpressionAttributeValues = expressionAttributeValues;
  }

  
  if (sort.startsWith('goal')) {
    params.IndexName = 'GoalIndex'; 
  } else if (sort.startsWith('receivedAmount')) {
    params.IndexName = 'ReceivedAmountIndex'; 
  }

  try {
    let result = await dynamoDb.scan(params).promise();
    let helpinhos = result.Items;

    
    for (let helpinho of helpinhos) {
      const donationParams = {
        TableName: process.env.DYNAMODB_TABLE_HELPS,
        IndexName: 'HelpinhoIdIndex',
        KeyConditionExpression: '#helpinhoId = :helpinhoId',
        ExpressionAttributeNames: {
          '#helpinhoId': 'helpinhoId',
        },
        ExpressionAttributeValues: {
          ':helpinhoId': helpinho.id,
        },
      };

      const donationsResult = await dynamoDb.query(donationParams).promise();
      const donations = donationsResult.Items || [];

      
      const totalRaised = donations.reduce(
        (total, donation) => total + (donation.amount || 0),
        0
      );
      const donorsIds = [...new Set(donations.map((donation) => donation.userId))];

      
      const donors = [];
      if (donorsIds.length > 0) {
        const batchGetParams = {
          RequestItems: {
            [process.env.DYNAMODB_TABLE_USERS]: {
              Keys: donorsIds.map((userId) => ({ id: userId })),
              ProjectionExpression: '#id, #name, #photo',
              ExpressionAttributeNames: {
                '#id': 'id',
                '#name': 'name', 
                '#photo': 'photo',
              },
            },
          },
        };
        const donorsResult = await dynamoDb.batchGet(batchGetParams).promise();
        donors.push(...donorsResult.Responses[process.env.DYNAMODB_TABLE_USERS]);
      }

      
      helpinho.totalRaised = totalRaised;
      helpinho.donorsCount = donors.length;
      helpinho.donors = donors;
    }

    const response = {
      items: helpinhos,
      lastEvaluatedKey: result.LastEvaluatedKey ? result.LastEvaluatedKey.id : null,
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error listing helpinhos:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error listing helpinhos', error }),
    };
  }
};



module.exports.delete = async (event) => {
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
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Key: { id },
    UpdateExpression: 'SET #deleted = :deleted, #deletedAt = :deletedAt',
    ConditionExpression: '#userId = :userId AND attribute_not_exists(#deleted)',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#deleted': 'deleted',
      '#deletedAt': 'deletedAt',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':deleted': true,
      ':deletedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Helpinho marcado como excluído com sucesso',
        item: result.Attributes,
      }),
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Acesso negado ou helpinho já excluído' }),
      };
    }
    console.error('Erro ao realizar soft delete do helpinho:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao excluir helpinho', error }),
    };
  }
};

module.exports.listByUser = async (event) => {
  const { id } = event.pathParameters;
  const {
    limit = 10,
    lastEvaluatedKey,
    sort = 'createdAt_desc',
  } = event.queryStringParameters || {};

  
  const user = event.requestContext.authorizer.claims;

  if (!user || user.sub !== id) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Acesso negado' }),
    };
  }

  let params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': id,
    },
    Limit: parseInt(limit),
    ScanIndexForward: sort.endsWith('_desc') ? false : true,
  };

  
  params.FilterExpression = 'attribute_not_exists(#deleted)';
  params.ExpressionAttributeNames['#deleted'] = 'deleted';

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = {
      userId: id,
      createdAt: lastEvaluatedKey,
    };
  }

  try {
    const result = await dynamoDb.query(params).promise();

    
    result.Items.forEach((item) => delete item.bankInfo);

    const response = {
      items: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey
        ? result.LastEvaluatedKey.createdAt
        : null,
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Erro ao listar helpinhos do usuário:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao listar helpinhos', error }),
    };
  }
};


