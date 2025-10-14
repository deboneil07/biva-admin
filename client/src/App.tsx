import { BrowserRouter, Routes, Route } from "react-router-dom";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { Toaster } from "./components/ui/sonner";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Team from "./pages/team";
import DashboardLayout from "./layout/dashboardLayout";
import { UploadImage } from "./components/uplaod-images";
import ImageCard from "./components/gallery-image-card";
import Gallery from "./components/gallery";
import { HotelBookings,  sampleHotelBookings } from "./components/hotel-bookings";

import { FoodCourtEventBookings, sampleFoodCourtEventBookings } from "./components/food-court-event-bookings";
import FoodCourtBookingsPage from "./pages/food-court-booking";
import FoodCourtEventBookingsPage from "./pages/food-court-event-bookings";
import HotelBookingsPage from "./pages/hotel-booking";

export const queryClient = new QueryClient({
  defaultOptions:{
    queries: {
      gcTime: 1000 * 60 * 5
    }
  }
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: window.localStorage,
})

function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
    <Toaster richColors position="top-center"/>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/hotel/bookings" element={<HotelBookingsPage />}/>
          <Route path="/foodcourt/bookings" element={<FoodCourtBookingsPage />}/> 
          <Route path="/foodcourt/event/bookings" element={<FoodCourtEventBookingsPage />}/> 
          <Route path="projects/upload" element={<Gallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;
