import { IModel } from 'aws-cdk-lib/aws-apigateway';

export interface RestAPIModel {
  [key: string]: IModel;
}
