import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppStoreProvider } from './store/AppStore'
import PublicLayout from './components/PublicLayout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/public/Home'
import HowItWorks from './pages/public/HowItWorks'
import Catalogue from './pages/public/Catalogue'
import EquipmentDetails from './pages/public/EquipmentDetails'
import HireRequest from './pages/public/HireRequest'
import RequestSubmitted from './pages/public/RequestSubmitted'
import BookingStatusPage from './pages/public/BookingStatus'
import Payment from './pages/public/Payment'
import PaymentComplete from './pages/public/PaymentComplete'
import NotFound from './pages/public/NotFound'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import EquipmentList from './pages/admin/EquipmentList'
import EquipmentForm from './pages/admin/EquipmentForm'
import AdminCalendar from './pages/admin/AdminCalendar'
import Bookings from './pages/admin/Bookings'
import BookingDetail from './pages/admin/BookingDetail'
import BookingRulesPage from './pages/admin/BookingRules'
import Payments from './pages/admin/Payments'
import Reports from './pages/admin/Reports'
import Account from './pages/admin/Account'

export default function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<HowItWorks />} />
            <Route path="equipment" element={<Catalogue />} />
            <Route path="equipment/:id" element={<EquipmentDetails />} />
            <Route path="request" element={<HireRequest />} />
            <Route path="request/:id/submitted" element={<RequestSubmitted />} />
            <Route path="status" element={<BookingStatusPage />} />
            <Route path="status/:id" element={<BookingStatusPage />} />
            <Route path="pay/:id" element={<Payment />} />
            <Route path="pay/:id/complete" element={<PaymentComplete />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/login" element={<Login />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="equipment" element={<EquipmentList />} />
            <Route path="equipment/new" element={<EquipmentForm />} />
            <Route path="equipment/:id" element={<EquipmentForm />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="rules" element={<BookingRulesPage />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStoreProvider>
  )
}
