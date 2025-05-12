import { Construct } from 'constructs';
import {
  Vpc,
  SubnetType,
  IpAddresses,
  Peer,
  Port,
  SecurityGroup
} from 'aws-cdk-lib/aws-ec2';

/**
 * Define the construct to create a new VPC
 */
export class VpcConstruct extends Construct {
  public readonly vpc: Vpc;
  public readonly securityGroup: SecurityGroup;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = this.createVpc();
    this.securityGroup = this.createSecurityGroup();
  }

  /**
   * Create a new VPC
   */
  createVpc(): Vpc {
    const vpc = new Vpc(this, 'CdkAppVpc', {
      vpcName: 'CdkAppVpc',
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
   * @returns
   */
  createSecurityGroup(): SecurityGroup {
    const securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.allTcp(),
      'Allow all TCP traffic from anywhere');

    securityGroup.addIngressRule(
      securityGroup,
      Port.allTraffic(),
      'Allow all traffic from self'
    );

    return securityGroup;
  }
}
