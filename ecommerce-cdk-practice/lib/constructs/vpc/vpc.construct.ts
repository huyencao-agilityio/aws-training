import { Construct } from 'constructs';
import { Vpc, SubnetType, IpAddresses } from 'aws-cdk-lib/aws-ec2';

/**
 * Define the construct to create a new VPC
 */
export class VpcConstruct extends Construct {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = new Vpc(this, 'CdkAppVpc', {
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
      enableDnsHostnames: true
    });
  }
}
