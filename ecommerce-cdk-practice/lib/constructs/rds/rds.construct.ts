import { Duration, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
import {
  SubnetType,
  InstanceType,
  InstanceClass,
  InstanceSize,
  IVpc,
  ISecurityGroup
} from 'aws-cdk-lib/aws-ec2';
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  StorageType
} from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

import { PostgresRdsConstructProps } from '@interfaces/construct.interface';
import { ParameterKeys } from '@constants/parameter-keys.constant';
import { SecretHelper } from '@shared/secret.helper';
import { buildResourceName } from '@shared/resource.helper';

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
  createRdsInstance(vpc: IVpc, securityGroup: ISecurityGroup): DatabaseInstance {
    // Get the db password from the Secret Manager
    const dbPassword = SecretHelper.getSecretManager(
      'db_password'
    );

    const instance = new DatabaseInstance(this, 'PostgresInstance', {
      instanceIdentifier: buildResourceName(this, 'db'),
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
        password: dbPassword,
      },
      storageEncrypted: true,
      enablePerformanceInsights: true,
      removalPolicy: RemovalPolicy.RETAIN
    });

    return instance;
  }
}
