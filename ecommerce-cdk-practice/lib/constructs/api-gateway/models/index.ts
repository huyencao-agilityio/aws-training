import { Construct } from 'constructs';

import { RestApiModelConstructProps } from '@interfaces/construct.interface';

import { UserModelConstruct } from './user-model.construct';
import { UploadAvatarModelConstruct } from './upload-avatar-model.construct';
import { OrderModelConstruct } from './order-model.construct';
import { ProductModelConstruct } from './product-model.construct';
import {
  CommonResponseModelConstruct
} from './common-response-model.construct';

export class ModelRestApiConstruct extends Construct {
  public readonly userModelConstruct: UserModelConstruct;
  public readonly uploadAvatarModelConstruct: UploadAvatarModelConstruct;
  public readonly orderModelConstruct: OrderModelConstruct;
  public readonly productModelConstruct: ProductModelConstruct;
  public readonly commonResponseModelConstruct: CommonResponseModelConstruct;

  constructor(
    scope: Construct,
    id: string,
    props: RestApiModelConstructProps
  ) {
    super(scope, id);

    const { restApi } = props;

    // Create user model to using in API
    this.userModelConstruct = new UserModelConstruct(
      this,
      'UserModelConstruct',
      {
        restApi: restApi
      }
    );

    // Create upload avatar model
    this.uploadAvatarModelConstruct = new UploadAvatarModelConstruct(
      this,
      'UploadAvatarModelConstruct',
      {
        restApi: restApi
      }
    );

    // Create order model
    this.orderModelConstruct = new OrderModelConstruct(
      this,
      'OrderModelConstruct',
      {
        restApi: restApi
      }
    );

    // Create product model
    this.productModelConstruct = new ProductModelConstruct(
      this,
      'ProductModelConstruct',
      {
        restApi: restApi
      }
    );

    // Create common response
    this.commonResponseModelConstruct = new CommonResponseModelConstruct(
      this,
      'CommonResponseModelConstruct',
      {
        restApi: restApi
      }
    );
  }
}
