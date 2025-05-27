import {
  IModel,
  IntegrationResponse,
  IRestApi,
  MethodResponse,
  Model,
  RequestValidator,
  RequestValidatorOptions,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

import { HttpStatusCode } from '@enums/http-status-code.enum';

/**
 * Base class for API method constructs
 */
export abstract class BaseApiMethodConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }

  /**
   * Create the integration response for API
   *
   * @param errorStatusCodes - The list of error status codes
   * @returns The integration response
   */
  createIntegrationResponse(
    errorStatusCodes: number[]
  ): IntegrationResponse[] {
    return [
      {
        statusCode: `${HttpStatusCode.SUCCESS}`,
      },
      ...errorStatusCodes.map(code => ({
        selectionPattern: `.*"statusCode":${code}.*`,
        statusCode: `${code}`,
        responseTemplates: {
          'application/json': '#set($inputRoot = $input.path("$"))\n$inputRoot.errorMessage'
        }
      })),
    ];
  }

  /**
   * Create the method response for API
   *
   * @param errorStatusCodes - The list of error status codes
   * @param models - The API models
   * @returns The method response
   */
  createMethodResponse(
    errorStatusCodes: number[],
    model: IModel
  ): MethodResponse[] {
    return [
      {
        statusCode: `${HttpStatusCode.SUCCESS}`,
        responseModels: {
          'application/json': model,
        },
      },
      ...errorStatusCodes.map(code => ({
        statusCode: `${code}`,
        responseModels: {
          'application/json': Model.ERROR_MODEL,
        },
      })),
    ];
  }

  /**
   * Create a request validator
   *
   * @param id - The id of the request validator
   * @param api - The rest API
   * @param options - The options for the request validator
   * @returns The request validator
   */
  createRequestValidator(
    id: string,
    api: IRestApi,
    options: RequestValidatorOptions
  ): RequestValidator {
    return new RequestValidator(this, id, {
      restApi: api,
      validateRequestBody: true,
      ...options,
    });
  }
}
