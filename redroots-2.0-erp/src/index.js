/* eslint new-cap: "off" */
import React from 'react'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
// import { logger } from 'redux-logger'
import mainStore from 'store'
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from 'connected-react-router'

import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache, split } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { createUploadLink } from 'apollo-upload-client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

import StylesLoader from './stylesLoader'
import reducers from './redux/reducers'
import sagas from './redux/sagas'
import Localization from './localization'
import Router from './router'
import * as serviceWorker from './serviceWorker'

import 'components/custom-styles.scss'
import 'handsontable/dist/handsontable.full.css'

// middlewared
const history = createHashHistory()
const sagaMiddleware = createSagaMiddleware()
const routeMiddleware = routerMiddleware(history)
const middlewares = [sagaMiddleware, routeMiddleware]
// if (process.env.NODE_ENV === 'development') {
//   middlewares.push(logger)
// }
const store = createStore(reducers(history), compose(applyMiddleware(...middlewares)))
sagaMiddleware.run(sagas)

// --------- CLIENT SET-UP STARTS ---------------
const terminatingLink = new createUploadLink({ uri: process.env.REACT_APP_HTTP_URL })

const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_WEB_SOCKET_URL,
  options: {
    reconnect: true,
    connectionParams: {
      'x-token': mainStore.get('token'),
    },
  },
})

// --- BEFORE UNCOMMENTING THE CODE BELOW, IMPORT "split" from @apollo/client
const splitLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  terminatingLink,
)

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'x-token': mainStore.get('token'),
    },
  }))
  return forward(operation)
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
    )
  if (networkError) console.log(`[Network error]: ${networkError}`)
})

// If using WebSocket, then use "splitLink" instead of "terminatingLink" below
// const link = ApolloLink.from([authLink, errorLink, terminatingLink])
const link = ApolloLink.from([authLink, errorLink, splitLink])
const cache = new InMemoryCache()
const client = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only' },
    query: { fetchPolicy: 'network-only' },
  },
  dataIdFromObject: (object) => object.key || null,
})

// --------- CLIENT SET-UP ENDS ---------------

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <StylesLoader>
        <Localization>
          <Router history={history} />
        </Localization>
      </StylesLoader>
    </Provider>
  </ApolloProvider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
export { store, history }
