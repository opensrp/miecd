import './mls';
import { history } from '@onaio/connected-reducer-registry';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App/App';
import './index.css';
import * as serviceWorker from './serviceWorker';
import store from './store';
import Ripple from './components/page/Loading';
import 'bootstrap/dist/css/bootstrap.min.css';

const queryClient = new QueryClient();

ReactDOM.render(
    <React.Suspense fallback={Ripple}>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </ConnectedRouter>
        </Provider>
    </React.Suspense>,
    document.getElementById('openSRP-root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
