import {
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer,
  IResource,
  IRestApi,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Function, ILayerVersion } from 'aws-cdk-lib/aws-lambda';

import { ApiGatewayModel } from './api-gateway-model.interface';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';

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
export interface CognitoEnvContextConstructProps extends BaseConstructProps {
  region?: string;
}

/**
 * Defines interface for the construct that need to related to User Pool.
 */
export interface UserPoolConstructProps extends BaseConstructProps {
  userPool: UserPool;
}

/**
 * Defines interface for base API Gateway Construct
 */
export interface BaseApiGatewayConstructProps extends BaseConstructProps {
  resource: IResource;
  userPool?: UserPool;
  cognitoAuthorizer?: CognitoUserPoolsAuthorizer
  lambdaAuthorizer?: RequestAuthorizer,
  models?: ApiGatewayModel;
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
  handlerFunction?: string;
  environment?: Record<string, string>;
  timeout?: Duration;
  withSesPolicy?: boolean;
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
 * Defines interface for the storage bucket Construct
 */
export interface StorageBucketConstructProps {
  bucketName: string;
}

/**
 * Defines interface for the Alarm Construct
 */
export interface AlarmConstructProps {
  snsTopic: Topic;
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
  vpc: Vpc;
  securityGroup: SecurityGroup;
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
  recordName?: string;
}
