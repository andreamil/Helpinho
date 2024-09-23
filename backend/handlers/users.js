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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
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
    KeyConditionExpression: '#userId = :userId AND #createdAt >= :minCreatedAt', 
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#createdAt': 'createdAt',
      '#deleted': 'deleted',
    },
    FilterExpression: '#deleted = :deleted', 
    ExpressionAttributeValues: {
      ':deleted': 0,
      ':userId': userId,
      ':minCreatedAt': '0000-00-00T00:00:00Z',
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
    
    const [createdHelpinhosResult, trackingHelpinhosResult, donatedHelpinhosResult] = await Promise.all([
      dynamoDb.query(paramsCreated).promise(),
      dynamoDb.query(paramsTracking).promise(),
      dynamoDb.query(paramsDonated).promise(),
    ]);

    const createdCount = createdHelpinhosResult.Count;
    const trackingCount = trackingHelpinhosResult.Count;

    
    const donatedHelpinhos = donatedHelpinhosResult.Items || [];
    const totalDonated = donatedHelpinhos.reduce((total, donation) => total + (donation.amount || 0), 0);
    const helpinhosAjudados = new Set(donatedHelpinhos.map((donation) => donation.helpinhoId)).size;

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

module.exports.uploadPhoto = async (event) => {
  const user = event.requestContext.authorizer.claims;
  const userId = user.sub;

  const data = JSON.parse(event.body);
  
  if (!data.photoBase64) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Campo photoBase64 é obrigatório.' }),
    };
  }

  try {
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

    const photoKey = `${userId}/profile.${extension}`;
    const s3Params = {
      Bucket: process.env.S3_IMAGE_BUCKET,
      Key: photoKey,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: mimeType,
    };
    const s3 = new AWS.S3();
    const uploadResult = await s3.upload(s3Params).promise();
    const photoUrl = uploadResult.Location;

    const cognito = new AWS.CognitoIdentityServiceProvider();
    const params = {
      UserAttributes: [
        {
          Name: 'picture',
          Value: photoUrl,
        },
      ],
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: userId,
    };

    await cognito.adminUpdateUserAttributes(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Foto do usuário atualizada com sucesso', photoUrl }),
    };
  } catch (error) {
    console.error('Erro ao carregar imagem no S3 ou atualizar no Cognito:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Erro ao carregar imagem ou atualizar perfil', error }),
    };
  }
};