import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getClientsFiltered } from '../services/clientService';

const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  // --- ESTADOS DEMOS ---
  const [demos, setDemos] = useState([]);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [demoPage, setDemoPage] = useState(1);
  const [hasMoreDemos, setHasMoreDemos] = useState(true);
  const [activeDemoFilter, setActiveDemoFilter] = useState({ 
    sortParam: 'TrialEndsAt', isDescending: false, sellerId: null 
  });

  // --- ESTADOS ACTIVOS (NUEVO: AGREGAMOS FILTROS) ---
  const [actives, setActives] = useState([]);
  const [loadingActives, setLoadingActives] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [hasMoreActives, setHasMoreActives] = useState(true);
  
  // Estado de filtro para ACTIVOS
  const [activeActiveFilter, setActiveActiveFilter] = useState({ 
    sortParam: 'CreatedAt', // Por defecto: Recientes
    isDescending: true, 
    sellerId: null 
  });

  // --- ESTADOS INACTIVOS ---
  const [inactives, setInactives] = useState([]);
  const [loadingInactives, setLoadingInactives] = useState(false);
  const [inactivePage, setInactivePage] = useState(1);
  const [hasMoreInactives, setHasMoreInactives] = useState(true);
  const [activeInactiveFilter, setActiveInactiveFilter] = useState({ 
    sortParam: 'TrialEndsAt', 
    isDescending: false, 
    sellerId: null 
  });

  const PAGE_SIZE = 10;

  const appendUnique = (prevItems, newItems) => {
    const existingIds = new Set(prevItems.map(item => item.id));
    const uniqueNew = newItems.filter(item => !existingIds.has(item.id));
    return [...prevItems, ...uniqueNew];
  };

  const fetchGeneric = async (category, page, filters) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return { newItems: [], totalCount: 0, success: false };

    let params = {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      sortParam: 'BusinessName',
      isDescending: false,
      filterActives: true, 
      ...filters 
    };

    Object.keys(params).forEach(key => (params[key] === null || params[key] === undefined) && delete params[key]);

    try {
      const result = await getClientsFiltered(params);
      const newItems = Array.isArray(result) ? result : (result.items || result.data || []);
      return { newItems, totalCount: result.totalCount || 0, success: true }; 
    } catch (error) {
      console.log(`Info: Carga de ${category} fallida:`, error.message);
      return { newItems: [], totalCount: 0, success: false };
    }
  };

  // --- FETCH DEMOS ---
  const fetchDemos = async (page = 1, filters = activeDemoFilter, shouldRefresh = false) => {
    if (loadingDemos || (!hasMoreDemos && !shouldRefresh)) return;
    setLoadingDemos(true);
    const apiFilters = { sortParam: filters.sortParam, isDescending: filters.isDescending, sellerId: filters.sellerId, statuses: 1, types: true, filterActives: true };
    const { newItems, success } = await fetchGeneric('demos', page, apiFilters);
    
    if (shouldRefresh || page === 1) {
      setDemos(newItems);
      setDemoPage(1);
      setHasMoreDemos(success && newItems.length >= PAGE_SIZE);
    } else if (success && newItems.length > 0) {
      setDemos(prev => appendUnique(prev, newItems));
      setDemoPage(page);
      setHasMoreDemos(newItems.length >= PAGE_SIZE);
    } else {
      setHasMoreDemos(false);
    }
    setLoadingDemos(false);
  };

  // --- FETCH ACTIVOS (ACTUALIZADO) ---
  const fetchActives = async (page = 1, filters = activeActiveFilter, shouldRefresh = false) => {
    if (loadingActives || (!hasMoreActives && !shouldRefresh)) return;
    setLoadingActives(true);

    // Mapeo de Sort: Si el header manda 'TrialEndsAt', lo convertimos a 'CreatedAt' para activos
    let finalSort = filters.sortParam;
    if (finalSort === 'TrialEndsAt') finalSort = 'CreatedAt'; 

    const apiFilters = { 
        statuses: 1,    
        types: false,   
        sortParam: finalSort, 
        isDescending: filters.isDescending,
        sellerId: filters.sellerId, // Filtro de vendedor
        filterActives: true
    };

    const { newItems, success } = await fetchGeneric('actives', page, apiFilters);
    
    if (shouldRefresh || page === 1) {
      setActives(newItems);
      setActivePage(1);
      setHasMoreActives(success && newItems.length >= PAGE_SIZE);
    } else if (success && newItems.length > 0) {
      setActives(prev => appendUnique(prev, newItems));
      setActivePage(page);
      setHasMoreActives(newItems.length >= PAGE_SIZE);
    } else {
      setHasMoreActives(false);
    }
    setLoadingActives(false);
  };

  // --- FETCH INACTIVOS ---
  const fetchInactives = async (page = 1, filters = activeInactiveFilter, shouldRefresh = false) => {
    if (loadingInactives || (!hasMoreInactives && !shouldRefresh)) return;
    setLoadingInactives(true);

    let finalSort = filters.sortParam;
    if (finalSort === 'TrialEndsAt') finalSort = 'CreatedAt'; 

    const apiFilters = { 
      statuses: 2, 
      sortParam: finalSort, 
      isDescending: filters.isDescending,
      sellerId: filters.sellerId, 
      filterActives: true 
    };

    const { newItems, success } = await fetchGeneric('inactives', page, apiFilters);
    
    if (shouldRefresh || page === 1) {
      setInactives(newItems);
      setInactivePage(1);
      setHasMoreInactives(success && newItems.length >= PAGE_SIZE);
    } else if (success && newItems.length > 0) {
      setInactives(prev => appendUnique(prev, newItems));
      setInactivePage(page);
      setHasMoreInactives(newItems.length >= PAGE_SIZE);
    } else {
      setHasMoreInactives(false);
    }
    setLoadingInactives(false);
  };

  // Helpers de aplicación de filtros
  const applyDemoFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { ...activeDemoFilter, sortParam: newSortParam ?? activeDemoFilter.sortParam, isDescending: isDesc ?? activeDemoFilter.isDescending, sellerId: newSellerId !== undefined ? newSellerId : activeDemoFilter.sellerId };
    setActiveDemoFilter(newFilters);
    setHasMoreDemos(true); 
    fetchDemos(1, newFilters, true);
  };

  const applyInactiveFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { ...activeInactiveFilter, sortParam: newSortParam ?? activeInactiveFilter.sortParam, isDescending: isDesc ?? activeInactiveFilter.isDescending, sellerId: newSellerId !== undefined ? newSellerId : activeInactiveFilter.sellerId };
    setActiveInactiveFilter(newFilters);
    setHasMoreInactives(true); 
    fetchInactives(1, newFilters, true);
  };

  // NUEVO: Helper para Activos
  const applyActiveFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { ...activeActiveFilter, sortParam: newSortParam ?? activeActiveFilter.sortParam, isDescending: isDesc ?? activeActiveFilter.isDescending, sellerId: newSellerId !== undefined ? newSellerId : activeActiveFilter.sellerId };
    setActiveActiveFilter(newFilters);
    setHasMoreActives(true); 
    fetchActives(1, newFilters, true);
  };

  const loadInitialData = async () => {
    await Promise.all([
        fetchDemos(1, activeDemoFilter, true),
        fetchActives(1, activeActiveFilter, true), // Usamos el filtro correcto
        fetchInactives(1, activeInactiveFilter, true)
    ]);
  };

  useEffect(() => {
    const init = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) loadInitialData();
    };
    init();
  }, []);

  return (
    <ClientContext.Provider value={{ 
      loadInitialData,
      demos, loadingDemos, hasMoreDemos, fetchDemos: () => fetchDemos(demoPage + 1), refreshDemos: () => fetchDemos(1, activeDemoFilter, true), applyDemoFilter, activeDemoFilter,
      
      actives, loadingActives, hasMoreActives, 
      fetchActives: () => fetchActives(activePage + 1), 
      refreshActives: () => fetchActives(1, activeActiveFilter, true),
      applyActiveFilter, activeActiveFilter, // EXPORTAMOS
      
      inactives, loadingInactives, hasMoreInactives, fetchInactives: () => fetchInactives(inactivePage + 1), refreshInactives: () => fetchInactives(1, activeInactiveFilter, true), applyInactiveFilter, activeInactiveFilter
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => useContext(ClientContext);