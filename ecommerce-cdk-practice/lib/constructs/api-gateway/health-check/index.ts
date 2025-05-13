import { IResource } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { HealthCheckApiConstructProps } from '@interfaces/construct.interface';

import { HealthCheckApiConstruct } from './health-check.construct';

/**
 * Define the construct for the resource health-check
 */
export class HealthCheckResourceConstruct extends Construct {
  public readonly healthCheckResource: IResource;

  constructor(
    scope: Construct,
    id: string,
    props: HealthCheckApiConstructProps
  ) {
    super(scope, id);

    const { resource } = props;

    // Create the health-check resource
    this.healthCheckResource = resource.addResource('health-check');

    // Add construct to define API health-check
    new HealthCheckApiConstruct(this, 'HealCheckApiConstruct', {
      resource: this.healthCheckResource
    });
  }
}
