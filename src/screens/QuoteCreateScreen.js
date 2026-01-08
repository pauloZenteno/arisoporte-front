import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getProductPriceSchemes } from '../services/productPriceService';
import { getQuoteById, createQuote, updateQuote } from '../services/quoteService';
import { useQuoteCalculator } from '../hooks/useQuoteCalculator';
import { INITIAL_MODULES, HARDCODED_PRODUCTS, MODULE_IDS } from '../utils/quoteConstants';
import * as SecureStore from 'expo-secure-store';
import { useClients } from '../context/ClientContext';

const GeneralInfoTab = ({ data, onChange }) => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Datos del Cliente</Text>
        <TextInput style={styles.input} placeholder="Nombre de la Compañía *" value={data.companyName} onChangeText={(t) => onChange('companyName', t)} />
        <TextInput style={styles.input} placeholder="Nombre del Cliente *" value={data.clientName} onChangeText={(t) => onChange('clientName', t)} />
        
        <Text style={styles.sectionTitle}>Datos del Vendedor</Text>
        <View style={styles.readOnlyContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={data.employeeName} editable={false} />
            
            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={data.email} editable={false} />
            
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput style={[styles.input, styles.disabledInput]} value={data.phone} editable={false} />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Puesto</Text>
                    <TextInput style={[styles.input, styles.disabledInput]} value={data.jobPosition} editable={false} />
                </View>
            </View>
        </View>
    </View>
);

const DescuentosTab = ({ data, onChange }) => (
    <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Configuración de Descuentos</Text>
        
        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>Desc. Mensual (%)</Text>
                <TextInput 
                    style={styles.input} 
                    value={data.monthlyDiscount?.toString()} 
                    onChangeText={(t) => onChange('monthlyDiscount', t)} 
                    keyboardType="numeric" 
                    placeholder="0" 
                />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.label}>Meses (Duración)</Text>
                <TextInput 
                    style={styles.input} 
                    value={data.months?.toString()} 
                    onChangeText={(t) => onChange('months', t)} 
                    keyboardType="numeric" 
                    placeholder="1" 
                />
            </View>
        </View>

        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>Desc. Anual (%)</Text>
                <TextInput 
                    style={styles.input} 
                    value={data.anualDiscount?.toString()} 
                    onChangeText={(t) => onChange('anualDiscount', t)} 
                    keyboardType="numeric" 
                    placeholder="0" 
                />
            </View>
            <View style={{flex: 1}} />
        </View>
    </View>
);

const ModulesTab = ({ data, onModuleChange, onGeneralChange }) => {
    
    const nominaModule = data.moduleDetails.find(m => m.moduleId === MODULE_IDS.NOMINA);
    const isNominaActive = nominaModule ? nominaModule.isActive : false;

    return (
        <ScrollView style={styles.tabContent}>
            
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Módulos Contratados</Text>
            
            {data.moduleDetails.map((mod, index) => (
                <View key={mod.moduleId} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{mod.name}</Text>
                        <Switch 
                            value={mod.isActive} 
                            onValueChange={(val) => onModuleChange(index, 'isActive', val)}
                            trackColor={{ false: "#767577", true: "#2b5cb5" }}
                        />
                    </View>
                    
                    {mod.isActive && (
                        <View style={styles.cardBody}>
                            <Text style={styles.label}>Número de Empleados</Text>
                            <TextInput 
                                style={styles.input} 
                                value={mod.employeeNumber?.toString()} 
                                onChangeText={(t) => onModuleChange(index, 'employeeNumber', t)}
                                keyboardType="numeric"
                            />
                            
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Precio Mensual:</Text>
                                <Text style={styles.resultValue}>${mod.monthlyPrice?.toFixed(2)}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Precio Anual:</Text>
                                <Text style={styles.resultValue}>${mod.annualPrice?.toFixed(2)}</Text>
                            </View>
                            {mod.stamp > 0 && (
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Timbres:</Text>
                                    <Text style={styles.resultValue}>{mod.stamp}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            ))}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Extras y Adicionales</Text>
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Usuarios Extra</Text>
                    <TextInput 
                        style={styles.input} 
                        value={data.numberOfExtraUsers?.toString()} 
                        onChangeText={(t) => onGeneralChange('numberOfExtraUsers', t)} 
                        keyboardType="numeric" 
                    />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Timbres Extra</Text>
                    <TextInput 
                        style={[styles.input, !data.requiresStamps && styles.disabledInput]} 
                        value={data.numberOfExtraRings?.toString()} 
                        onChangeText={(t) => onGeneralChange('numberOfExtraRings', t)} 
                        keyboardType="numeric"
                        editable={data.requiresStamps}
                    />
                </View>
            </View>
            
            <View style={styles.switchRow}>
                <View>
                    <Text style={styles.label}>¿Requiere Timbres?</Text>
                    {!isNominaActive && (
                        <Text style={styles.helperText}>Requiere módulo Nómina activo</Text>
                    )}
                </View>
                <Switch 
                    value={data.requiresStamps} 
                    onValueChange={(val) => onGeneralChange('requiresStamps', val)} 
                    trackColor={{ false: "#767577", true: "#2b5cb5" }}
                    disabled={!isNominaActive}
                />
            </View>
            
            <View style={{height: 40}} />
        </ScrollView>
    );
};

const ProductsTab = ({ products, onProductChange }) => (
    <View style={styles.tabContent}>
        {products.map((prod, index) => (
            <View key={index} style={styles.productRow}>
                <View style={{flex: 1}}>
                    <Text style={styles.productName}>{prod.name}</Text>
                    <Text style={styles.productPrice}>${prod.price?.toFixed(2)}</Text>
                </View>
                <View style={{width: 80}}>
                    <TextInput 
                        style={styles.inputCentered} 
                        value={prod.quantity?.toString()} 
                        onChangeText={(t) => onProductChange(index, t)}
                        keyboardType="numeric"
                        placeholder="0"
                    />
                </View>
            </View>
        ))}
        <View style={{height: 20}} />
    </View>
);

const SummaryTab = ({ data, onSave, saving }) => {
    
    const format = (n) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(n || 0);
    };

    return (
        <ScrollView style={styles.tabContent}>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>Resumen Mensual</Text>
                <View style={styles.summaryRow}><Text>Módulos:</Text><Text>{format(data.moduleSupTotalMonthly)}</Text></View>
                <View style={styles.summaryRow}><Text>Usuarios Extra:</Text><Text>{format(data.amountExtraUsersMonthly)}</Text></View>
                <View style={styles.summaryRow}><Text>Timbres:</Text><Text>{format(data.amountStampMonthly)}</Text></View>
                <View style={styles.summaryRow}><Text>Descuento ({data.monthlyDiscount}%):</Text><Text style={{color: 'red'}}>-{format(data.amountDiscountMonthly)}</Text></View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}><Text style={styles.bold}>Subtotal:</Text><Text style={styles.bold}>{format(data.subTotalMonthly)}</Text></View>
                <View style={styles.summaryRow}><Text>IVA (16%):</Text><Text>{format(data.ivaMonthly)}</Text></View>
                <View style={[styles.summaryRow, {marginTop: 10}]}><Text style={styles.totalText}>Total Mensual:</Text><Text style={styles.totalText}>{format(data.totalMonthly)}</Text></View>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>Resumen Anual</Text>
                <View style={styles.summaryRow}><Text>Subtotal (con desc. {data.anualDiscount}%):</Text><Text>{format(data.subTotalAnual)}</Text></View>
                <View style={styles.summaryRow}><Text>IVA:</Text><Text>{format(data.ivaAnual)}</Text></View>
                <View style={[styles.summaryRow, {marginTop: 10}]}><Text style={styles.totalText}>Total Anual:</Text><Text style={styles.totalText}>{format(data.totalAnual)}</Text></View>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>Productos (Pago Único)</Text>
                <View style={styles.summaryRow}><Text>Subtotal:</Text><Text>{format(data.subTotalProducts)}</Text></View>
                <View style={styles.summaryRow}><Text>IVA:</Text><Text>{format(data.ivaProducts)}</Text></View>
                <View style={[styles.summaryRow, {marginTop: 10}]}><Text style={styles.totalText}>Total Productos:</Text><Text style={styles.totalText}>{format(data.totalProducts)}</Text></View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={onSave} disabled={saving}>
                {saving ? (
                    <ActivityIndicator color="#15c899" />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={20} color="#15c899" style={{marginRight: 8}} />
                        <Text style={styles.saveButtonText}>Guardar Cotización</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={{height: 40}} />
        </ScrollView>
    );
};

export default function QuoteCreateScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {}; 
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [schemes, setSchemes] = useState([]);
    const [activeTab, setActiveTab] = useState(0); 

    const { userProfile } = useClients(); 
    const { calculateTotals, calculateProducts } = useQuoteCalculator(schemes);

    const [form, setForm] = useState({
        id: '',
        employeeName: '',
        folio: '',
        email: '',
        phone: '',
        jobPosition: '',
        anualDiscount: 20,
        monthlyDiscount: 0,
        months: 1,
        clientName: '',
        companyName: '',
        requiresStamps: false,
        numberOfExtraUsers: 0,
        numberOfExtraRings: 0,
        totalStamp: 0,
        moduleDetails: JSON.parse(JSON.stringify(INITIAL_MODULES)),
        productDetails: HARDCODED_PRODUCTS.map(p => ({ ...p, productId: p.id, quantity: 0, total: 0 })),
        moduleSupTotalMonthly: 0, moduleSupTotalAnual: 0,
        subTotalMonthly: 0, totalMonthly: 0,
        subTotalAnual: 0, totalAnual: 0,
        subTotalProducts: 0, totalProducts: 0
    });

    const recalculateAll = useCallback((currentForm) => {
        if (!schemes || schemes.length === 0) return currentForm;
        
        const calculatedModules = calculateTotals(currentForm);
        const calculatedProducts = calculateProducts(calculatedModules.productDetails);
        return { ...calculatedModules, ...calculatedProducts };
    }, [schemes, calculateTotals, calculateProducts]);

    useEffect(() => {
        const init = async () => {
            try {
                const priceSchemes = await getProductPriceSchemes();
                setSchemes(priceSchemes);

                if (id) {
                    const quoteData = await getQuoteById(id);
                    
                    setForm(prev => {
                        const next = { ...prev, ...quoteData };
                        
                        next.moduleDetails = INITIAL_MODULES.map(initMod => {
                             const serverMod = quoteData.moduleDetails?.find(m => m.moduleId === initMod.moduleId);
                             if (serverMod) {
                                 return {
                                     ...initMod,
                                     ...serverMod,
                                     name: initMod.name, 
                                     isActive: serverMod.isActive
                                 };
                             }
                             return initMod;
                        });

                        next.productDetails = HARDCODED_PRODUCTS.map(initProd => {
                            const serverProd = quoteData.productDetails?.find(p => p.productId === initProd.id);
                            if (serverProd) {
                                return {
                                    ...initProd,
                                    ...serverProd,
                                    name: initProd.name,
                                    quantity: serverProd.quantity
                                };
                            }
                            return { ...initProd, productId: initProd.id, quantity: 0, total: 0 };
                        });

                        return next;
                    });
                } else {
                    let user = userProfile;
                    
                    if (!user) {
                        const userInfoStr = await SecureStore.getItemAsync('userInfo');
                        if (userInfoStr) user = JSON.parse(userInfoStr);
                    }

                    if (user) {
                        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                        setForm(prev => ({ 
                            ...prev, 
                            employeeName: fullName,
                            email: user.email || '', 
                            phone: user.phone || '',
                            jobPosition: user.jobPosition || ''
                        }));
                    }
                }
            } catch (error) {
                Alert.alert("Error", "No se pudieron cargar los datos necesarios.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, userProfile]);

    useEffect(() => {
        if (schemes.length > 0 && !loading) {
            setForm(prev => recalculateAll(prev));
        }
    }, [schemes, loading]); 

    const handleGeneralChange = (field, value) => {
        setForm(prev => {
            const nextForm = { ...prev, [field]: value };
            return recalculateAll(nextForm);
        });
    };

    const handleModuleChange = (index, field, value) => {
        setForm(prev => {
            const newModules = [...prev.moduleDetails];
            newModules[index] = { ...newModules[index], [field]: value };
            
            if (field === 'isActive') {
                const currentId = newModules[index].moduleId;
                
                if (currentId === MODULE_IDS.NOMINA && value === false) {
                    prev.requiresStamps = false;
                    prev.numberOfExtraRings = 0;
                }

                if (value === true) {
                    if (currentId === MODULE_IDS.NOMINA) {
                         const preNomina = newModules.find(m => m.moduleId === MODULE_IDS.PRENOMINA);
                         if (preNomina) preNomina.isActive = false;
                    } else if (currentId === MODULE_IDS.PRENOMINA) {
                         const nomina = newModules.find(m => m.moduleId === MODULE_IDS.NOMINA);
                         if (nomina) {
                             nomina.isActive = false;
                             prev.requiresStamps = false;
                             prev.numberOfExtraRings = 0;
                         }
                    }
                }
            }
            
            const nextForm = { ...prev, moduleDetails: newModules };
            return recalculateAll(nextForm);
        });
    };

    const handleProductChange = (index, value) => {
        setForm(prev => {
            const newProds = [...prev.productDetails];
            newProds[index] = { ...newProds[index], quantity: Number(value) || 0 };
            
            const nextForm = { ...prev, productDetails: newProds };
            return recalculateAll(nextForm);
        });
    };

    const handleSave = async () => {
        if (!form.companyName || !form.clientName) {
            Alert.alert("Validación", "Compañía y Cliente son obligatorios.");
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form };

            payload.isActive = true;

            if (!id) {
                delete payload.id; 
                delete payload.folio;
                delete payload.created;
            }

            payload.monthlyDiscount = Number(payload.monthlyDiscount) || 0;
            payload.anualDiscount = Number(payload.anualDiscount) || 0;
            payload.months = Number(payload.months) || 1;
            payload.numberOfExtraUsers = Number(payload.numberOfExtraUsers) || 0;
            payload.numberOfExtraRings = Number(payload.numberOfExtraRings) || 0;

            payload.moduleDetails = payload.moduleDetails.map(m => {
                const { id: modId, quoteId, ...rest } = m; 
                return {
                    ...rest,
                    employeeNumber: Number(m.employeeNumber) || 0,
                    isActive: !!m.isActive
                };
            });

            payload.productDetails = payload.productDetails.map(p => {
                const { id: prodId, quoteId, ...rest } = p; 
                return {
                    ...rest,
                    productId: p.productId || p.id,
                    quantity: Number(p.quantity) || 0,
                    isActive: true
                };
            });
            
            if (id) {
                await updateQuote(id, payload);
                Alert.alert("Éxito", "Cotización actualizada");
            } else {
                await createQuote(payload);
                Alert.alert("Éxito", "Cotización creada");
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar la cotización. Revisa la consola para más detalles.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2b5cb5" /></View>;

    const tabs = ["Info", "Descuentos", "Módulos", "Hardware", "Resumen"];

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            
            <View style={styles.actionBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{id ? 'Editar Cotización' : 'Nueva Cotización'}</Text>
                <View style={{width: 26}} />
            </View>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {tabs.map((tab, i) => (
                        <TouchableOpacity 
                            key={i} 
                            style={[styles.tabButton, activeTab === i && styles.tabButtonActive]} 
                            onPress={() => setActiveTab(i)}
                        >
                            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 0 && <GeneralInfoTab data={form} onChange={handleGeneralChange} />}
                {activeTab === 1 && <DescuentosTab data={form} onChange={handleGeneralChange} />}
                {activeTab === 2 && <ModulesTab data={form} onModuleChange={handleModuleChange} onGeneralChange={handleGeneralChange} />}
                {activeTab === 3 && <ProductsTab products={form.productDetails} onProductChange={handleProductChange} />}
                {activeTab === 4 && <SummaryTab data={form} onSave={handleSave} saving={saving} />}
            </ScrollView>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    actionBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingTop: 65, 
        paddingBottom: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#F3F4F6'
    },
    backButton: { padding: 5 },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#111827',
        textAlign: 'center',
    },

    tabsContainer: { backgroundColor: 'white', paddingVertical: 12, shadowColor: "#000", shadowOpacity: 0.03, elevation: 1 },
    tabButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20, backgroundColor: '#F9FAFB' },
    tabButtonActive: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2b5cb5' },
    tabText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
    tabTextActive: { color: '#2b5cb5' },

    content: { flex: 1, padding: 20 },
    tabContent: { paddingBottom: 40 },
    
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginTop: 20, marginBottom: 12 },
    input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15 },
    disabledInput: { backgroundColor: '#F9FAFB', color: '#9CA3AF' },
    label: { fontSize: 13, color: '#4B5563', marginBottom: 6, fontWeight: '500' },
    helperText: { fontSize: 12, color: '#EF4444', marginBottom: 2 },
    row: { flexDirection: 'row', marginBottom: 10 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#F3F4F6' },

    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 3, elevation: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    resultLabel: { color: '#6B7280', fontSize: 14 },
    resultValue: { fontWeight: '600', color: '#111827', fontSize: 14 },

    productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    productName: { fontSize: 14, fontWeight: '600', color: '#374151' },
    productPrice: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    inputCentered: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, textAlign: 'center', minWidth: 60, fontSize: 16 },

    summaryCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
    summaryHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#2b5cb5' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
    bold: { fontWeight: 'bold', color: '#111827' },
    totalText: { fontSize: 18, fontWeight: '800', color: '#111827' },

    saveButton: {
        backgroundColor: '#ecfdf5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#15c899',
        shadowColor: '#15c899',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    saveButtonText: {
        color: '#15c899',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5
    }
});