const UNAUTHORIZED_ALERT_KEY = 'fm_unauthorized_alert_shown'

export const notifyUnauthorized = (message = 'Sesi login berakhir. Silakan login kembali.') => {
  if (typeof window === 'undefined') return

  const alreadyShown = window.sessionStorage.getItem(UNAUTHORIZED_ALERT_KEY) === '1'
  if (!alreadyShown) {
    window.sessionStorage.setItem(UNAUTHORIZED_ALERT_KEY, '1')
    window.alert(message)
  }

  window.localStorage.removeItem('user-data')
  window.location.href = '/fuelmonitoring/login'
}

export const clearUnauthorizedFlag = () => {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(UNAUTHORIZED_ALERT_KEY)
}
