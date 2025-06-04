import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { SecretValue } from 'aws-cdk-lib';

/**
 * Helper class for managing secrets in SSM Parameter Store and Secret Manager
 */
export class SecretHelper {
  /**
   * Get a secure string from SSM Parameter Store
   *
   * @param scope - The scope of the construct
   * @param id - The id of the construct
   * @param parameterName - The name of the parameter
   * @returns The secure string
   */
  static getSecureStringParameter(
    scope: Construct,
    id: string,
    parameterName: string
  ): string {
    return StringParameter.fromSecureStringParameterAttributes(scope, id, {
      parameterName: parameterName,
    }).stringValue;
  }

  /**
   * Get a plain string from SSM Parameter Store
   *
   * @param scope - The scope of the construct
   * @param parameterName - The name of the parameter
   * @returns The plain string
   */
  static getPlainTextParameter(
    scope: Construct,
    parameterName: string
  ): string {
    return StringParameter.valueForStringParameter(scope, parameterName);
  }

  /**
   * Get a secret value from SSM Parameter Store
   *
   * @param parameterName - The name of the parameter
   * @returns The secret value
   */
  static getSecretValue(parameterName: string): SecretValue {
    return SecretValue.ssmSecure(parameterName);
  }

  /**
   * Get a secret value from SSM Parameter Store with unsafe unwrap
   *
   * @param parameterName - The name of the parameter
   * @returns The secret value
   */
  static getSecretValueWithUnsafeUnwrap(parameterName: string): string {
    return SecretValue.ssmSecure(parameterName).unsafeUnwrap();
  }

  /**
   * Get a secret value from Secret Manager
   *
   * @param field - The field of the secret
   * @returns The secret value
   */
  static getSecretManager(field: string) {
    return SecretValue.secretsManager('secret', {
      jsonField: field,
    });
  }
}
