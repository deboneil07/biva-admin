import { BrowserRouter, Routes, Route } from "react-router-dom";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Team from "./pages/team";
import DashboardLayout from "./layout/dashboardLayout";

const queryClient = new QueryClient({
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;
