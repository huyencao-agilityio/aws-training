import { ILayerVersion, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

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
