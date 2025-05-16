export const LAMBDA_PATH = {
  USERS: '../../../../src/lambda-handler/api/users',
  PRODUCTS: '../../../../src/lambda-handler/api/products',
  ORDERS: '../../../../src/lambda-handler/api/orders',
  AUTH: '../../../../src/lambda-handler/api/auth',
  COGNITO: '../../../../src/lambda-handler/cognito',
  CLOUDFRONT: '../../../../src/lambda-handler/cloudfront',
  EVENT_BRIDGE: '../../../../src/lambda-handler/event-bridge',
  QUEUE: '../../../../src/lambda-handler/queue',
}

export const DEFAULT_LAMBDA_HANDLER = 'index.handler';

export const LAMBDA_FUNCTION_NAME = {
  API_UPDATE_USER: 'cdk-api-update-user',
  API_UPLOAD_AVATAR: 'cdk-api-upload-avatar',
  API_LAMBDA_AUTHENTICATION: 'cdk-api-lambda-authentication',
  API_ORDER_PRODUCT: 'cdk-api-order-product',
  API_ACCEPT_ORDER: 'cdk-api-accept-order',
  API_REJECT_ORDER: 'cdk-api-reject-order',
  API_GET_PRODUCTS: 'cdk-api-get-products',
  CLOUDFRONT_RESIZE_IMAGE: 'cdk-cloudfront-resize-image',
  COGNITO_CREATE_AUTH: 'cdk-cognito-create-auth-challenge',
  COGNITO_DEFINE_AUTH: 'cdk-cognito-define-auth-challenge',
  COGNITO_VERIFY_AUTH: 'cdk-cognito-verify-auth-challenge',
  COGNITO_CUSTOM_MESSAGE: 'cdk-cognito-custom-message',
  COGNITO_POST_CONFIRMATION: 'cdk-cognito-post-confirmation',
  COGNITO_PRE_SIGNUP: 'cdk-cognito-pre-signup',
  EVENT_BRIDGE_WEEKLY_REPORT: 'cdk-event-bridge-weekly-report',
  QUEUE: 'cdk-queue'
};
