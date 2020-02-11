import http from 'k6/http'
import { fail } from 'k6'


const username = `${__ENV.K6_WEB_USER}`
const password = `${__ENV.K6_WEB_PASSWORD}`
const serverUrl = `${__ENV.K6_HOST}`
const adminPath = `${__ENV.K6_ADMIN_PATH}`
const loginUrl = serverUrl + adminPath + 'login/'


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
  let res = http.get(loginUrl)
  const formCsrf = getCsrf(res)
  res = res.submitForm({ 
    fields: {
      csrfmiddlewaretoken: formCsrf,
      username: username,
      password: password,
      next:'/',
    },
    submitSelector: "submit" 
  })
  console.log('Making login request')
  console.debug('Response cookies', JSON.stringify(res.cookies))
  console.log('Done with login process.')
}