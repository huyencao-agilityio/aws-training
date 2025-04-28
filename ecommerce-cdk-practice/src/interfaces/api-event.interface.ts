/**
 * Define an interface for API Gateway events
 * used by Lambda functions handling list retrieval requests
 */
export interface ListAPIEvent {
  page?: string;
  limit?: string;
  requestContext?: {
    authorizer: {
      role: string;
      principalId: string;
      user: string;
    }
  }
}
