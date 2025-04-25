import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  RestApi,
  EndpointType,
  AuthorizationType,
  MockIntegration,
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import {
  Function,
  Runtime,
  Code,
  LayerVersion
} from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

interface ApiStackProps extends StackProps {
  userPool: UserPool;
}

export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Get layer from SSM
    const layerArn = StringParameter.valueForStringParameter(this, '/lambda/layer/LibrariesLayerArn');
    const librariesLayer = LayerVersion.fromLayerVersionArn(this, 'LibrariesLayer', layerArn);


    // Create REST API
    this.api = new RestApi(this, 'EcommerceApi', {
      restApiName: 'Ecommerce API CDK',
      description: 'API for Ecommerce application',
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      }
    });

    // Create Cognito Authorizer
    const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      authorizerName: 'CognitoAuthorization',
      cognitoUserPools: [props.userPool],
      identitySource: 'method.request.header.Authorization'
    });

    // Create Lambda Authorizer
    const LambdaAuthorization = new Function(this, 'LambdaAuthorization', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromAsset('dist/lib/lambda/api/lambda-authorizer/'),
      layers: [librariesLayer],
      timeout: Duration.seconds(10),
      environment: {
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_REGION: props.userPool.env.region
      },
    });

    const lambdaAuthorizer = new RequestAuthorizer(this, 'LambdaAuthorizer', {
      authorizerName: 'LambdaAuthorization',
      handler: LambdaAuthorization,
      identitySources: ['method.request.header.Authorization'],
      resultsCacheTtl: Duration.seconds(0),
    });

    // Create API resources
    const apiResource = this.api.root.addResource('api');
    // Create health-check resource
    const healthCheck = apiResource.addResource('health-check');

    // Add health-check method
    healthCheck.addMethod('GET', new MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseTemplates: {
          'application/json': JSON.stringify({
            statusCode: 200,
            message: 'API Gateway work well'
          })
        }
      }],
      requestTemplates: {
        'application/json': '{ "statusCode": 200 }'
      },
    }), {
      authorizer: cognitoAuthorizer,
      methodResponses: [{ statusCode: '200' }],
      apiKeyRequired: false,
      authorizationType: AuthorizationType.COGNITO
    });

    // Create health-check resource
    const healthCheckLambda = apiResource.addResource('health-check-lambda');

    // Add health-check method
    healthCheckLambda.addMethod('GET', new MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseTemplates: {
          'application/json': JSON.stringify({
            statusCode: 200,
            message: 'API Gateway work well'
          })
        }
      }],
      requestTemplates: {
        'application/json': '{ "statusCode": 200 }'
      },
    }), {
      authorizer: lambdaAuthorizer,
      methodResponses: [{ statusCode: '200' }],
      apiKeyRequired: false,
      authorizationType: AuthorizationType.CUSTOM
    });

    // Output
    new CfnOutput(this, 'API Gateway', {
      value: this.api.url,
      description: `API Gateway`,
    });
  }
}
