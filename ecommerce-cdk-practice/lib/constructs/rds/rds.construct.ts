import { Duration, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import {
  SubnetType,
  InstanceType,
  InstanceClass,
  InstanceSize,
} from 'aws-cdk-lib/aws-ec2';
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  StorageType
} from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import 'dotenv/config';

import { PostgresRdsConstructProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create a new RDS
 */
export class PostgresRdsConstruct extends Construct {
  public readonly instance: DatabaseInstance;

  constructor(scope: Construct, id: string, props: PostgresRdsConstructProps) {
    super(scope, id);

    const { vpc, securityGroup } = props;
    const DB_PASSWORD = process.env.DB_PASSWORD || '';
    const DB_IDENTIFIER = process.env.DB_IDENTIFIER || '';

    this.instance = new DatabaseInstance(this, 'PostgresInstance', {
      instanceIdentifier: DB_IDENTIFIER,
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_17,
      }),
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      securityGroups: [securityGroup],
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      publiclyAccessible: true,
      storageType: StorageType.GP2,
      allocatedStorage: 20,
      multiAz: false,
      backupRetention: Duration.days(0),
      deletionProtection: false,
      deleteAutomatedBackups: true,
      removalPolicy: RemovalPolicy.DESTROY,
      credentials: {
        username: 'postgres',
        password: SecretValue.unsafePlainText(DB_PASSWORD),
      },
      storageEncrypted: true,
      enablePerformanceInsights: true
    });
  }
}
