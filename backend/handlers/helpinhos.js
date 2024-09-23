const AWS = require('aws-sdk');
AWS.config.update({ region: 'sa-east-1' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const s3 = new AWS.S3();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

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
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: JSON.stringify({ message: `Campo obrigatório faltando: ${field}` }),
          };
      }
  }
  
  let photoUrl = '';
  if (data.photoBase64) {
      try {
          console.log(data.photoBase64.slice(0, 100));
  
          const maxSizeInBytes = 5 * 1024 * 1024; 
          const dataSplit = data.photoBase64.split(',')
          const buffer = Buffer.from(dataSplit[1], 'base64');
  
          if (buffer.length > maxSizeInBytes) {
              return {
                  statusCode: 400,
                  headers: {
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Credentials': true,
                  },
                  body: JSON.stringify({ message: 'A imagem deve ter no máximo 5 MB.' }),
              };
          }
  
          const mimeType = dataSplit[0].split(';')[0].split(':')[1];
          let extension = '';
          switch (mimeType) {
              case 'image/jpg':
              case 'image/jpeg':
                  extension = 'jpg';
                  break;
              case 'image/png':
                  extension = 'png';
                  break;
              case 'image/gif':
                  extension = 'gif';
                  break;
              case 'image/svg+xml':
                  extension = 'svg';
                  break;
              case 'image/webp':
                  extension = 'webp';
                  break;
              case 'image/gif':
                  extension = 'gif';
                  break;
              default:
                  return {
                      statusCode: 400,
                      headers: {
                          'Access-Control-Allow-Origin': '*',
                          'Access-Control-Allow-Credentials': true,
                      },
                      body: JSON.stringify({ message: 'Formato de imagem não suportado.' }),
                  };
          }
  
          const photoKey = `${uuidv4()}.${extension}`;
          const s3Params = {
              Bucket: process.env.S3_IMAGE_BUCKET,
              Key: photoKey,
              Body: buffer,
              ContentEncoding: 'base64',
              ContentType: mimeType,
          };
          const uploadResult = await s3.upload(s3Params).promise();
          photoUrl = uploadResult.Location;
      } catch (error) {
          console.error('Erro ao carregar imagem no S3:', error);
          return {
              statusCode: 500,
              headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Credentials': true,
              },
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
          deleted: 0, 
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
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Helpinho not found' }),
      };
    }

    delete result.Item.bankInfo;

    const { receivedAmount, donors, donorsCount } = await calculateDonations(id);
    const creator = await fetchUserFromCognito(result.Item.userId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        ...result.Item,
        receivedAmount: receivedAmount ? receivedAmount : result.Item.receivedAmount,
        donorsCount,
        donors,
        creator,
      }),
    };
  } catch (error) {
    console.error('Error fetching helpinho:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Error fetching helpinho', error }),
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
    donorsLimit
  } = event.queryStringParameters || {};

  const params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Limit: parseInt(limit),
    ExpressionAttributeNames: {
      '#deleted': 'deleted',
    },
    ExpressionAttributeValues: {
      ':deleted': 0,
    },
    ScanIndexForward: sort.endsWith('_asc'),
  };

  let filterExpressions = [];
  let keyConditionExpression = '#deleted = :deleted';

  if (sort.startsWith('goal')) {
    params.IndexName = 'GoalSortIndex';
    params.ExpressionAttributeNames['#goal'] = 'goal';
  
    if (goalMin || goalMax) {
      if (goalMin) params.ExpressionAttributeValues[':goalMin'] = parseInt(goalMin);
      if (goalMax) params.ExpressionAttributeValues[':goalMax'] = parseInt(goalMax);
  
      if (goalMin && goalMax) {
        keyConditionExpression += ' AND #goal BETWEEN :goalMin AND :goalMax';
      } else {
        keyConditionExpression += goalMin ? ' AND #goal >= :goalMin' : ' AND #goal <= :goalMax';
      }
    }
  } else if (sort.startsWith('receivedAmount')) {
    params.IndexName = 'ReceivedAmountSortIndex';
    keyConditionExpression += ' AND #receivedAmount >= :receivedMin';
    params.ExpressionAttributeNames['#receivedAmount'] = 'receivedAmount';
    params.ExpressionAttributeValues[':receivedMin'] = 0;
  } else {
    params.IndexName = 'DeletedIndex';
    keyConditionExpression += ' AND #createdAt >= :minCreatedAt';
    params.ExpressionAttributeNames['#createdAt'] = 'createdAt';
    params.ExpressionAttributeValues[':minCreatedAt'] = '0000-00-00T00:00:00Z';
  }

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
  }

  if (category) {
    filterExpressions.push('#category = :category');
    params.ExpressionAttributeNames['#category'] = 'category';
    params.ExpressionAttributeValues[':category'] = category;
  }

  if (search) {
    filterExpressions.push('contains(#titleLower, :searchLower)');
    params.ExpressionAttributeNames['#titleLower'] = 'titleLower';
    params.ExpressionAttributeValues[':searchLower'] = search.toLowerCase();
  }

  if (goalMin && !sort.startsWith('goal')) {
    filterExpressions.push('#goal >= :goalMin');
    params.ExpressionAttributeNames['#goal'] = 'goal';
    params.ExpressionAttributeValues[':goalMin'] = parseInt(goalMin);
  }

  if (goalMax && !sort.startsWith('goal')) {
    filterExpressions.push('#goal <= :goalMax');
    params.ExpressionAttributeNames['#goal'] = 'goal';
    params.ExpressionAttributeValues[':goalMax'] = parseInt(goalMax);
  }

  if (deadline) {
    filterExpressions.push('#deadline >= :deadline');
    params.ExpressionAttributeNames['#deadline'] = 'deadline';
    params.ExpressionAttributeValues[':deadline'] = deadline;
  }

  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
  }

  params.KeyConditionExpression = keyConditionExpression;

  try {
    const result = await dynamoDb.query(params).promise();
    const processedHelpinhos = [];

    for (let helpinho of result.Items) {
      if (donorsLimit === undefined || donorsLimit > 0){
        const { receivedAmount, donors, donorsCount } = await calculateDonations(helpinho.id, donorsLimit);
        helpinho.receivedAmount = receivedAmount;
        helpinho.donorsCount = donorsCount;
        helpinho.donors = donors;
      }

      helpinho.creator = await fetchUserFromCognito(helpinho.userId);
      processedHelpinhos.push(helpinho);
    }

    const response = {
      items: processedHelpinhos,
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Error listing helpinhos', error }),
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Nenhum campo para atualizar' }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Key: { id },
    UpdateExpression: updateExpression,
    ConditionExpression: '#userId = :userId AND #deleted = :deleted',
    ExpressionAttributeNames: {
      ...expressionAttributeNames,
      '#userId': 'userId',
      '#deleted': 'deleted',
    },
    ExpressionAttributeValues: {
      ...expressionAttributeValues,
      ':userId': userId,
      ':deleted': 0, 
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
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Acesso negado ou helpinho já excluído' }),
      };
    }
    console.error('Erro ao atualizar helpinho:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao atualizar helpinho', error }),
    };
  }
};

module.exports.delete = async (event) => {
  const { id } = event.pathParameters;

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

  const userId = user.sub;

  const params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    Key: { id },
    UpdateExpression: 'SET #deleted = :deletedAfter, #deletedAt = :deletedAt',
    ConditionExpression: '#userId = :userId AND #deleted = :deleted',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#deleted': 'deleted',
      '#deletedAt': 'deletedAt',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':deleted': 0, 
      ':deletedAfter': 1, 
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
    console.log(error);
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Acesso negado ou helpinho já excluído' }),
      };
    }
    console.error('Erro ao realizar soft delete do helpinho:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao excluir helpinho', error }),
    };
  }
};

module.exports.listByUser = async (event) => {
  const { id } = event.pathParameters;
  const {
    limit = 100,
    lastEvaluatedKey,
    sort = 'createdAt_desc',
  } = event.queryStringParameters || {};

  const user = event.requestContext.authorizer.claims;

  if (!user || user.sub !== id) {
    return {
      statusCode: 403,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Acesso negado' }),
    };
  }

  const scanIndexForward = sort.endsWith('_asc');

  let params = {
    TableName: process.env.DYNAMODB_TABLE_HELPINHOS,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: '#userId = :userId AND #createdAt >= :minCreatedAt',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#createdAt': 'createdAt',
      '#deleted': 'deleted',
    },
    //Limit: parseInt(limit),
    ScanIndexForward: scanIndexForward,
    FilterExpression: '#deleted = :deleted',
    ExpressionAttributeValues: {
      ':deleted': 0,
      ':userId': id,
      ':minCreatedAt': '0000-00-00T00:00:00Z',
    },
  };

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
  }

  try {
    const result = await dynamoDb.query(params).promise();    

    result.Items.forEach((item) => delete item.bankInfo);

    const response = {
      items: result.Items,
      lastEvaluatedKey: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null,
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao listar helpinhos', error }),
    };
  }
};

const fetchUserFromCognito = async (userId) => {
  try {
    const userData = await cognitoIdentityServiceProvider
      .adminGetUser({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Username: userId,
      })
      .promise();

    const name = userData.UserAttributes.find((attr) => attr.Name === 'name').Value;
    const email = userData.UserAttributes.find((attr) => attr.Name === 'email').Value;
    const photo = userData.UserAttributes.find((attr) => attr.Name === 'picture')?.Value || 'default-photo-url';

    return { id: userId, name, email, photo };
  } catch (error) {
    console.error(`Error fetching user ${userId} from Cognito:`, error);
    return null;
  }
};

const calculateDonations = async (helpinhoId, fetchUsersLimit) => {
  const donationParams = {
    TableName: process.env.DYNAMODB_TABLE_HELPS,
    IndexName: 'HelpinhoIdIndex',
    KeyConditionExpression: '#helpinhoId = :helpinhoId',
    ExpressionAttributeNames: { '#helpinhoId': 'helpinhoId' },
    ExpressionAttributeValues: { ':helpinhoId': helpinhoId },
  };

  const donationsResult = await dynamoDb.query(donationParams).promise();
  const donations = donationsResult.Items || [];

  const receivedAmount = donations.reduce((total, donation) => total + (donation.amount || 0), 0);
  const donorsMap = new Map();

  for (const donation of donations) {
    if (donorsMap.has(donation.userId)) {
      donorsMap.set(donation.userId, donorsMap.get(donation.userId) + (donation.amount || 0));
    } else {
      donorsMap.set(donation.userId, donation.amount || 0);
    }
  }

  const donors = await Promise.all(
    Array.from(donorsMap.keys())
      .slice(0, fetchUsersLimit !== undefined && fetchUsersLimit >= 0 ? fetchUsersLimit : donorsMap.size)
      .map(async (userId) => {
        const user = await fetchUserFromCognito(userId);
        if (user) {
          return { ...user, donationAmount: donorsMap.get(userId) };
        }
        return null;
      })
  );

  return { receivedAmount, donors: donors.filter(Boolean), donorsCount: donorsMap.size };
};
