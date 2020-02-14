import { Counter, Rate } from 'k6/metrics'
import { sleep, check, fail } from 'k6'
import http from 'k6/http'


const username = `${__ENV.K6_WEB_USER}`
const password = `${__ENV.K6_WEB_PASSWORD}`
const serverUrl = `${__ENV.K6_HOST}`
const adminPath = `${__ENV.K6_ADMIN_PATH}`
const loginUrl = serverUrl + adminPath + 'login/'

const errorCounter200 = new Counter('errors_status_200_OK')
const errorCounterTransactionTime = new Counter('errors_transaction_time_OK')
const rateStatus200 = new Rate('rate_status_200_OK')
const rateTransactionTime = new Rate('rate_transaction_time_OK')


export function getCsrf(httpResponse) {
  console.log('Looking for CSRF')
  const found = httpResponse.body.match(/name="csrfmiddlewaretoken" value="(.*)"/)
  const formCsrf = found[1]
  console.debug('csrf token from form', formCsrf)
  // Get the other csrf token from the Set-Cookie header in response, and set it in cookies
  console.debug('Response cookies', JSON.stringify(httpResponse.cookies))
  const cookieCsrf = httpResponse.cookies.csrftoken[0].value
  console.debug('Setting csrf cookie', cookieCsrf)
  const jar = http.cookieJar()
  jar.set(httpResponse.request.url, 'csrftoken', cookieCsrf)
  return formCsrf
}

export function login() {
  console.log('Start login process')
  let response = http.get(loginUrl)
  const formCsrf = getCsrf(response)
  response = response.submitForm({ 
    fields: {
      csrfmiddlewaretoken: formCsrf,
      username: username,
      password: password,
      next:'/',
    },
  })
  const ERROR_KEYWORD = 'error'
  let thisPageHasError = response.body.includes(ERROR_KEYWORD)
  if (thisPageHasError) {
    fail(`Login probably failed. Found the keyword "${ERROR_KEYWORD}" in page content.`)
  }
  console.log('Making login request')
  console.debug('Response cookies', JSON.stringify(response.cookies))
  console.log('Done with login process.')
}


export function visitPage(pageUrl, sleepDurationSeconds=5) {
  const response = http.get(pageUrl)
  let success = check(response, { 'status 200 OK': (r) => r.status === 200 })
  rateStatus200.add(success)
  if (!success) {
    errorCounter200.add(1)
  }
  success = check(response, { 'transaction time OK': (r) => r.timings.duration < 1000 })
  rateTransactionTime.add(success)
  if (!success) {
    errorCounterTransactionTime.add(1)
  }
  sleep(sleepDurationSeconds)
  return response
}