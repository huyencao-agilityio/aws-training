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
  API_UPDATE_USER: 'api-update-user',
  API_UPLOAD_AVATAR: 'api-upload-avatar',
  API_LAMBDA_AUTHENTICATION: 'api-lambda-authentication',
  API_ORDER_PRODUCT: 'api-order-product',
  API_ACCEPT_ORDER: 'api-accept-order',
  API_REJECT_ORDER: 'api-reject-order',
  API_GET_PRODUCTS: 'api-get-products',
  CLOUDFRONT_RESIZE_IMAGE: 'cloudfront-resize-image',
  COGNITO_CREATE_AUTH: 'cognito-create-auth-challenge',
  COGNITO_DEFINE_AUTH: 'cognito-define-auth-challenge',
  COGNITO_VERIFY_AUTH: 'cognito-verify-auth-challenge',
  COGNITO_CUSTOM_MESSAGE: 'cognito-custom-message',
  COGNITO_POST_CONFIRMATION: 'cognito-post-confirmation',
  COGNITO_PRE_SIGNUP: 'cognito-pre-signup',
  EVENT_BRIDGE_WEEKLY_REPORT: 'event-bridge-weekly-report',
  QUEUE: 'queue'
};
