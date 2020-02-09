import babel from 'rollup-plugin-babel'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: './src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [json(), dts()]
  },
  {
    input: './src/index.ts',
    output: [
      {
        format: 'cjs',
        file: './dist/index.js'
      },
      {
        format: 'es',
        file: './dist/index.es.js'
      }
    ],
    external: ['uWebSockets.js'],
    plugins: [
      json(),
      resolve({ extensions: ['.js', '.ts'] }),
      commonjs(),
      babel({
        runtimeHelpers: true,
        extensions: ['.js', '.ts'],
        include: ['src/**/*']
      })
    ]
  }
]
