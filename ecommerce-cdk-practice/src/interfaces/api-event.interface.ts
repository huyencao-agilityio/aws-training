export interface APIEvent {
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
