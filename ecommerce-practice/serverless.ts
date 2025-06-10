import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'ecommerce-practice',
  frameworkVersion: '4',
  useDotenv: true,
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'ap-southeast-1',
    environment: {
      DB_HOST: '${env:DB_HOST}',
      DB_PORT: '${env:DB_PORT}',
      DB_USER: '${env:DB_USERNAME}',
      DB_PASS: '${env:DB_PASSWORD}',
      DB_NAME: '${env:DB_NAME}'
    },
  },
  plugins: ['serverless-offline'],
  custom: {
    esbuild: {
      bundle: true,
      format: 'esm',
      target: 'node20',
      sourcemap: true,
      minify: false,
      platform: 'node',
      keepNames: true,
      external: ['pg', 'typeorm'],
      mainFields: ['module', 'main'],
    },
  },
  package: {
    individually: true,
  },
  functions: {
    updateUser: {
      handler: 'src/handlers/users/update-user.handler',
      events: [
        {
          http: {
            path: 'users/{userId}',
            method: 'patch',
            integration: 'lambda',
            request: {
              template: {
                'application/json': `
                  {
                    "context": {
                      "sub": "d4784488-b0e1-70a9-2ee4-9c73f4768dbd",
                      "email": "huyen.cao+1@asnet.com.vn",
                      "group": "User"
                    },
                    "userId": "$input.params('userId')",
                    "body": $input.json('$')
                  }
                `,
              },
            },
          },
        },
      ],
    },
  },
};

export default serverlessConfiguration;
