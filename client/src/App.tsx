import { BrowserRouter, Routes, Route } from "react-router-dom";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { Toaster } from "./components/ui/sonner";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Team from "./pages/team";
import TicketsPage from "./pages/ticket-page";
import DashboardLayout from "./layout/dashboardLayout";

import FoodCourtBookingsPage from "./pages/food-court-booking";
import FoodCourtEventBookingsPage from "./pages/food-court-event-bookings";
import HotelBookingsPage from "./pages/hotel-booking";

import HotelMediaPage from "./pages/hotel-media";
import FoodCourtMediaPage from "./pages/food-court-media";
import BakeryMediaPage from "./pages/bakery-media";
import HotelRoomsPage from "./pages/hotel-rooms";
import EventsPage from "./pages/events";
import GalleryPage from "./pages/gallery-page";
import Unauthorized from "./pages/unauthorized";

import {
    ProtectedRoute,
    AdminOnlyRoute,
    EmployeeRoute,
    MediaHandlerRoute,
} from "./components/ProtectedRoute";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 5,
        },
    },
});

const asyncStoragePersister = createAsyncStoragePersister({
    storage: window.localStorage,
});

function App() {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister }}
        >
            <Toaster richColors position="top-center" />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route element={<DashboardLayout />}>
                        {/* Dashboard - accessible to all authenticated users */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "admin",
                                        "employee",
                                        "media-handler",
                                    ]}
                                >
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin only routes */}
                        <Route
                            path="/team"
                            element={
                                <AdminOnlyRoute>
                                    <Team />
                                </AdminOnlyRoute>
                            }
                        />

                        {/* Tickets - accessible to admin and employee */}
                        <Route
                            path="/tickets"
                            element={
                                <EmployeeRoute>
                                    <TicketsPage />
                                </EmployeeRoute>
                            }
                        />

                        {/* Employee routes (bookings) - admin and employee access */}
                        <Route
                            path="/hotel/bookings"
                            element={
                                <EmployeeRoute>
                                    <HotelBookingsPage />
                                </EmployeeRoute>
                            }
                        />
                        <Route
                            path="/foodcourt/bookings"
                            element={
                                <EmployeeRoute>
                                    <FoodCourtBookingsPage />
                                </EmployeeRoute>
                            }
                        />
                        <Route
                            path="/foodcourt/event/bookings"
                            element={
                                <EmployeeRoute>
                                    <FoodCourtEventBookingsPage />
                                </EmployeeRoute>
                            }
                        />
                        <Route
                            path="/hotel/rooms"
                            element={
                                <EmployeeRoute>
                                    <HotelRoomsPage />
                                </EmployeeRoute>
                            }
                        />
                        <Route
                            path="/events"
                            element={
                                <EmployeeRoute>
                                    <EventsPage />
                                </EmployeeRoute>
                            }
                        />

                        {/* Media handler routes (gallery and media) - admin and media-handler access */}
                        <Route
                            path="/hotel/media"
                            element={
                                <MediaHandlerRoute>
                                    <HotelMediaPage />
                                </MediaHandlerRoute>
                            }
                        />
                        <Route
                            path="/foodcourt/media"
                            element={
                                <MediaHandlerRoute>
                                    <FoodCourtMediaPage />
                                </MediaHandlerRoute>
                            }
                        />
                        <Route
                            path="/bakery/media"
                            element={
                                <MediaHandlerRoute>
                                    <BakeryMediaPage />
                                </MediaHandlerRoute>
                            }
                        />
                        <Route
                            path="/gallery"
                            element={
                                <MediaHandlerRoute>
                                    <GalleryPage />
                                </MediaHandlerRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </PersistQueryClientProvider>
    );
}

export default App;
