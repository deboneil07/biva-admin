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
import { FoodCourtBookings, sampleFoodCourtBookings } from "./components/food-court-bookings";
import { FoodCourtEventBookings, sampleFoodCourtEventBookings } from "./components/food-court-event-bookings";

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
          <Route path="/hotel/bookings" element={<HotelBookings data={sampleHotelBookings} isLoading={false} />}/>
          <Route path="/foodcourt/bookings" element={<FoodCourtBookings data={sampleFoodCourtBookings} isLoading={false} />}/> 
          <Route path="/foodcourt/event/bookings" element={<FoodCourtEventBookings data={sampleFoodCourtEventBookings} isLoading={false}/> }/> 
          <Route path="projects/upload" element={<Gallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;
