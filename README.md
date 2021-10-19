# magiqan

Powerfull library-agnostic runner based on decorators.

See the [wiki](https://github.com/magiqans/magiqan/wiki) for more information.

TODO:

- define ci
- release package to npm/github
- automatic release notes generation
- unit testing
- design high-level api/functions
- Tap reporter
- Cucumber support
- Jest support
- Mocha support
- Html reporter
- define mindmap dependencies
- cli
- more examples and usage cases

Development:

Workspace guide and cli usage described [here](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

run install script
`npm install -ws`

**NOTE**: `ws` in npm means workspace

build all packages:

`npm run build -ws` - means run build script for all workspace packages

init new package

`npm init -w ./packages/a`

Known issues:

in case of the following error:

```shell
../runner/build/runner.d.ts:82:61 - error TS2536: Type '"prototype"' cannot be used to index type 'Cls'.

82     runClassTest<Cls extends Internal.Ctor, M extends keyof Cls['prototype']>(ctor: Cls, method: M): Promise<TestResult>;
```

just ignore it :)
