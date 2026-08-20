import { LazyClass01Stub } from './__stubs__/lazy-class-01.stub';
import { LazyClass02Stub } from './__stubs__/lazy-class-02.stub';
import { LazyClass03Stub } from './__stubs__/lazy-class-03.stub';
import { LazyClass04Stub } from './__stubs__/lazy-class-04.stub';
import { LazyClassAllStub } from './__stubs__/lazy-class-all.stub';
import { LazyClassAll01Stub } from './__stubs__/lazy-class-all-01.stub';
import { LazyClassAll02Stub } from './__stubs__/lazy-class-all-02.stub';
import { LazyInterfaceAll } from './__stubs__/lazy-interface-all';
import { ProviderBinding } from './bindings/provider/provider.binding';
import { Inject } from './decorators/inject.decorator';
import { InjectAll } from './decorators/inject-all.decorator';
import { Injectable } from './decorators/injectable.decorator';
import { Optional } from './decorators/optional.decorator';
import { InvalidProviderError } from './errors/invalid-provider.error';
import { TokenNotRegisteredError } from './errors/token-not-registered.error';
import { DependencyInjectionContainer, getContainer } from './dependency-injection.container';

const TOKEN = Symbol('TOKEN');

describe('Dependency Injection Container', () => {
  let container: DependencyInjectionContainer;

  beforeEach(() => {
    container = new DependencyInjectionContainer();
  });

  describe('bind()', () => {
    it('should register a token at the container.', () => {
      expect(container['registry'].has(TOKEN)).toBeFalse();
      expect(container.bind(TOKEN)).toBeInstanceOf(ProviderBinding);
      expect(container['registry'].has(TOKEN)).toBeTrue();
    });
  });

  describe('isRegistered()', () => {
    it('should return false when a token is not registered at the container.', () => {
      expect(container.isRegistered(TOKEN)).toBeFalse();
    });

    it('should return true when a token is registered at the container.', () => {
      container.bind(TOKEN).toValue('TOKEN_VALUE');
      expect(container.isRegistered(TOKEN)).toBeTrue();
    });
  });

  describe('resolve()', () => {
    it('should reject when the token is not registered.', () => {
      class Foo {}

      expect(() => container.resolve(Foo)).toThrowWithMessage(
        TokenNotRegisteredError,
        'The Token "Foo" is not registered.',
      );

      expect(() => container.resolve('Unbound')).toThrowWithMessage(
        TokenNotRegisteredError,
        'The Token "Unbound" is not registered.',
      );
    });

    it('should resolve a value provider.', () => {
      container.bind<string>('Issuer').toValue('https://example.com');
      expect(container.resolve<string>('Issuer')).toEqual('https://example.com');
    });

    it('should resolve a token provider.', () => {
      container.bind<string>('Issuer').toValue('https://example.com');
      container.bind<string>('NewIssuer').toToken('Issuer');

      expect(container.resolve<string>('NewIssuer')).toEqual('https://example.com');
    });

    it('should resolve a factory provider.', () => {
      const user = { name: 'John Doe' };
      container.bind<string>('Name').toFactory(() => user.name);
      expect(container.resolve<string>('Name')).toEqual('John Doe');
    });

    it('should throw when resolving a class not marked as injectable.', () => {
      class Foo {}

      container.bind(Foo).toSelf();

      expect(() => container.resolve(Foo)).toThrowWithMessage(
        InvalidProviderError,
        'The object "Foo" is not a valid Provider.',
      );
    });

    it('should resolve a class provider.', () => {
      @Injectable()
      class Foo {}

      container.bind(Foo).toSelf();

      expect(container.resolve(Foo)).toBeInstanceOf(Foo);
    });

    it('should resolve an abstract class provider.', () => {
      abstract class Foo {}

      @Injectable()
      class Foo1 extends Foo {}

      container.bind(Foo).toClass(Foo1);

      expect(container.resolve(Foo)).toBeInstanceOf(Foo);
      expect(container.resolve(Foo)).toBeInstanceOf(Foo1);
    });

    it('should resolve multiple value requests to the same value.', () => {
      @Injectable()
      class Foo {}

      container.bind(Foo).toValue(new Foo());

      expect(container.resolve(Foo)).toBeInstanceOf(Foo);

      const foo1 = container.resolve(Foo);
      const foo2 = container.resolve(Foo);

      expect(foo1).toBe(foo2);
    });

    it('should resolve multiple assignments to the last one.', () => {
      interface Foo {}

      @Injectable()
      class Foo1 implements Foo {}

      @Injectable()
      class Foo2 implements Foo {}

      container.bind<Foo>('Foo').toClass(Foo1);
      container.bind<Foo>('Foo').toClass(Foo2);

      expect(container.resolve<Foo>('Foo')).toBeInstanceOf(Foo2);
    });

    it('should inject a dependency into the constructor.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        public constructor(public readonly foo: Foo) {}
      }

      container.bind(Foo).toSelf();
      container.bind(Bar).toSelf();

      let bar!: Bar;

      expect(() => (bar = container.resolve(Bar))).not.toThrow();

      expect(bar).toBeInstanceOf(Bar);
      expect(bar.foo).toBeInstanceOf(Foo);
    });

    it('should inject a dependency into the constructor using the @Inject() decorator.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        public constructor(@Inject() public readonly foo: Foo) {}
      }

      container.bind(Foo).toSelf();
      container.bind(Bar).toSelf();

      let bar!: Bar;

      expect(() => (bar = container.resolve(Bar))).not.toThrow();

      expect(bar).toBeInstanceOf(Bar);
      expect(bar.foo).toBeInstanceOf(Foo);
    });

    it('should inject an array of dependencies into the constructor.', () => {
      @Injectable()
      class Bar {
        public constructor(@InjectAll('Value') public readonly values: string[]) {}
      }

      container.bind('Value').toValue('Value1');
      container.bind('Value').toValue('Value2');

      container.bind(Bar).toSelf();

      let bar!: Bar;

      expect(() => (bar = container.resolve(Bar))).not.toThrow();

      expect(bar).toBeInstanceOf(Bar);

      expect(bar.values).toBeArrayOfSize(2);
      expect(bar.values).toSatisfyAll((value) => typeof value === 'string');

      expect(bar.values[0]!).toBe('Value1');
      expect(bar.values[1]!).toBe('Value2');
    });

    it('should inject a dependency into a property of the class.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        @Inject()
        public static readonly staticFoo: Foo;

        @Inject()
        public readonly foo!: Foo;
      }

      container.bind(Foo).toSelf();
      container.bind(Bar).toSelf();

      let bar!: Bar;

      expect(() => (bar = container.resolve(Bar))).not.toThrow();

      expect(bar).toBeInstanceOf(Bar);
      expect(bar.foo).toBeInstanceOf(Foo);
      expect(Bar.staticFoo).toBeInstanceOf(Foo);
    });

    it('should inject an array of dependencies into a property of the class.', () => {
      @Injectable()
      class Bar {
        @InjectAll('Value')
        public static readonly staticValues: string[];

        @InjectAll('Value')
        public readonly values!: string[];
      }

      container.bind('Value').toValue('Value1');
      container.bind('Value').toValue('Value2');

      container.bind(Bar).toSelf();

      let bar!: Bar;

      expect(() => (bar = container.resolve(Bar))).not.toThrow();

      expect(bar).toBeInstanceOf(Bar);

      expect(bar.values).toBeArrayOfSize(2);
      expect(bar.values).toSatisfyAll((value) => typeof value === 'string');

      expect(bar.values[0]!).toBe('Value1');
      expect(bar.values[1]!).toBe('Value2');

      expect(Bar.staticValues).toBeArrayOfSize(2);
      expect(Bar.staticValues).toSatisfyAll((value) => typeof value === 'string');

      expect(Bar.staticValues[0]!).toBe('Value1');
      expect(Bar.staticValues[1]!).toBe('Value2');
    });

    it('should inject a dependency based on the provided token over the inferred type.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {}

      @Injectable()
      class Baz {
        public constructor(@Inject(Bar) public readonly foo: Foo) {}
      }

      container.bind(Foo).toSelf();
      container.bind(Bar).toSelf();
      container.bind(Baz).toSelf();

      let baz!: Baz;

      expect(() => (baz = container.resolve(Baz))).not.toThrow();

      expect(baz).toBeInstanceOf(Baz);
      expect(baz.foo).toBeInstanceOf(Bar);
    });

    it('should inject a dependency based on the provided token.', () => {
      @Injectable()
      class Foo {
        public constructor(@Inject('Issuer') public readonly issuer: string) {}
      }

      container.bind(Foo).toSelf();
      container.bind<string>('Issuer').toValue('https://example.com');

      let foo!: Foo;

      expect(() => (foo = container.resolve(Foo))).not.toThrow();

      expect(foo).toBeInstanceOf(Foo);
      expect(foo.issuer).toEqual('https://example.com');
    });

    it('should inject "undefined" when a token is not registered and the constructor descriptor is marked as optional.', () => {
      @Injectable()
      class Foo {
        public constructor(
          @Inject('Issuer') public readonly issuer: string,
          @Optional() @Inject('Value') public readonly value?: number,
        ) {}
      }

      container.bind(Foo).toSelf();
      container.bind<string>('Issuer').toValue('https://example.com');

      let foo!: Foo;

      expect(() => (foo = container.resolve(Foo))).not.toThrow();

      expect(foo).toBeInstanceOf(Foo);
      expect(foo.issuer).toEqual('https://example.com');
      expect(foo.value).toBeUndefined();
    });

    it('should inject "undefined" when a token is not registered and the property descriptor is marked as optional.', () => {
      @Injectable()
      class Foo {
        @Optional()
        @Inject('Value')
        public static readonly staticValue?: number;

        @Optional()
        @Inject('Value')
        public readonly value?: number;

        public constructor(@Inject('Issuer') public readonly issuer: string) {}
      }

      container.bind(Foo).toSelf();
      container.bind<string>('Issuer').toValue('https://example.com');

      let foo!: Foo;

      expect(() => (foo = container.resolve(Foo))).not.toThrow();

      expect(foo).toBeInstanceOf(Foo);
      expect(foo.issuer).toEqual('https://example.com');
      expect(foo.value).toBeUndefined();
      expect(Foo.staticValue).toBeUndefined();
    });

    it('should correctly resolve when injecting circular dependencies with the @LazyInject() decorator.', () => {
      let l1!: LazyClass01Stub;
      let l2!: LazyClass02Stub;

      container.bind<string>('Host').toValue('https://example.com');
      container.bind(LazyClass01Stub).toSelf();
      container.bind(LazyClass02Stub).toSelf();

      expect(() => (l1 = container.resolve(LazyClass01Stub))).not.toThrow();
      expect(() => (l2 = container.resolve(LazyClass02Stub))).not.toThrow();

      expect(l1.l2).toBeInstanceOf(LazyClass02Stub);
      expect(l2.l1).toBeInstanceOf(LazyClass01Stub);
    });

    it('should inject "undefined" when injecting optional circular dependencies with the @LazyInject() decorator.', () => {
      let l3!: LazyClass03Stub;
      let l4!: LazyClass04Stub;

      container.bind<string>('Host').toValue('https://example.com');
      container.bind(LazyClass03Stub).toSelf();
      container.bind(LazyClass04Stub).toSelf();

      expect(() => (l3 = container.resolve(LazyClass03Stub))).not.toThrow();
      expect(() => (l4 = container.resolve(LazyClass04Stub))).not.toThrow();

      expect(l3.l4).toBeUndefined();
      expect(l4.l3).toBeUndefined();
    });

    it('should correctly resolve when injecting circular dependencies with the @LazyInjectAll() decorator.', () => {
      let lcas!: LazyClassAllStub;

      container.bind<string>('Host').toValue('https://example.com');
      container.bind<LazyInterfaceAll>('LAZY_INTERFACE_ALL').toClass(LazyClassAll01Stub);
      container.bind<LazyInterfaceAll>('LAZY_INTERFACE_ALL').toClass(LazyClassAll02Stub);
      container.bind(LazyClassAllStub).toSelf();

      expect(() => (lcas = container.resolve(LazyClassAllStub))).not.toThrow();

      expect(lcas.lia).toBeArrayOfSize(2);
      expect(lcas.lib).toBeArrayOfSize(2);

      expect(lcas.lia).toEqual<LazyInterfaceAll[]>([
        expect.objectContaining<LazyInterfaceAll>({ name: 'lazy_class_all_01', lcas, host: 'https://example.com' }),
        expect.objectContaining<LazyInterfaceAll>({ name: 'lazy_class_all_02', lcas, host: 'https://example.com' }),
      ]);

      expect(lcas.lib).toEqual<LazyInterfaceAll[]>([
        expect.objectContaining<LazyInterfaceAll>({ name: 'lazy_class_all_01', lcas, host: 'https://example.com' }),
        expect.objectContaining<LazyInterfaceAll>({ name: 'lazy_class_all_02', lcas, host: 'https://example.com' }),
      ]);

      expect(lcas.lia[0]!.lcas).toEqual<LazyClassAllStub>(
        expect.objectContaining<LazyClassAllStub>({
          lia: lcas.lia,
          lib: lcas.lib,
          host: 'https://example.com',
        }),
      );

      expect(lcas.lia[1]!.lcas).toEqual<LazyClassAllStub>(
        expect.objectContaining<LazyClassAllStub>({
          lia: lcas.lia,
          lib: lcas.lib,
          host: 'https://example.com',
        }),
      );

      expect(lcas.lib[0]!.lcas).toEqual<LazyClassAllStub>(
        expect.objectContaining<LazyClassAllStub>({
          lia: lcas.lia,
          lib: lcas.lib,
          host: 'https://example.com',
        }),
      );

      expect(lcas.lib[1]!.lcas).toEqual<LazyClassAllStub>(
        expect.objectContaining<LazyClassAllStub>({
          lia: lcas.lia,
          lib: lcas.lib,
          host: 'https://example.com',
        }),
      );
    });

    it('should always resolve a singleton token to the same instance.', () => {
      @Injectable()
      class Foo {}

      container.bind(Foo).toSelf().asSingleton();
      expect(container['registry']['bindings'].get(Foo)?.at(-1)?.singleton).toBeUndefined();

      const foo1 = container.resolve(Foo);
      expect(container['registry']['bindings'].get(Foo)?.at(-1)?.singleton).toBe(foo1);

      const foo2 = container.resolve(Foo);
      expect(container['registry']['bindings'].get(Foo)?.at(-1)?.singleton).toBe(foo1);

      expect(foo1).toBe(foo2);
    });

    it('should resolve a request token to the same instance on the same resolution chain.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        public constructor(public readonly foo: Foo) {}
      }

      @Injectable()
      class Baz {
        public constructor(
          public readonly foo: Foo,
          public readonly bar: Bar,
        ) {}
      }

      container.bind(Foo).toSelf().asRequest();
      container.bind(Bar).toSelf().asRequest();
      container.bind(Baz).toSelf().asRequest();

      const baz1 = container.resolve(Baz);
      const baz2 = container.resolve(Baz);

      expect(baz1.foo).toBe(baz1.bar.foo);
      expect(baz2.foo).toBe(baz2.bar.foo);

      expect(baz1.foo).not.toBe(baz2.foo);
      expect(baz1.bar.foo).not.toBe(baz2.bar.foo);
    });

    it('should resolve a transient token to a new instance on every resolution.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        public constructor(public readonly foo: Foo) {}
      }

      @Injectable()
      class Baz {
        public constructor(
          public readonly foo: Foo,
          public readonly bar: Bar,
        ) {}
      }

      container.bind(Foo).toSelf().asTransient();
      container.bind(Bar).toSelf().asTransient();
      container.bind(Baz).toSelf().asTransient();

      const baz1 = container.resolve(Baz);
      const baz2 = container.resolve(Baz);

      expect(baz1.foo).not.toBe(baz1.bar.foo);
      expect(baz2.foo).not.toBe(baz2.bar.foo);

      expect(baz1.foo).not.toBe(baz2.bar.foo);
      expect(baz2.foo).not.toBe(baz1.bar.foo);

      expect(baz1.foo).not.toBe(baz2.foo);
      expect(baz1.bar.foo).not.toBe(baz2.bar.foo);
    });

    it('should inject a singleton dependency into a request resolution.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        public constructor(public readonly foo: Foo) {}
      }

      container.bind(Foo).toSelf();
      container.bind(Bar).toSelf().asRequest();

      const bar1 = container.resolve(Bar);
      const bar2 = container.resolve(Bar);

      expect(bar1.foo).toBe(bar2.foo);
    });

    it('should inject a singleton dependency into a transient resolution.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        public constructor(public readonly foo: Foo) {}
      }

      container.bind(Foo).toSelf();
      container.bind(Bar).toSelf().asTransient();

      const bar1 = container.resolve(Bar);
      const bar2 = container.resolve(Bar);

      expect(bar1.foo).toBe(bar2.foo);
    });

    it('should inject a request dependency into a transient resolution.', () => {
      @Injectable()
      class Foo {}

      @Injectable()
      class Bar {
        public constructor(public readonly foo: Foo) {}
      }

      @Injectable()
      class Baz {
        public constructor(
          public readonly foo: Foo,
          public readonly bar: Bar,
        ) {}
      }

      container.bind(Foo).toSelf().asRequest();
      container.bind(Bar).toSelf().asRequest();
      container.bind(Baz).toSelf().asTransient();

      const baz1 = container.resolve(Baz);
      const baz2 = container.resolve(Baz);

      expect(baz1.foo).toBe(baz1.bar.foo);
      expect(baz1.foo).not.toBe(baz2.foo);
    });

    it('should inject all the instances of a token.', () => {
      interface Foo {}

      @Injectable()
      class Foo1 implements Foo {}

      @Injectable()
      class Foo2 implements Foo {}

      @Injectable()
      class Bar {
        public constructor(@InjectAll('Foo') public readonly foos: Foo[]) {}
      }

      container.bind<Foo>('Foo').toClass(Foo1);
      container.bind<Foo>('Foo').toClass(Foo2);
      container.bind(Bar).toSelf();

      let bar!: Bar;

      expect(() => (bar = container.resolve(Bar))).not.toThrow();

      expect(bar.foos).toBeArrayOfSize(2);

      expect(bar.foos[0]).toBeInstanceOf(Foo1);
      expect(bar.foos[1]).toBeInstanceOf(Foo2);
    });
  });

  // TODO: Add more thorough tests.
  describe('resolveAll()', () => {
    it('should reject when the token is not registered.', () => {
      expect(() => container.resolveAll('Unbound')).toThrowWithMessage(
        TokenNotRegisteredError,
        'The Token "Unbound" is not registered.',
      );
    });
  });

  describe('delete()', () => {
    it('should ignore when removing an unregistered token from the container.', () => {
      expect(() => container.delete(TOKEN)).not.toThrow();
      expect(container['registry'].has(TOKEN)).toBeFalse();
    });

    it('should remove a token from the container.', () => {
      container.bind(TOKEN);
      expect(container['registry'].has(TOKEN)).toBeTrue();

      container.delete(TOKEN);
      expect(container['registry'].has(TOKEN)).toBeFalse();
    });
  });

  describe('clear()', () => {
    it('should remove all tokens from the container.', () => {
      container.bind('Foo').toValue('Foo');
      container.bind('Bar').toValue('Bar');
      container.bind('Baz').toValue('Baz');

      expect(container['registry']['bindings'].size).toBe(3);

      container.clear();

      expect(container['registry']['bindings']).toBeEmpty();
    });
  });
});

describe('getContainer()', () => {
  let defaultContainer: DependencyInjectionContainer;
  let customContainer: DependencyInjectionContainer;

  it('should return the default container.', () => {
    defaultContainer = getContainer();
    expect(defaultContainer).toBeInstanceOf(DependencyInjectionContainer);
  });

  it('should return a custom container.', () => {
    customContainer = getContainer('custom');

    expect(customContainer).toBeInstanceOf(DependencyInjectionContainer);
    expect(customContainer).not.toBe(defaultContainer);
  });
});
