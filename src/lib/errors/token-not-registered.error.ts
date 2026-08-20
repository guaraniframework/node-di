import { InjectableToken } from '../types/injectable-token.type';
import { DependencyInjectionError } from './dependency-injection.error';

/**
 * Thrown when a Token is not registered at the Dependency Injection Container.
 */
export class TokenNotRegisteredError<T> extends DependencyInjectionError {
  /**
   * Thrown when the provided Token is not registered at the Dependency Injection Container.
   *
   * @param token Token not registered in the Dependency Injection Container.
   */
  public constructor(token: InjectableToken<T>, options?: ErrorOptions) {
    const tokenName = typeof token === 'function' ? token.name : String(token);
    const message = `The Token "${tokenName}" is not registered.`;

    super(message, options);
  }
}
