import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

// Front autonome : aucun backend d'authentification.
// On conserve l'interface du provider Base44 d'origine pour ne pas
// toucher aux composants consommateurs (App, ProtectedRoute).
export const AuthProvider = ({ children }) => {
  const noop = () => {};

  return (
    <AuthContext.Provider value={{
      user: null,
      isAuthenticated: false,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: { public_settings: 'public_without_login' },
      authChecked: true,
      logout: noop,
      navigateToLogin: noop,
      checkUserAuth: noop,
      checkAppState: noop
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
