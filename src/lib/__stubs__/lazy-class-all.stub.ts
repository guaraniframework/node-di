/* istanbul ignore file */

import { Inject } from '../decorators/inject.decorator';
import { Injectable } from '../decorators/injectable.decorator';
import { LazyInjectAll } from '../decorators/lazy-inject-all.decorator';
import { LazyInterfaceAll } from './lazy-interface-all';

@Injectable()
export class LazyClassAllStub {
  @LazyInjectAll(() => 'LAZY_INTERFACE_ALL')
  public readonly lib!: LazyInterfaceAll[];

  public constructor(
    @LazyInjectAll(() => 'LAZY_INTERFACE_ALL') public readonly lia: LazyInterfaceAll[],
    @Inject('Host') public readonly host: string,
  ) {}
}
