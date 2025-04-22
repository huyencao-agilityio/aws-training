import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LayerVersion, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class LambdaLayerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create layer
    const librariesLayer = new LayerVersion(this, 'LibrariesLayer', {
      code: Code.fromAsset('layer'),
      compatibleRuntimes: [Runtime.NODEJS_20_X],
      description: 'Layer contains the libs using for the Lambda function',
      layerVersionName: 'LibrariesLayer',
    });

    // Save ARN to Parameter Store
    new StringParameter(this, 'LibrariesLayerArnParameter', {
      parameterName: '/lambda/layer/LibrariesLayerArn',
      stringValue: librariesLayer.layerVersionArn,
      description: 'ARN of Libraries Layer',
    });

    new CfnOutput(this, 'LibrariesLayerArn', {
      value: librariesLayer.layerVersionArn,
    });
  }
}
