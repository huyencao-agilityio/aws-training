import { a } from '@aws-amplify/data-schema';
import { configure } from '@aws-amplify/data-schema/internals';
import { secret } from '@aws-amplify/backend';

export const schema = configure({
  database: {
    identifier: 'IDVXgFNnAjGHJjLjM49YbLg',
    engine: 'postgresql',
    connectionUri: secret('DATABASE_URL'),
    vpcConfig: {
      vpcId: 'vpc-0da883060850306de',
      securityGroupIds: [
        'sg-05f1e17447314f6fd'
      ],
      subnetAvailabilityZones: [
        {
          subnetId: 'subnet-02a815ef3faea2c39',
          availabilityZone: 'us-east-1a'
        },
        {
          subnetId: 'subnet-0b991c1f176a21cfe',
          availabilityZone: 'us-east-1b'
        }
      ]
    }
  }
}).schema({
  'cart_items': a.model({
    id: a.string().required(),
    cart_id: a.string().required(),
    product_id: a.string().required(),
    quantity: a.integer().required(),
    created_at: a.datetime().required(),
    updated_at: a.datetime().required()
  }).identifier([
    'id'
  ]),
  'carts': a.model({
    id: a.string().required(),
    owner_id: a.string().required(),
    created_at: a.datetime().required(),
    updated_at: a.datetime().required()
  }).identifier([
    'id'
  ]),
  'order_items': a.model({
    id: a.string().required(),
    quantity: a.integer().required(),
    amount: a.integer().required(),
    order_id: a.string().required(),
    product_id: a.string().required(),
    created_at: a.datetime().required(),
    updated_at: a.datetime().required()
  }).identifier([
    'id'
  ]),
  'orders': a.model({
    id: a.string().required(),
    owner_id: a.string().required(),
    amount: a.integer().required(),
    quantity: a.integer().required(),
    status: a.string().required(),
    completed_at: a.datetime(),
    created_at: a.datetime().required(),
    updated_at: a.datetime().required()
  }).identifier([
    'id'
  ]),
  'products': a.model({
    id: a.string().required(),
    name: a.string().required(),
    description: a.string().required(),
    quantity: a.integer().required(),
    price: a.integer().required(),
    created_at: a.datetime().required(),
    updated_at: a.datetime().required()
  }).identifier([
    'id'
  ]),
  'users': a.model({
    id: a.string().required(),
    name: a.string().required(),
    email: a.string().required(),
    google_id: a.string(),
    facebook_id: a.string(),
    address: a.string(),
    avatar: a.string(),
    thumbnail: a.string(),
    created_at: a.datetime().required(),
    updated_at: a.datetime().required()
  }).identifier([
    'id'
  ])
});
