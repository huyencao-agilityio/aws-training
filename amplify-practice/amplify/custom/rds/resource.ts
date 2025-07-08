import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  ISecurityGroup,
  IVpc,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import {
  DatabaseInstance,
  StorageType,
  DatabaseInstanceEngine,
  PostgresEngineVersion
} from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

import { SecretHelper } from '../../utils/secret.utils';
import { buildResourceName } from '../../utils/resource.utils';
import {
  SecretManagerFields
} from '../../shared/constants/secret-manage-field.const';
import { ParameterKeys } from '../../shared/constants/parameter-keys.constant';
import {
  RdsConstructProps
} from '../../shared/interfaces/construct.interface';

/**
 * Define the construct to create a new RDS
 */
export class RdsConstruct extends Construct {
  public readonly instance: DatabaseInstance;

  constructor(scope: Construct, id: string, props: RdsConstructProps) {
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
  createRdsInstance(
    vpc: IVpc,
    securityGroup: ISecurityGroup
  ): DatabaseInstance {
    // Get the db password from the Secret Manager
    const dbPassword = SecretHelper.getSecretManager(
      SecretManagerFields.DbPassword
    );

    const dbUsername = SecretHelper.getPlainTextParameter(
      this,
      ParameterKeys.DbUser
    );

    const instance = new DatabaseInstance(this, 'PostgresInstance', {
      instanceIdentifier: buildResourceName('db'),
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_17,
      }),
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [securityGroup],
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      publiclyAccessible: false,
      storageType: StorageType.GP2,
      allocatedStorage: 20,
      multiAz: false,
      backupRetention: Duration.days(0),
      deletionProtection: false,
      deleteAutomatedBackups: true,
      credentials: {
        username: dbUsername,
        password: dbPassword,
      },
      storageEncrypted: true,
      enablePerformanceInsights: true,
      removalPolicy: RemovalPolicy.RETAIN
    });

    return instance;
  }
}
