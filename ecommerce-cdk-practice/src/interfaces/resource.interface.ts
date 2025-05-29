import { IResource } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import {
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer
} from 'aws-cdk-lib/aws-apigateway';

import { ApiGatewayModel } from './api-gateway-model.interface';


export interface ResourceConfig {
  construct: any;
  resource: IResource;
  lambdaFunction: IFunction;
  models: ApiGatewayModel;
  userPool?: IUserPool;
  cognitoAuthorizer?: CognitoUserPoolsAuthorizer
  lambdaAuthorizer?: RequestAuthorizer,
}
