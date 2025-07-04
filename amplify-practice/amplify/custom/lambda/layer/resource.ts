import { LayerVersion, Code, Runtime, ILayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Define the construct to create a new Lambda layer
 */
export class LambdaLayerConstruct extends Construct {
  public readonly layer: ILayerVersion;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create layer
    this.layer = new LayerVersion(this, 'LibrariesLayer', {
      code: Code.fromAsset('layers'),
      compatibleRuntimes: [
        Runtime.NODEJS_20_X,
        Runtime.NODEJS_22_X,
      ],
      description: 'Layer contains the libs using for the Lambda function',
      layerVersionName: 'LibrariesLayer',
    });
  }
}
