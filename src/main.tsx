import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './redux/store'
import { GoogleOAuthProvider } from '@react-oauth/google';


// Simple loading component for PersistGate
const PersistLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading...
  </div>
);

console.log("import.meta.env.VITE_GOOGLE_CLIENT_ID: ",import.meta.env.VITE_GOOGLE_CLIENT_ID)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
)


