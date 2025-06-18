import { Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Effect } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * Helper class for creating IAM policies
 */
export class PolicyHelper {
  /**
   * Get the region and account of the stack
   *
   * @param scope - The scope of the stack
   * @returns The region and account of the stack
   */
  static getAccountContext(scope: Construct){
    const stack = Stack.of(scope);

    return {
      region: stack.region,
      account: stack.account,
    };
  }

  /**
   * Create a policy statement for sending emails
   *
   * @param scope - The scope of the stack
   * @param defaultEmailAddress - The default email address to send the email to
   * @returns The policy statement for sending emails
   */
  static allowSesSendEmail(
    scope: Construct,
    defaultEmailAddress: string
  ): PolicyStatement {
    // Get the region and account of the stack
    const { region, account } = PolicyHelper.getAccountContext(scope);

    return new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ses:SendEmail'
      ],
      resources: [
        `arn:aws:ses:${region}:${account}:identity/${defaultEmailAddress}`
      ],
    });
  }

  /**
   * Create a policy statement for getting a secret value from the secret manager
   *
   * @param scope - The scope of the stack
   * @param secretName - The name of the secret
   * @returns The policy statement for getting a secret value from the secret manager
   */
  static allowSecretManagerGetValue(
    scope: Construct,
    secretName: string
  ): PolicyStatement {
    const { region, account } = PolicyHelper.getAccountContext(scope);

    return new PolicyStatement({
      actions: [
        'secretsmanager:GetSecretValue'
      ],
      resources: [
        `arn:aws:secretsmanager:${region}:${account}:secret:${secretName}*`
      ],
    })
  }
}
