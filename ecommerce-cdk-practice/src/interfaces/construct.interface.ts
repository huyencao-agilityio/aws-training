import {
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer,
  IResource,
  IRestApi,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { IUserPool, UserPoolDomain } from 'aws-cdk-lib/aws-cognito';
import { Function, ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { ITopic } from 'aws-cdk-lib/aws-sns';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';

import { ApiGatewayModel } from './api-gateway-model.interface';

/**
 * Defines interface the base construct.
 */
export interface BaseConstructProps {
  librariesLayer?: ILayerVersion;
  lambdaFunction?: Function
}

/**
 * Defines interface for the construct that need to related to User Pool.
 */
export interface CognitoConstructProps extends BaseConstructProps {
  region: string;
  certificate: ICertificate;
  domainName: string;
}

/**
 * Defines interface for the user pool domain construct props
 */
export interface UserPoolDomainConstructProps {
  hostedZone: IHostedZone;
  domainName: string;
  cognitoDomain: UserPoolDomain;
}

/**
 * Defines interface for the construct that need to related to User Pool.
 */
export interface UserPoolConstructProps extends BaseConstructProps {
  userPool?: IUserPool;
  userPoolArn?: string;
}

/**
 * Defines interface for the construct for API Gateway
 */
export interface RestApiConstructProps extends UserPoolConstructProps {
  stage?: string;
}

/**
 * Defines interface for base API Gateway Construct
 */
export interface BaseApiGatewayConstructProps extends BaseConstructProps {
  restApi?: IRestApi;
  resource: IResource;
  userPool?: IUserPool;
  cognitoAuthorizer?: CognitoUserPoolsAuthorizer
  lambdaAuthorizer?: RequestAuthorizer,
  models?: ApiGatewayModel;
}

/**
 * Defines interface for health check API Construct
 */
export interface HealthCheckApiConstructProps {
  resource: IResource;
}

/**
 * Defines interface for Rest API Model Construct
 */
export interface RestApiModelConstructProps {
  restApi: IRestApi
}

/**
 * Defines interface for Queue Construct
 */
export interface QueueConstructProps extends BaseConstructProps {
  queue?: Queue;
  baseName?: string;
  maxReceiveCount?: number;
  isFifo?: boolean;
}

/**
 * Defines interface for Queue Lambda Construct
 */
export interface QueueLambdaConstructProps {
  queue: Queue;
  librariesLayer?: ILayerVersion;
  handlerFile?: string;
  environment?: Record<string, string>;
  timeout?: Duration;
  withSesPolicy?: boolean;
}

/**
 * Defines interface for the storage bucket Construct
 */
export interface StorageBucketConstructProps {
  bucketName: string;
}

/**
 * Defines interface for the Alarm Construct
 */
export interface AlarmConstructProps {
  snsTopic: ITopic;
}

/**
 * Defines interface for the SNS topic Construct
 */
export interface SnsAlarmTopicProps {
  email: string;
  topicName?: string;
}

/**
 * Defines interface for the RDS Construct
 */
export interface PostgresRdsConstructProps {
  vpc: IVpc;
  securityGroup: ISecurityGroup;
}

/**
 * Defines interface for the Certificate Construct
 */
export interface CertificateConstructProps {
  hostedZone: IHostedZone;
}

/**
 * Defines interface for the api domain Construct
 */
export interface ApiDomainConstructProps {
  hostedZone: IHostedZone;
  certificate: ICertificate;
  domainName: string;
  restApi: RestApi;
  basePathApi?: string;
}

/**
 * Defines interface for the CloudFront domain construct
 * Used to create Route 53 DNS records pointing to a CloudFront distribution
 */
export interface CloudFrontDomainConstructProps {
  hostedZone: IHostedZone;
  domainName: string;
  distribution: Distribution;
}

/**
 * Defines interface for the CloudFront construct.
 * Used to configure a CloudFront distribution with a custom domain and certificate.
 */
export interface CloudFrontConstructProps extends BaseConstructProps {
  certificate: ICertificate;
  domainName: string;
}
