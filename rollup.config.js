import fs from 'fs'

import dts from 'rollup-plugin-dts';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const INPUT = './src/index.ts';
const LIBRARY_NAME = 'hermes';

const BASE_EXTERNAL_LIBRARIES = [
  'fp-ts/lib/Option',
  'fp-ts/lib/Either',
  '@babel/runtime/regenerator',
  '@babel/runtime/helpers/asyncToGenerator',
  '@babel/runtime/helpers/defineProperty',
  '@babel/runtime/helpers/slicedToArray'
];
const externalLibraries = () => {
  const packageJSONPath = `${__dirname}/package.json`;
  const packageContent = JSON.parse(
    fs.readFileSync(packageJSONPath).toString());
  return [...BASE_EXTERNAL_LIBRARIES, ...Object.keys(packageContent.dependencies)];
};

export default [
  {
    input: './src/index.ts',
    output: [{ file: `dist/${LIBRARY_NAME}.d.ts`, format: 'es' }],
    plugins: [dts()]
  },
  {
    input: './src/index.ts',
    output: [
      {
        format: 'cjs',
        file: `./dist/${LIBRARY_NAME}.js`,
        exports: 'auto'
      },
      {
        format: 'es',
        file: `./dist/${LIBRARY_NAME}.es.js`,
        exports: 'auto'
      }
    ],
    external: externalLibraries(),
    plugins: [
      resolve({
        jsnext: true,
        extensions: ['.ts']
      }),
      commonjs(),
      babel({
        extensions: ['.ts'],
        runtimeHelpers: true,
        include: ['src/**/*', 'src/*']
      })
    ]
  }
];
