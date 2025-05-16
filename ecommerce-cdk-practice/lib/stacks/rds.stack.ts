import { CfnOutput, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { PostgresRdsStackProps } from '@interfaces/stack.interface';
import { DB_CONSTANTS } from '@constants/database.constant';
import { PostgresRdsConstruct } from '@constructs/rds/rds.construct';

/**
 * RdsStack is responsible for provisioning the PostgreSQL RDS instance
 * and its associated resources such as networking and security configurations
 */
export class RdsStack extends Stack {
  constructor(scope: Construct, id: string, props: PostgresRdsStackProps) {
    super(scope, id, props);

    const { vpc, securityGroup } = props;

    const dbInstance = new PostgresRdsConstruct(this, 'PostgresRdsConstruct', {
      vpc: vpc,
      securityGroup: securityGroup
    });

    // Output DB information for use in other stacks
    new CfnOutput(this, 'DbHost', {
      exportName: `${DB_CONSTANTS.HOST}`,
      value: dbInstance.instance.dbInstanceEndpointAddress,
      description: 'The endpoint address of the Postgres database',
    });
  }
}
