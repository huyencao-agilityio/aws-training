import { Construct } from 'constructs';
import {
  Vpc,
  SubnetType,
  IpAddresses,
  Peer,
  Port,
  SecurityGroup,
  IVpc,
  ISecurityGroup
} from 'aws-cdk-lib/aws-ec2';

import { buildResourceName } from '../../utils/resource.utils';

/**
 * Define the construct to create a new VPC
 */
export class VpcConstruct extends Construct {
  public readonly vpc: IVpc;
  public readonly securityGroup: ISecurityGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = this.createVpc();
    this.securityGroup = this.createSecurityGroup();
  }

  /**
   * Create a new VPC
   *
   * @returns The created VPC instance
   */
  createVpc(): IVpc {
    const vpc = new Vpc(this, 'CdkAppVpc', {
      vpcName: buildResourceName('vpc'),
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
      enableDnsSupport: true,
      enableDnsHostnames: true,
    });

    return vpc;
  }

  /**
   * Create security group for VPC
   *
   * @returns The created security group instance
   */
  createSecurityGroup(): ISecurityGroup {
    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: buildResourceName('security-group'),
    });

    securityGroup.addIngressRule(
      securityGroup,
      Port.allTraffic(),
      'Allow all traffic from self'
    );

    return securityGroup;
  }
}
