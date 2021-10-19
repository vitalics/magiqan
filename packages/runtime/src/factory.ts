import { createWriteStream } from 'fs';

import { Kind } from '@magiqan/constants';
import type { ClassTest, FileTest } from '@magiqan/types';
import { createPrinter, EmitHint, factory, NewLineKind, SyntaxKind, Decorator } from 'typescript';

function createDecorator(decoratorName: string) {
  return factory.createDecorator(factory.createIdentifier(`${decoratorName}()`));
}

export function createClassMethod(name: string, decorators: Decorator[] = []) {
  return factory.createMethodDeclaration(
    decorators,
    [factory.createModifier(SyntaxKind.PublicKeyword)],
    undefined,
    factory.createIdentifier(name),
    undefined,
    [],
    [],
    undefined,
    factory.createBlock([]),
  );
}
export function createClassHook(name: string, kind: Kind) {
  return factory.createMethodDeclaration(
    [createDecorator(kind)],
    [factory.createModifier(SyntaxKind.PublicKeyword)],
    undefined,
    factory.createIdentifier(name),
    undefined,
    [],
    [],
    factory.createNodeArray([])[0],
    factory.createBlock([]),
  );
}

export function createClassTest(classTest: ClassTest) {
  const cls = factory.createClassDeclaration(
    [createDecorator('testable')],
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    classTest.name,
    /** generics */[],
    [],
    [
      ...(classTest.hooks!.map(hook => {
        return createClassMethod(String(hook.name), [
          createDecorator(hook.kind)]
        );
      }) || []),
      ...classTest.tests.map(test => {
        return createClassMethod(String(test.name), [
          createDecorator(test.kind)]
        );
      })
    ]);
  return cls;
}

function createImport() {
  const importNames = Object.entries(Kind).map(([name,]) => {
    return name;
  });
  return factory.createImportDeclaration(
    [],
    [],
    factory.createImportClause(false,
      factory.createIdentifier(`{ testable, ${importNames.join(', ')} }`),
      undefined
    ),
    factory.createStringLiteral('@magiqan/core')
  );
}

const printer = createPrinter({ newLine: NewLineKind.LineFeed });

export function createFileTest(file: FileTest): void {
  const stream = createWriteStream(file.path);
  const importsAsString = printer.printNode(EmitHint.Unspecified, createImport(), null as any)
  stream.write(importsAsString);
  stream.write(`\n\n`);
  file.classes.forEach(cls => {
    const node = printer.printNode(EmitHint.Unspecified, createClassTest(cls), null as any)
    stream.write(node);
  });
  stream.close();
}

// create a file with the following structure:
// createFileTest({
//   path: __dirname + '/test.ts', classes: [{
//     name: 'Test',
//     hooks: [],
//     tests: [{
//       fn: () => { console.log('demo') },
//       kind: Kind.test,
//       name: 'demo',
//       isHook: false,
//     }],
//   }]
// });
