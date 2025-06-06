import { Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BaseStageProps } from '@interfaces/stage.interface';
import { ApiStack } from '@stacks/api.stack';
import { AuthStack } from '@stacks/auth.stack';
import { CloudFrontStack } from '@stacks/cloudfront.stack';
import { EventBridgeStack } from '@stacks/event-bridge.stack';
import { MonitoringStack } from '@stacks/monitoring.stack';
import { QueueStack } from '@stacks/queue.stack';
import { RdsStack } from '@stacks/rds.stack';
import { StorageStack } from '@stacks/storage.stack';
import { VPCStack } from '@stacks/vpc.stack';
import { Route53Stack } from '@stacks/route53.stack';
import { CertificateStack } from '@stacks/certificate.stack';
import { SnsStack } from '@stacks/sns.stack';

/**
 * BaseStage is a class that groups common stacks used across different environments
 * such as development, staging, and production
 */
export class BaseStage extends Stage {
  constructor(scope: Construct, id: string, props: BaseStageProps) {
    super(scope, id, props);

    const {
      services,
      stageName
    } = props;

    // Create route 53 stack
    const route53Stack = new Route53Stack(this, 'Route53Stack', {
      stackName: `${stageName}-route53-stack`
    });
    // Get hosted zone value in route 53 stack
    const hostedZone = route53Stack.hostedZoneConstruct.hostedZone;

    // Create certificate stack
    const certificateStack = new CertificateStack(this, 'CertificateStack', {
      hostedZone: hostedZone,
      stackName: `${stageName}-certificate-stack`
    });
    const certificate = certificateStack.certificateConstruct.certificate;

    // Create VPC stack
    const vpcStack = new VPCStack(this, 'VPCStack', {
      stackName: `${stageName}-vpc-stack`
    });

    // Create RDS stack
    const rdsStack = new RdsStack(this, 'RDSStack', {
      stackName: `${stageName}-rds-stack`,
      vpc: vpcStack.vpc,
      securityGroup: vpcStack.securityGroup
    });

    // Create S3 storage stack
    new StorageStack(this, 'StorageStack', {
      stackName: `${stageName}-storage-stack`,
    });

    // Create CloudFront stack
    new CloudFrontStack(this, 'CloudFrontStack', {
      stackName: `${stageName}-cloudfront-stack`,
      certificate,
      hostedZone,
      domainName: services?.cloudFront?.domainName!
    });

    // Create SQS stack
    const queueStack = new QueueStack(this, 'QueueStack', {
      stackName: `${stageName}-queue-stack`
    });

    // Create auth stack
    const authStack = new AuthStack(this, 'AuthStack', {
      stackName: `${stageName}-auth-stack`,
      hostedZone,
      domainName: services?.cognito?.domainName!,
      certificate
    });

    // Create API stack
    const apiStack = new ApiStack(this, 'ApiStack', {
      stackName: `${stageName}-api-stack`,
      userPool: authStack.userPoolConstruct.userPool,
      stage: services?.apiGateway?.stage!,
      domainName: services?.apiGateway?.domainName!,
      basePathApi: services?.apiGateway?.basePathApi!,
      certificate,
      hostedZone,
    });

    // Create EventBridge stack
    const eventBridgeStack = new EventBridgeStack(this, 'EventBridgeStack', {
      stackName: `${stageName}-event-bridge-stack`
    });

    const snsStack = new SnsStack(this, 'SnsStack', {
      stackName: `${stageName}-sns-stack`
    });

    // Create monitoring stack
    const monitoringStack = new MonitoringStack(this, 'MonitoringStack', {
      stackName: `${stageName}-monitoring-stack`,
      snsTopic: snsStack.snsTopicConstruct.topic
    });

    // Explicit dependency
    queueStack.addDependency(rdsStack);
    eventBridgeStack.addDependency(rdsStack);
    apiStack.addDependency(rdsStack);
    authStack.addDependency(rdsStack);
    apiStack.addDependency(authStack);
    apiStack.addDependency(queueStack);
    monitoringStack.addDependency(apiStack);
  }
}
