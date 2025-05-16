import { Duration, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import {
  SubnetType,
  InstanceType,
  InstanceClass,
  InstanceSize,
  Vpc,
  SecurityGroup,
} from 'aws-cdk-lib/aws-ec2';
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  StorageType
} from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

import { PostgresRdsConstructProps } from '@interfaces/construct.interface';

/**
 * Define the construct to create a new RDS
 */
export class PostgresRdsConstruct extends Construct {
  public readonly instance: DatabaseInstance;

  constructor(scope: Construct, id: string, props: PostgresRdsConstructProps) {
    super(scope, id);

    const { vpc, securityGroup } = props;

    this.instance = this.createRdsInstance(vpc, securityGroup);
  }

  /**
   * Creates an RDS instance
   *
   * @param vpc - The VPC to attach to the RDS instance.
   * @param securityGroup - The security group to attach to the RDS instance.
   * @returns The created DatabaseInstance.
   */
  createRdsInstance(vpc: Vpc, securityGroup: SecurityGroup): DatabaseInstance {
    const dbPassword =  StringParameter.fromSecureStringParameterAttributes(
      this,
      'DbPassword',
      {
        parameterName: '/db/password',
      }
    ).stringValue;
    const dbIdentifier = StringParameter.valueForStringParameter(
      this,
      '/db/identifier'
    );

    const instance = new DatabaseInstance(this, 'PostgresInstance', {
      instanceIdentifier: dbIdentifier,
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
      credentials: {
        username: 'postgres',
        password: SecretValue.unsafePlainText(dbPassword),
      },
      storageEncrypted: true,
      enablePerformanceInsights: true
    });

    return instance;
  }
}
