import { check, group, sleep } from 'k6'
import { Counter, Rate } from 'k6/metrics'
import { login } from './utils.js'
import { visitPage } from './utils.js'
import http from 'k6/http'


const serverUrl = `${__ENV.K6_HOST}`


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
  visitPage(serverUrl + 'accueil/')
}
