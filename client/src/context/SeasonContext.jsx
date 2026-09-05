import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
  const { user } = useAuth();
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('krishikhata_token') || localStorage.getItem('khetkhata_token');

  const fetchSeasons = async () => {
    const token = getToken();
    if (!token && !user) {
      setSeasons([]);
      setSelectedSeason('');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/seasons');
      if (res.data.success) {
        setSeasons(res.data.seasons);
        const active = res.data.seasons.find((s) => s.status === 'Active');
        if (active && !selectedSeason) {
          setSelectedSeason(active._id);
        } else if (res.data.seasons.length > 0 && !selectedSeason) {
          setSelectedSeason(res.data.seasons[0]._id);
        }
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch seasons:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user || getToken()) {
      fetchSeasons();
    } else {
      setSeasons([]);
      setSelectedSeason('');
    }
  }, [user]);

  return (
    <SeasonContext.Provider
      value={{
        seasons,
        selectedSeason,
        setSelectedSeason,
        fetchSeasons,
        loading,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => useContext(SeasonContext);
