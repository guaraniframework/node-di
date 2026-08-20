if (Reflect == null || !('getMetadata' in Reflect)) {
  throw new Error('@guarani/di requires a Reflect Metadata polyfill.');
}

// #region Decorators
export { Inject } from './lib/decorators/inject.decorator';
export { InjectAll } from './lib/decorators/inject-all.decorator';
export { Injectable } from './lib/decorators/injectable.decorator';
export { LazyInject } from './lib/decorators/lazy-inject.decorator';
export { LazyInjectAll } from './lib/decorators/lazy-inject-all.decorator';
export { Optional } from './lib/decorators/optional.decorator';
// #endregion

// #region Dependency Injection Container
export { DependencyInjectionContainer } from './lib/dependency-injection.container';
// #endregion

// #region Errors
export { DependencyInjectionError } from './lib/errors/dependency-injection.error';
export { InvalidProviderError } from './lib/errors/invalid-provider.error';
export { ResolutionError } from './lib/errors/resolution.error';
export { TokenNotRegisteredError } from './lib/errors/token-not-registered.error';
// #endregion

// #region Providers
export { type ClassProvider, isClassProvider } from './lib/providers/class/class.provider';
export { type FactoryProvider, isFactoryProvider } from './lib/providers/factory/factory.provider';
export { isProvider, type Provider } from './lib/providers/provider';
export { isTokenProvider, type TokenProvider } from './lib/providers/token/token.provider';
export { isValueProvider, type ValueProvider } from './lib/providers/value/value.provider';
// #endregion

// #region Types
export { type Factory } from './lib/types/factory.type';
export { type InjectableToken, isInjectableToken } from './lib/types/injectable-token.type';
export { Lifecycle } from './lib/types/lifecycle.enum';
// #endregion
