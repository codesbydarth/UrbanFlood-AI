import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingOverview from './pages/LandingOverview';
import FloodRiskDashboard from './pages/FloodRiskDashboard';
import InteractiveRiskMap from './pages/InteractiveRiskMap';
import HotspotDetails from './pages/HotspotDetails';
import CitizenReporting from './pages/CitizenReporting';
import AuthorityResponse from './pages/AuthorityResponse';
import DataModelInfo from './pages/DataModelInfo';
import { fetchCities } from './services/api';

export default function App() {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    async function initCities() {
      try {
        const data = await fetchCities();
        setCities(data);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    }
    initCities();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-cyan-500 selection:text-navy-950 overflow-x-hidden">
        <Navbar
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          cities={cities}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <LandingOverview
                  selectedCity={selectedCity}
                  onSelectCity={setSelectedCity}
                  cities={cities}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <FloodRiskDashboard
                  selectedCity={selectedCity}
                  cities={cities}
                />
              }
            />
            <Route
              path="/map"
              element={
                <InteractiveRiskMap
                  selectedCity={selectedCity}
                  cities={cities}
                />
              }
            />
            <Route
              path="/hotspots"
              element={
                <HotspotDetails
                  selectedCity={selectedCity}
                  cities={cities}
                />
              }
            />
            <Route
              path="/report"
              element={
                <CitizenReporting
                  selectedCity={selectedCity}
                  cities={cities}
                />
              }
            />
            <Route
              path="/authority"
              element={
                <AuthorityResponse
                  selectedCity={selectedCity}
                  cities={cities}
                />
              }
            />
            <Route
              path="/model-info"
              element={
                <DataModelInfo
                  selectedCity={selectedCity}
                  cities={cities}
                />
              }
            />
            <Route path="/about" element={<Navigate to="/model-info" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
