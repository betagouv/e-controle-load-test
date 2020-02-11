import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Counter, Rate } from 'k6/metrics'
import { login } from './utils.js'


const serverUrl = `${__ENV.K6_HOST}`

const errorCounter200 = new Counter('errors_status_200_OK')
const rateStatus200 = new Rate('rate_status_200_OK')
const errorCounterDuration = new Counter('errors_transaction_time_OK')

export let options = {
  vus: 300,
  duration: '5m',
}


export function setup() {
  console.log('Running setup')
  group('login', () => {
      login()
  })
  // We need to send the cookieJar to keep a copy in order to maintained
  // it from setup function to main function.
  return { cookies: http.cookieJar().cookiesForURL(serverUrl) };
}


export default function(data) {
  // Using the setup() cookie jar as the starting point for all VUs
  if (__ITER === 0) {
    let jar = http.cookieJar()
    Object.keys(data.cookies).forEach(key => {
        jar.set(serverUrl, key, data.cookies[key][0])
    })
  }
  let httpParams = { redirects: 0 }
  const res = http.get(serverUrl + 'accueil/', httpParams)
  let success = check(res, { 'status 200 OK': (r) => r.status === 200 })
  rateStatus200.add(success)
  if (!success) {
    errorCounter200.add(1)
  }
  success = check(res, { 'transaction time OK': (r) => r.timings.duration < 1000 })
  if (!success) {
    errorCounterDuration.add(1)
  }
  sleep(5)
}
