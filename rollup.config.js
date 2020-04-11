import dts from 'rollup-plugin-dts'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const INPUT = './src/index.ts'
const LIBRARY_NAME = 'hermes'

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
        file: `./dist/${LIBRARY_NAME}.js`
      },
      {
        format: 'es',
        file: `./dist/${LIBRARY_NAME}.es.js`
      }
    ],
    external: ['uWebSockets.js'],
    plugins: [
      resolve({
        jsnext: true,
        extensions: ['.ts']
      }),
      commonjs(),
      babel({
        extensions: ['.ts'],
        include: ['src/**/*', 'src/*']
      })
    ]
  }
]
