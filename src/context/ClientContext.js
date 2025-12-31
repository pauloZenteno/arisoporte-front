import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getClientsFiltered, updateClientStatus, updateClient } from '../services/clientService';
import { getQuotes } from '../services/quoteService';

const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  // --- ESTADOS DE CLIENTES (Lógica existente) ---
  const [demos, setDemos] = useState([]);
  const [loadingDemos, setLoadingDemos] = useState(false);
  const [demoPage, setDemoPage] = useState(1);
  const [hasMoreDemos, setHasMoreDemos] = useState(true);
  const [activeDemoFilter, setActiveDemoFilter] = useState({ 
    sortParam: 'TrialEndsAt', isDescending: false, sellerId: null 
  });

  const [actives, setActives] = useState([]);
  const [loadingActives, setLoadingActives] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [hasMoreActives, setHasMoreActives] = useState(true);
  const [activeActiveFilter, setActiveActiveFilter] = useState({ 
    sortParam: 'CreatedAt', isDescending: true, sellerId: null 
  });

  const [inactives, setInactives] = useState([]);
  const [loadingInactives, setLoadingInactives] = useState(false);
  const [inactivePage, setInactivePage] = useState(1);
  const [hasMoreInactives, setHasMoreInactives] = useState(true);
  const [activeInactiveFilter, setActiveInactiveFilter] = useState({ 
    sortParam: 'TrialEndsAt', isDescending: false, sellerId: null 
  });

  // --- NUEVO ESTADO: COTIZACIONES ---
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

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

  // --- FUNCIONES DE CLIENTES (Existentes) ---
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

  const fetchActives = async (page = 1, filters = activeActiveFilter, shouldRefresh = false) => {
    if (loadingActives || (!hasMoreActives && !shouldRefresh)) return;
    setLoadingActives(true);
    let finalSort = filters.sortParam === 'TrialEndsAt' ? 'CreatedAt' : filters.sortParam;
    const apiFilters = { statuses: 1, types: false, sortParam: finalSort, isDescending: filters.isDescending, sellerId: filters.sellerId, filterActives: true };
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

  const fetchInactives = async (page = 1, filters = activeInactiveFilter, shouldRefresh = false) => {
    if (loadingInactives || (!hasMoreInactives && !shouldRefresh)) return;
    setLoadingInactives(true);
    let finalSort = filters.sortParam === 'TrialEndsAt' ? 'CreatedAt' : filters.sortParam;
    const apiFilters = { statuses: 2, sortParam: finalSort, isDescending: filters.isDescending, sellerId: filters.sellerId, filterActives: true };
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

  // --- NUEVA FUNCIÓN: FETCH QUOTES ---
  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const data = await getQuotes();
      // Si el endpoint regresa un objeto con .data o .items, ajústalo aquí. 
      // Asumiré que regresa un array directo o un objeto con lista.
      const items = Array.isArray(data) ? data : (data.items || data.data || []);
      setQuotes(items);
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // --- FILTROS Y ACCIONES (Existentes) ---
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

  const applyActiveFilter = (newSortParam, isDesc, newSellerId) => {
    const newFilters = { ...activeActiveFilter, sortParam: newSortParam ?? activeActiveFilter.sortParam, isDescending: isDesc ?? activeActiveFilter.isDescending, sellerId: newSellerId !== undefined ? newSellerId : activeActiveFilter.sellerId };
    setActiveActiveFilter(newFilters);
    setHasMoreActives(true); 
    fetchActives(1, newFilters, true);
  };

  const reactivateClient = async (clientId) => {
    try {
      await updateClientStatus(clientId, 1, false);
      Alert.alert('Éxito', 'Cliente reactivado correctamente');
      fetchInactives(1, activeInactiveFilter, true);
      fetchActives(1, activeActiveFilter, true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo reactivar al cliente');
    }
  };

  const suspendClient = async (clientId) => {
    try {
      await updateClientStatus(clientId, 2, false);
      Alert.alert('Éxito', 'Cliente suspendido correctamente');
      fetchActives(1, activeActiveFilter, true);
      fetchInactives(1, activeInactiveFilter, true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo suspender al cliente');
    }
  };

  const activateDemo = async (client) => {
    try {
      const updatedClientData = { ...client, isTrial: false };
      await updateClient(client.id, updatedClientData);
      Alert.alert('Éxito', 'El cliente ha sido activado correctamente');
      fetchDemos(1, activeDemoFilter, true);
      fetchActives(1, activeActiveFilter, true);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo activar al cliente');
    }
  };

  const loadInitialData = async () => {
    await Promise.all([
        fetchDemos(1, activeDemoFilter, true),
        fetchActives(1, activeActiveFilter, true), 
        fetchInactives(1, activeInactiveFilter, true),
        fetchQuotes() // Cargamos cotizaciones al inicio también
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
      applyActiveFilter, activeActiveFilter,
      
      inactives, loadingInactives, hasMoreInactives, fetchInactives: () => fetchInactives(inactivePage + 1), refreshInactives: () => fetchInactives(1, activeInactiveFilter, true), applyInactiveFilter, activeInactiveFilter,
      
      quotes, loadingQuotes, fetchQuotes, // Exponemos lo nuevo
      
      reactivateClient,
      suspendClient,
      activateDemo
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = () => useContext(ClientContext);