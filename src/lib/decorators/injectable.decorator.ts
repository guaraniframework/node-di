import { PARAM_TOKENS, PARAM_TYPES } from '../metadata/metadata.keys';
import { TokenDescriptor } from '../metadata/token.descriptor';
import { AbstractConstructor } from '../types/abstract-constructor.interface';
import { Constructor } from '../types/constructor.interface';

/**
 * Marks the decorated class as an Injectable Token to be resolved by the Dependency Injection Container.
 */
export function Injectable(): ClassDecorator {
  return function (target: AbstractConstructor<object> | Constructor<object>): void {
    // Constructor
    const designParamTypes: any[] = Reflect.getMetadata('design:paramtypes', target) ?? [];
    const paramTokenDescriptors: Map<string | symbol | number, TokenDescriptor<any>> = Reflect.getMetadata(
      PARAM_TOKENS,
      target,
    ) ?? new Map<string | symbol | number, TokenDescriptor<any>>();

    const paramTypesDescriptors: TokenDescriptor<any>[] = designParamTypes.map((designParamType, index) => {
      const tokenDescriptor = paramTokenDescriptors.get(index) ?? <TokenDescriptor<any>>{};

      tokenDescriptor.token ??= designParamType;
      tokenDescriptor.multiple ??= false;
      tokenDescriptor.optional ??= false;

      return tokenDescriptor;
    });

    Reflect.defineMetadata(PARAM_TYPES, paramTypesDescriptors, target);
  };
}
