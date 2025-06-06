// script/iam-policy-manager.ts
import {
  IAMClient,
  CreatePolicyCommand,
  ListPoliciesCommand,
  ListPolicyVersionsCommand,
  GetPolicyVersionCommand,
  CreatePolicyVersionCommand,
  DeletePolicyVersionCommand,
  AttachUserPolicyCommand,
  ListAttachedUserPoliciesCommand,
  Policy
} from '@aws-sdk/client-iam';
import isEqual from 'lodash/isEqual';

export interface PolicyDefinition {
  name: string;
  document: Object;
}

export class IamPolicyManager {
  private iam: IAMClient;

  constructor() {
    this.iam = new IAMClient({});
  }

  /**
   * Get the ARN of the policy by name
   *
   * @param policyName - The name of the policy
   * @returns The ARN of the policy
   */
  private async getPolicyArnByName(policyName: string): Promise<string | null> {
    // Get custom policies
    const result = await this.iam.send(
      new ListPoliciesCommand({
        Scope: 'Local',
        MaxItems: 1000
      })
    );

    // Find the policy by name
    const policy = result.Policies?.find(
      (p: Policy) => p.PolicyName === policyName
    );

    return policy?.Arn || null;
  }

  /**
   * Check the policy document is change or not
   *
   * @param policyArn - The ARN of the policy
   * @param policyDocument - The expected document
   * @returns True if the policy document is change, false otherwise
   */
  private async hasChangesPolicy(
    policyArn: string,
    policyDocument: Object
  ): Promise<boolean> {
    // List all versions of the policy
    const versions = await this.iam.send(
      new ListPolicyVersionsCommand({ PolicyArn: policyArn })
    );

    // Get the default version id
    const defaultVersionId = versions.Versions?.find(v => v.IsDefaultVersion)?.VersionId;

    if (!defaultVersionId) {
      return false;
    }

    // Get the default version of the policy
    const version = await this.iam.send(
      new GetPolicyVersionCommand({
        PolicyArn: policyArn,
        VersionId: defaultVersionId
      })
    );

    // Get the document of the default version
    const document = decodeURIComponent(version.PolicyVersion?.Document || '');
    const defaultDocument = JSON.parse(document);

    // Check if the policy document is change or not
    return !isEqual(defaultDocument, policyDocument);
  }

  /**
   * Delete the oldest non-default version of the policy
   *
   * @param policyArn - The ARN of the policy
   */
  private async deleteOldestNonDefaultVersion(policyArn: string): Promise<void> {
    // List all versions of the policy
    const versions = await this.iam.send(
      new ListPolicyVersionsCommand({ PolicyArn: policyArn })
    );

    // Get the non-default versions
    const nonDefaultVersions = versions.Versions?.filter(v => !v.IsDefaultVersion);

    // Check if the number of non-default versions is greater than or equal to 4
    if (nonDefaultVersions && nonDefaultVersions.length >= 4) {
      // Get the oldest non-default version
      const oldest = nonDefaultVersions.sort(
        (a, b) =>
          (a.CreateDate?.getTime() || 0) - (b.CreateDate?.getTime() || 0)
      )[0];

      // Delete the oldest non-default version
      if (oldest.VersionId) {
        await this.iam.send(
          new DeletePolicyVersionCommand({
            PolicyArn: policyArn,
            VersionId: oldest.VersionId
          })
        );

        console.log(`Deleted oldest policy version: ${oldest.VersionId}`);
      }
    }
  }

  /**
   * Create or update a policy
   *
   * @param policy - The policy definition
   * @returns The ARN of the policy
   */
  private async createOrUpdatePolicy(policy: PolicyDefinition): Promise<string> {
    // Get the ARN of the policy by name
    const policyArn = await this.getPolicyArnByName(policy.name);

    // Create or update the policy that created by user
    if (policyArn) {
      // Check if the policy document is change or not
      const hasChanges = await this.hasChangesPolicy(policyArn, policy.document);

      if (!hasChanges) {
        console.log(`Policy '${policy.name}' is not changed.`);

        return policyArn;
      }

      // Delete the oldest non-default version
      await this.deleteOldestNonDefaultVersion(policyArn);

      // Create a new version of the policy
      await this.iam.send(
        new CreatePolicyVersionCommand({
          PolicyArn: policyArn,
          PolicyDocument: JSON.stringify(policy.document),
          SetAsDefault: true
        })
      );

      console.log(`Updated policy version for '${policy.name}'`);

      return policyArn;
    }

    // Create new policy if it doesn't exist
    const result = await this.iam.send(
      new CreatePolicyCommand({
        PolicyName: policy.name,
        PolicyDocument: JSON.stringify(policy.document)
      })
    );

    const arn = result.Policy?.Arn;

    if (!arn) {
      throw new Error(`Failed to create policy '${policy.name}'`);
    }

    console.log(`Created new policy '${policy.name}'`);

    return arn;
  }

  /**
   * Attach a policy to an IAM user
   *
   * @param userName - The name of the user to attach the policy to
   * @param policyArn - The ARN of the policy to attach
   */
  private async attachPolicyToUser(
    userName: string,
    policyArn: string
  ): Promise<void> {
    // List all attached policies to the user
    const result = await this.iam.send(
      new ListAttachedUserPoliciesCommand({ UserName: userName })
    );

    // Check if the policy is already attached to the user
    const attached = result.AttachedPolicies?.find(p => p.PolicyArn === policyArn);
    if (attached) {
      console.log(`Policy already attached to user: ${userName}`);
      return;
    }

    // Attach the policy to the user
    await this.iam.send(
      new AttachUserPolicyCommand({
        UserName: userName,
        PolicyArn: policyArn
      })
    );

    console.log(`Attached policy to user: ${userName}`);
  }

  /**
   * Create and apply policies to an IAM user
   *
   * @param userName - The name of the user to apply the policies to
   * @param policies - The policies to apply to the user
   */
  public async createAndApplyPolicies(
    userName: string,
    options: {
      customPolicies?: PolicyDefinition[];
      awsManagedPolicyArns?: string[];
    }
  ): Promise<void> {
    const { customPolicies, awsManagedPolicyArns } = options;

    if (customPolicies && customPolicies.length > 0) {
      for (const policy of customPolicies) {
        const arn = await this.createOrUpdatePolicy(policy);

        await this.attachPolicyToUser(userName, arn);
      }
    }

    if (awsManagedPolicyArns && awsManagedPolicyArns.length > 0) {
      for (const arn of awsManagedPolicyArns) {
        await this.attachPolicyToUser(userName, arn);
      }
    }
  }
}
