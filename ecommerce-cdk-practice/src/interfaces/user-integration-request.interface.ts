/**
 * Define interface for integration request in user API
 */
export interface UserIntegrationRequest {
  context: {
    group: string;
    sub: string;
  };
  userId: string;
  body: {
    [key: string]: any;
  };
}
