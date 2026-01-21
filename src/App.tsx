import { Routes, Route } from "react-router";
import Dashboard from "./components/Dashboard/Dashboard";

export function App() {
    return (
        <>
            <Dashboard />

            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </>
    );
}

export default App;