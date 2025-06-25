import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';


import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketPage from './pages/TicketPage';
import AdminPage from './pages/AdminPage';


// block if login doest have token
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token'); 
  return token ? children : <Navigate to="/login" />
}

// admin can access
function adminRoute({ children }) {
  const user = JSON.parse(atob(localStorage.getItem('token')?.split('.') [1]|| '{}'));
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
}


function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User-only Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage/> </PrivateRoute>}/>
          <Route path="/tickets/:id" element={<PrivateRoute><TicketPage/> </PrivateRoute>}/>

          {/* Admin-only Routes */}
          <Route path="/admin" element={<PrivateRoute><AdminRoute><AdminPage/></AdminRoute></PrivateRoute> }/>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Routes>
      </Router>
    </Provider>
  );
}