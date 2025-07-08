import path from 'path';
import { fileURLToPath } from 'url';

import { defineFunction } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';

import { buildResourceName } from '../../utils/resource.utils';
import { SecretHelper } from '../../utils/secret.utils';
import { PolicyHelper } from '../../utils/policy.utils';
import {
  EXTERNAL_MODULES
} from '../../shared/constants/external-modules.constant';
import {
  ParameterKeys
} from '../../shared/constants/parameter-keys.constant';
import {
  ResourceGroupName
} from '../../shared/enums/resource-group-name.enum';
import {
  DEFAULT_LAMBDA_HANDLER,
  ENTRY_PATH
} from '../../shared/constants/lambda.constant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Define a weekly report Lambda function
 *
 * @param scope - The scope of the stack
 * @returns The weekly report Lambda function
 */
function weeklyReportFn (scope: Construct) {
  // Get env from parameter store
  const secretName = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.SecretName
  );
  const defaultEmailAddress = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.DefaultEmailAddress
  )
  const adminEmailAddress = SecretHelper.getPlainTextParameter(
    scope,
    ParameterKeys.AdminEmailAddress
  );
  const schedule = process.env.SCHEDULE_EXPRESSIONS || 'cron(0 0 ? * 1 *)';

  // Create a weekly report Lambda function
  const lambdaFn = new NodejsFunction(scope, 'WeeklyReportLambda', {
    handler: DEFAULT_LAMBDA_HANDLER,
    runtime: Runtime.NODEJS_22_X,
    entry: path.join(__dirname, ENTRY_PATH),
    functionName: buildResourceName('weekly-report'),
    bundling: {
      externalModules: EXTERNAL_MODULES,
    },
    timeout: Duration.minutes(3),
    environment: {
      SECRET_NAME: secretName,
      DEFAULT_EMAIL_ADDRESS: defaultEmailAddress,
      ADMIN_EMAIL_ADDRESS: adminEmailAddress
    }
  });

  // Add a policy statement to the Lambda function
  lambdaFn.addToRolePolicy(
    PolicyHelper.allowSecretManagerGetValue(scope, secretName)
  );

  lambdaFn.addToRolePolicy(
    PolicyHelper.allowSesSendEmail(scope, defaultEmailAddress)
  );

  // Create target for the rule
  const lambdaTarget = new LambdaFunction(lambdaFn);
  // Create a rule with schedule
  const rule = new Rule(lambdaFn, 'WeeklyReportRule', {
    schedule: Schedule.expression(schedule),
  });

  // Add target to the rule
  rule.addTarget(lambdaTarget);

  return lambdaFn;
}

/**
 * Define a weekly report Lambda function for the Amplify backend
 */
export const weeklyReport = defineFunction(
  (scope: Construct) => weeklyReportFn(scope),
  {
    resourceGroupName: ResourceGroupName.JOBS,
  }
);
