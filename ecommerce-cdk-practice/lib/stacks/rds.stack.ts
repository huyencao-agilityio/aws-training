import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { PostgresRdsStackProps } from '@interfaces/stack.interface';

import { PostgresRdsConstruct } from '../constructs/rds/rds.construct';

/**
 * RdsStack is responsible for provisioning the PostgreSQL RDS instance
 * and its associated resources such as networking and security configurations
 */
export class RdsStack extends Stack {
  constructor(scope: Construct, id: string, props: PostgresRdsStackProps) {
    super(scope, id, props);

    const { vpc, securityGroup } = props;

    new PostgresRdsConstruct(this, 'PostgresRdsConstruct', {
      vpc: vpc,
      securityGroup: securityGroup
    });
  }
}
