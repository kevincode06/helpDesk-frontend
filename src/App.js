import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketPage from './pages/TicketPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';


// block if login doest have token
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token'); 
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;