import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import BookingDetailPage from './pages/BookingDetailPage';
import AddBookingPage from './pages/AddBookingPage';
import EditBookingPage from './pages/EditBookingPage';
import SharedBookingPage from './pages/SharedBookingPage';
import NotFoundPage from './pages/NotFoundPage';
import './utils/globalErrorHandler'; // Initialize global error handler

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="booking/:id" element={<BookingDetailPage />} />
            <Route path="booking/:id/edit" element={<EditBookingPage />} />
            <Route path="add-booking" element={<AddBookingPage />} />
          </Route>
          {/* Public routes (no layout) */}
          <Route path="booking/shared/:id" element={<SharedBookingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App