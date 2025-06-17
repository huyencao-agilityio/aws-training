import { defineBackend } from '@aws-amplify/backend';

import { auth } from './auth/resource';
import { VpcConstruct } from './custom/vpc/resource';
import { RdsConstruct } from './custom/rds/resource';
import { LambdaLayerConstruct } from './custom/lambda/layer/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth
});

// Create a new stack for custom resources
const customResourceStack = backend.createStack('CustomResourceStack');

// Create a new Lambda layer
const { layer } = new LambdaLayerConstruct(customResourceStack, 'LambdaLayerConstruct');

// Create a new VPC and security group
const { vpc, securityGroup } = new VpcConstruct(customResourceStack, 'VpcConstruct');

// Create a new RDS instance
const rds = new RdsConstruct(customResourceStack, 'RdsConstruct', {
  vpc,
  securityGroup,
});

const rdsEndpoint = rds.instance.dbInstanceEndpointAddress;

// Add output for backend
backend.addOutput({
  custom: {
    rdsEndpoint,
  },
});
