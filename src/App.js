import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import LandingPage from "./pages/LandingPage";
import ResultsPage from "./pages/Resultspage";

export default function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </Provider>
  );
}
