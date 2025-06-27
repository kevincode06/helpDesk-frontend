import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './redux/store';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketPage from './pages/TicketPage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';


// block if login doest have token
function PrivateRoute({ children }) {
  const { token, user } = useSelector((state) => state.auth);


  console.log('PrivateRoute check:', {
    hasToken : !!token,
    user: user,
    userRole: user?.role

  });

  return token? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);


  console.log('AdminRoute check:', {
    user: user,
    userRole: user?.role,
    isAdmin: user?.role === 'admin'
  });

if (user?.role !== 'admin') {
  console.log('Access denied - not admin. Redirecting to dashboard');
  return <Navigate to="/dashboard" />;
}
return children;
}

function AppRoutes() {
  const { token, user} = useSelector((state) => state.auth);

  console.log('App render - Auth state:', {
    hasToken: !!token,
    user: user,
    userRole: user?.role
  }); 



  return (
      <Router>
        <Navbar/> {/* <-- Renders the navbar on every page */}
        <Routes>
          {/* Public */}
          <Route path='/' element={<LandingPage />}/>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User-only Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage/> </PrivateRoute>}/>
          <Route path="/tickets/:id" element={<PrivateRoute><TicketPage/> </PrivateRoute>}/>

          {/* Admin-only Routes */}
          <Route path="/admin" element={<PrivateRoute><AdminRoute><AdminPage/></AdminRoute></PrivateRoute> }/>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" />} />



        </Routes>
      </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppRoutes/>
      </Provider>
  );
}

export default App;