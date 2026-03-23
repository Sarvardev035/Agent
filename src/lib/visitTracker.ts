const VISITED_KEY = 'finly_has_visited'
const ACCOUNT_KEY = 'finly_had_account'

export const visitTracker = {
  markHasAccount: () => {
    localStorage.setItem(VISITED_KEY, 'true')
    localStorage.setItem(ACCOUNT_KEY, 'true')
  },

  markVisited: () => {
    localStorage.setItem(VISITED_KEY, 'true')
  },

  hasVisited: () => localStorage.getItem(VISITED_KEY) === 'true',

  hasHadAccount: () => localStorage.getItem(ACCOUNT_KEY) === 'true',

  getAuthPage: (): '/register' | '/login' => {
    if (visitTracker.hasHadAccount()) return '/login'
    if (visitTracker.hasVisited()) return '/register'
    return '/register'
  },
}
