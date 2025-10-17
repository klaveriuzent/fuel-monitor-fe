import { legacy_createStore as createStore } from 'redux'

const initialState = {
  sidebarShow: true,
  theme: 'light',
  filterGroup: 'all',
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }

    case 'force-refresh-filter-group':
      return { ...state, filterGroup: rest.filterGroup }

    default:
      return state
  }
}

const store = createStore(changeState)
export default store
