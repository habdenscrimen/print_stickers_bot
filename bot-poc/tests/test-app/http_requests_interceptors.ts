import { BatchInterceptor } from '@mswjs/interceptors/lib/BatchInterceptor'
import nodeInterceptors from '@mswjs/interceptors/lib/presets/node'

// TODO: make it customizable
export const interceptApi = () => {
  const interceptor = new BatchInterceptor({ name: 'test', interceptors: nodeInterceptors })

  interceptor.on('request', (request) => {
    if (request.url.href.includes('https://api.telegram.org')) {
      request.respondWith({ status: 200, body: JSON.stringify({ ok: true, result: true }) })
    }

    if (request.url.href === 'https://www.liqpay.ua/api/request') {
      request.respondWith({ status: 200, body: JSON.stringify({ ok: true }) })
    }
  })

  interceptor.apply()
}
