import { ILayerVersion, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

/**
 * Retrieves the shared Lambda Layer containing common libraries.
 *
 * @param scope - The CDK construct scope.
 * @param id - The unique identifier for the layer construct.
 * @returns ILayerVersion representing the shared libraries layer.
 */
export const getLibrariesLayer = (scope: Construct, id: string): ILayerVersion => {
  const layerArn = StringParameter.valueForStringParameter(
    scope,
    '/lambda/layer/LibrariesLayerArn'
  );

  return LayerVersion.fromLayerVersionArn(
    scope,
    id || 'LibrariesLayer',
    layerArn
  );
};
