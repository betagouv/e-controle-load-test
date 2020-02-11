import { visitPage } from './utils.js'


const serverUrl = `${__ENV.K6_HOST}`


export default function() {
  visitPage(serverUrl)
}
