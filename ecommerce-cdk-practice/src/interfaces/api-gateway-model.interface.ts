import { IModel } from 'aws-cdk-lib/aws-apigateway';

/**
 * Defines interface for base API Gateway Construct
 */
export interface ApiGatewayModel {
  [key: string]: IModel;
}
