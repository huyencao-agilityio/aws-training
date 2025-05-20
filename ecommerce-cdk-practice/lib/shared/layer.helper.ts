import { ParameterKeys } from '@constants/parameter-keys.constant';
import { ILayerVersion, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { SecretHelper } from './secret.helper';

/**
 * Retrieves the shared Lambda Layer containing common libraries.
 *
 * @param scope - The CDK construct scope.
 * @param id - The unique identifier for the layer construct.
 * @returns ILayerVersion representing the shared libraries layer.
 */
export const getLibrariesLayer = (
  scope: Construct,
  id: string
): ILayerVersion => {
  // Get the layer ARN from the SSM Parameter Store
  const layerArn = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.LambdaLayer
  );

  return LayerVersion.fromLayerVersionArn(
    scope,
    id || 'LibrariesLayer',
    layerArn
  );
};
