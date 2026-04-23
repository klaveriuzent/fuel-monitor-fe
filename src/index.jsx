import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import axios from 'axios'

import App from './App'
import store from './store'
import { notifyUnauthorized } from './utils/unauthorized'

axios.defaults.withCredentials = true
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      notifyUnauthorized()
    }
    return Promise.reject(error)
  },
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
