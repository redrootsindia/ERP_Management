import store from 'store'
import actions from './actions'

const STORED_SETTINGS = (storedSettings) => {
  const settings = {}
  Object.keys(storedSettings).forEach((key) => {
    const item = store.get(`app.settings.${key}`)
    settings[key] = typeof item !== 'undefined' ? item : storedSettings[key]
  })
  return settings
}

const initialState = {
  ...STORED_SETTINGS({
    // Read docs for available values: https://docs.visualbuilder.cloud
    // VB:REPLACE-START:SETTINGS
    authProvider: 'jwt',
    logo: 'Redroots',
    version: 'clean', // fluent, clean, air
    theme: 'default',
    locale: 'en-US',
    isSidebarOpen: false,
    isSupportChatOpen: false,
    isMobileView: false,
    isMobileMenuOpen: false,
    isMenuCollapsed: false,
    isPreselectedOpen: false,
    preselectedVariant: 'default',
    menuLayoutType: 'top', // left, top
    routerAnimation: 'slide-fadein-up',
    menuColor: 'gray',
    authPagesColor: 'gray',
    isAuthTopbar: true,
    primaryColor: '#ee194e',
    leftMenuWidth: 256,
    isMenuUnfixed: false,
    isMenuShadow: false,
    isTopbarFixed: false,
    isTopbarSeparated: false,
    isGrayTopbar: false,
    isContentMaxWidth: false,
    isAppMaxWidth: false,
    isGrayBackground: false,
    isCardShadow: true,
    isSquaredBorders: false,
    isBorderless: false,
    layoutMenu: 'classic',
    layoutTopbar: 'v1', // v1, none
    layoutBreadcrumbs: 'none', // v1, v2, none
    layoutFooter: 'v1',
    flyoutMenuType: 'flyout',
    flyoutMenuColor: 'blue',

    // VB:REPLACE-END:SETTINGS
  }),
}

export default function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
