# Hermes JS

A small and lightweight http/https library that allows for the use of the blazing fast and powerful [uNetworking](https://github.com/uNetworking)'s [**μWebSockets.js**](https://github.com/uNetworking/uWebSockets.js) server building C++/Typescript library in an easier more friendly way.

#### Installation
```npm install @miguel-pm/hermes.js```

#### Usage
This library exposes a function that expects a router function and has some options:

- router: A router function which will be called to handle the routes that the server will receive. Defined by the `RouterFunction` interface will receive the dependencies object and a `RequestData` object. The return value has to be of the type `RouterResponse` ({ status: number, message?: string, responseType?: 'json' | 'text' })
- deps (optional, default => { logger: console }): A dependencies object to inject into the provided router function.
- port (optional, default => 3000).
- app (optional, default => μWebSockets.js' TemplatedApp Http object): Will accept variations from the same library like the `SSLApp` function TemplatedApp response

#### Example

```
import hermes, { RouterFunction } from '@miguel-pm/hermes.js'

const routerFunction: RouterFunction = (deps, reqData) => {
  // If nothing is provided defaults to console
  const { logger } = deps

  const {
    method,
    route,
    queryParams,
    body,
    headers
  } = reqData

  logger.info('Request received!')
  if (route === 'helo_world' && method === 'GET') {
    return {
      status: 200,
      message: 'Hello, World!', // Optional
      responseType: 'json' // Optional
    }
  }

  // 404
  return { status: 404 }
}
