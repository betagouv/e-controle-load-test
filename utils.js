import http from 'k6/http'


export function getCsrf(formUrl) {
  console.debug('Looking for CSRF')
  const res = http.get(formUrl)
  console.debug('Got login form page')
  const found = res.body.match(/name="csrfmiddlewaretoken" value="(.*)"/)
  const formCsrf = found[1]
  console.debug('csrf token from form', formCsrf)
  // Get the other csrf token from the Set-Cookie header in response, and set it in cookies
  console.debug('response cookies', JSON.stringify(res.cookies))
  const cookieCsrf = res.cookies.csrftoken[0].value
  console.debug('Setting csrf cookie', cookieCsrf)
  const jar = http.cookieJar()
  jar.set(formUrl, 'csrftoken', cookieCsrf)
  return formCsrf
}