import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getProductPriceSchemes } from '../services/productPriceService';
import { getQuoteById, createQuote, updateQuote } from '../services/quoteService';
import { useQuoteCalculator } from '../hooks/useQuoteCalculator';
import { INITIAL_MODULES, HARDCODED_PRODUCTS, MODULE_IDS, PERIODICITIES } from '../utils/quoteConstants';
// Importamos SELLER_PHONES
import { SELLER_PHONES } from '../utils/constants'; 
import { useClients } from '../context/ClientContext';
import { useThemeColors } from '../hooks/useThemeColors';

const GeneralInfoTab = ({ data, onChange, onPeriodicityChange, colors, isDark }) => {
    return (
        <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Datos del Cliente</Text>
            <TextInput 
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} 
                placeholder="Nombre de la Compañía *" 
                placeholderTextColor={colors.textSecondary}
                value={data.companyName} 
                onChangeText={(t) => onChange('companyName', t)} 
            />
            <TextInput 
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} 
                placeholder="Nombre del Cliente *" 
                placeholderTextColor={colors.textSecondary}
                value={data.clientName} 
                onChangeText={(t) => onChange('clientName', t)} 
            />
            
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Configuración de Cotización</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Periodicidad</Text>
            
            <View style={styles.periodicityGrid}>
                {PERIODICITIES.map((p) => {
                    const isActive = data.periodicity === p.id;
                    return (
                        <TouchableOpacity 
                            key={p.id} 
                            style={[
                                styles.periodicityBlock,
                                { 
                                    backgroundColor: colors.card,
                                    borderColor: colors.border 
                                },
                                isActive && { 
                                    backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF', 
                                    borderColor: colors.primary 
                                }
                            ]}
                            onPress={() => onPeriodicityChange(p.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.periodicityBlockText,
                                { color: colors.textSecondary },
                                isActive && { color: colors.primary, fontWeight: '700' }
                            ]}>
                                {p.description}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={{height: 15}} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Datos del Vendedor</Text>
            <View style={styles.readOnlyContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
                <TextInput 
                    style={[styles.input, styles.disabledInput, { backgroundColor: isDark ? colors.background : '#F9FAFB', color: colors.textSecondary, borderColor: colors.border }]} 
                    value={data.employeeName} 
                    editable={false} 
                />
                <View style={styles.row}>
                    <View style={{flex: 1, marginRight: 10}}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
                        <TextInput 
                            style={[
                                styles.input, 
                                { 
                                    backgroundColor: colors.card, 
                                    color: colors.text, 
                                    borderColor: colors.border 
                                }
                            ]} 
                            value={data.phone} 
                            onChangeText={(t) => onChange('phone', t)}
                            keyboardType="phone-pad"
                            placeholder="Teléfono"
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Puesto</Text>
                        <TextInput 
                            style={[styles.input, styles.disabledInput, { backgroundColor: isDark ? colors.background : '#F9FAFB', color: colors.textSecondary, borderColor: colors.border }]} 
                            value={data.jobPosition} 
                            editable={false} 
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const DescuentosTab = ({ data, onChange, colors }) => (
    <View style={styles.tabContent}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Descuentos</Text>
        <Text style={[styles.helperTextGray, { color: colors.textSecondary }]}>El descuento se aplica automáticamente según la periodicidad, pero puedes modificarlo manualmente.</Text>
        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Descuento General (%)</Text>
                <TextInput 
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} 
                    value={data.discount?.toString()} 
                    onChangeText={(t) => onChange('discount', t)} 
                    keyboardType="numeric" 
                    placeholder="0" 
                    placeholderTextColor={colors.textSecondary}
                />
            </View>
            <View style={{flex: 1}} />
        </View>
    </View>
);

const ModulesTab = ({ data, onModuleChange, onGeneralChange, colors, isDark }) => {
    const nominaModule = data.moduleDetails.find(m => m.moduleId === MODULE_IDS.NOMINA);
    const isNominaActive = nominaModule ? nominaModule.isActive : false;
    const currentPeriodicity = PERIODICITIES.find(p => p.id === data.periodicity) || PERIODICITIES[0];
    
    return (
        <ScrollView style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { marginTop: 0, color: colors.textSecondary }]}>Módulos Contratados</Text>
            {data.moduleDetails.map((mod, index) => (
                <View key={mod.moduleId} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{mod.name}</Text>
                        <Switch 
                            value={mod.isActive} 
                            onValueChange={(val) => onModuleChange(index, 'isActive', val)} 
                            trackColor={{ false: colors.border, true: colors.primary }} 
                        />
                    </View>
                    {mod.isActive && (
                        <View style={styles.cardBody}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Número de Empleados</Text>
                            <TextInput 
                                style={[styles.input, { backgroundColor: isDark ? colors.background : '#fff', color: colors.text, borderColor: colors.border }]} 
                                value={mod.employeeNumber?.toString()} 
                                onChangeText={(t) => onModuleChange(index, 'employeeNumber', t)} 
                                keyboardType="numeric" 
                            />
                            <View style={styles.resultRow}>
                                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Precio Unitario:</Text>
                                <Text style={[styles.resultValue, { color: colors.text }]}>${mod.price?.toFixed(2)}</Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Total ({currentPeriodicity.description}):</Text>
                                <Text style={[styles.resultValue, {color: colors.primary}]}>${mod.totalPrice?.toFixed(2)}</Text>
                            </View>
                            {mod.stamp > 0 && (
                                <View style={styles.resultRow}>
                                    <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Timbres incluidos:</Text>
                                    <Text style={[styles.resultValue, { color: colors.text }]}>{mod.stamp}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            ))}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Extras y Adicionales</Text>
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Usuarios Extra</Text>
                    <TextInput 
                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} 
                        value={data.numberOfExtraUsers?.toString()} 
                        onChangeText={(t) => onGeneralChange('numberOfExtraUsers', t)} 
                        keyboardType="numeric" 
                    />
                </View>
                <View style={{flex: 1}}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Timbres Extra</Text>
                    <TextInput 
                        style={[
                            styles.input, 
                            { 
                                backgroundColor: !data.requiresStamps ? (isDark ? colors.background : '#F9FAFB') : colors.card, 
                                color: !data.requiresStamps ? colors.textSecondary : colors.text, 
                                borderColor: colors.border 
                            }
                        ]} 
                        value={data.numberOfExtraRings?.toString()} 
                        onChangeText={(t) => onGeneralChange('numberOfExtraRings', t)} 
                        keyboardType="numeric" 
                        editable={data.requiresStamps} 
                    />
                </View>
            </View>
            <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>¿Requiere Timbres?</Text>
                    {!isNominaActive && <Text style={styles.helperText}>Requiere módulo Nómina activo</Text>}
                </View>
                <Switch 
                    value={data.requiresStamps} 
                    onValueChange={(val) => onGeneralChange('requiresStamps', val)} 
                    trackColor={{ false: colors.border, true: colors.primary }} 
                    disabled={!isNominaActive} 
                />
            </View>
            <View style={{height: 40}} />
        </ScrollView>
    );
};

const ProductsTab = ({ products, onProductChange, colors }) => (
    <View style={styles.tabContent}>
        {products.map((prod, index) => (
            <View key={index} style={[styles.productRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{flex: 1}}>
                    <Text style={[styles.productName, { color: colors.text }]}>{prod.name}</Text>
                    <Text style={[styles.productPrice, { color: colors.textSecondary }]}>${prod.price?.toFixed(2)}</Text>
                </View>
                <View style={{width: 80}}>
                    <TextInput 
                        style={[styles.inputCentered, { borderColor: colors.border, color: colors.text }]} 
                        value={prod.quantity?.toString()} 
                        onChangeText={(t) => onProductChange(index, t)} 
                        keyboardType="numeric" 
                        placeholder="0" 
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>
        ))}
        <View style={{height: 20}} />
    </View>
);

const SummaryTab = ({ data, onSave, saving, colors, isDark }) => {
    const format = (n) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
    };
    const currentPeriodicity = PERIODICITIES.find(p => p.id === data.periodicity) || PERIODICITIES[0];
    
    const TextVal = ({children, style}) => <Text style={[{color: colors.text}, style]}>{children}</Text>;
    const TextLbl = ({children}) => <Text style={{color: colors.textSecondary}}>{children}</Text>;

    return (
        <ScrollView style={styles.tabContent}>
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.summaryHeader, { color: colors.primary }]}>Resumen ({currentPeriodicity.description})</Text>
                <View style={styles.summaryRow}><TextLbl>Módulos:</TextLbl><TextVal>{format(data.moduleSupTotal)}</TextVal></View>
                <View style={styles.summaryRow}><TextLbl>Usuarios Extra:</TextLbl><TextVal>{format(data.amountExtraUsers)}</TextVal></View>
                <View style={styles.summaryRow}><TextLbl>Timbres ({data.requiresStamps ? 'Sí' : 'No'}):</TextLbl><TextVal>{format(data.amountStamp)}</TextVal></View>
                <View style={styles.summaryRow}><TextLbl>Timbres Extra:</TextLbl><TextVal>{format(data.amountExtraRings)}</TextVal></View>
                <View style={styles.summaryRow}>
                    <TextLbl>Descuento ({data.discount}%):</TextLbl>
                    <Text style={{color: colors.danger}}>-{format(data.amountDiscount)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryRow}><Text style={[styles.bold, { color: colors.text }]}>Subtotal:</Text><Text style={[styles.bold, { color: colors.text }]}>{format(data.subTotal)}</Text></View>
                <View style={styles.summaryRow}><TextLbl>IVA (16%):</TextLbl><TextVal>{format(data.iva)}</TextVal></View>
                <View style={[styles.summaryRow, {marginTop: 10}]}>
                    <Text style={[styles.totalText, { color: colors.text }]}>Total:</Text>
                    <Text style={[styles.totalText, { color: colors.text }]}>{format(data.total)}</Text>
                </View>
            </View>

            {data.totalProducts > 0 && (
                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.summaryHeader, { color: colors.primary }]}>Hardware / Productos</Text>
                    <View style={styles.summaryRow}><TextLbl>Subtotal:</TextLbl><TextVal>{format(data.subTotalProducts)}</TextVal></View>
                    <View style={styles.summaryRow}><TextLbl>IVA:</TextLbl><TextVal>{format(data.ivaProducts)}</TextVal></View>
                    <View style={[styles.summaryRow, {marginTop: 10}]}>
                        <Text style={[styles.totalText, { color: colors.text }]}>Total Productos:</Text>
                        <Text style={[styles.totalText, { color: colors.text }]}>{format(data.totalProducts)}</Text>
                    </View>
                </View>
            )}

            <View style={[styles.grandTotalContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.grandTotalLabel}>VALOR TOTAL ESTIMADO</Text>
                <Text style={[styles.grandTotalValue, { color: colors.text }]}>{format(data.total + data.totalProducts)}</Text>
            </View>

            <TouchableOpacity 
                style={[
                    styles.saveButton, 
                    { 
                        backgroundColor: isDark ? 'rgba(21, 200, 153, 0.15)' : '#ecfdf5', 
                        borderColor: '#15c899' 
                    }
                ]} 
                onPress={onSave} 
                disabled={saving}
            >
                {saving ? <ActivityIndicator color="#15c899" /> : (
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
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useThemeColors();
    const { id } = route.params || {}; 
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [schemes, setSchemes] = useState([]);
    const [activeTab, setActiveTab] = useState(0); 
    const { userProfile } = useClients(); 
    const { calculateTotals, calculateProducts } = useQuoteCalculator(schemes);
    
    const [form, setForm] = useState({
        id: '', employeeName: '', folio: '', email: '', phone: '', jobPosition: '',
        periodicity: 1, discount: 0, clientName: '', companyName: '', requiresStamps: false,
        numberOfExtraUsers: 0, numberOfExtraRings: 0, totalStamp: 0,
        moduleDetails: JSON.parse(JSON.stringify(INITIAL_MODULES)),
        productDetails: HARDCODED_PRODUCTS.map(p => ({ ...p, productId: p.id, quantity: 0, total: 0 })),
        moduleSupTotal: 0, amountDiscount: 0, amountStamp: 0, amountExtraUsers: 0, amountExtraRings: 0,
        subTotal: 0, iva: 0, total: 0, subTotalProducts: 0, ivaProducts: 0, totalProducts: 0
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
                             return serverMod ? { ...initMod, ...serverMod, name: initMod.name, isActive: serverMod.isActive } : initMod;
                        });
                        next.productDetails = HARDCODED_PRODUCTS.map(initProd => {
                            const serverProd = quoteData.productDetails?.find(p => p.productId === initProd.id);
                            return serverProd ? { ...initProd, ...serverProd, name: initProd.name, quantity: serverProd.quantity } : { ...initProd, productId: initProd.id, quantity: 0, total: 0 };
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
                        // --- LÓGICA DE TELÉFONO ACTUALIZADA ---
                        // 1. Prioridad: Teléfono del usuario (si lo tuviera en el token)
                        // 2. Prioridad: Teléfono hardcodeado según ID
                        // 3. Fallback: Cadena vacía
                        const defaultPhone = user.phone || SELLER_PHONES[user.id] || '';
                        
                        setForm(prev => ({ 
                            ...prev, 
                            employeeName: fullName, 
                            email: user.email || '', 
                            phone: defaultPhone, 
                            jobPosition: user.jobPosition || '' 
                        }));
                    }
                }
            } catch (error) { Alert.alert("Error", "No se pudieron cargar los datos necesarios."); }
            finally { setLoading(false); }
        };
        init();
    }, [id, userProfile]);

    useEffect(() => { if (schemes.length > 0 && !loading) setForm(prev => recalculateAll(prev)); }, [schemes, loading, recalculateAll]);

    const handlePeriodicityChange = (newPeriodicity) => {
        const pObj = PERIODICITIES.find(p => p.id === newPeriodicity);
        setForm(prev => recalculateAll({ ...prev, periodicity: newPeriodicity, discount: pObj ? pObj.defaultDiscount : 0 }));
    };

    const handleGeneralChange = (field, value) => setForm(prev => recalculateAll({ ...prev, [field]: value }));

    const handleModuleChange = (index, field, value) => {
        setForm(prev => {
            const newModules = [...prev.moduleDetails];
            newModules[index] = { ...newModules[index], [field]: value };
            if (field === 'isActive' && value === false && newModules[index].moduleId === MODULE_IDS.NOMINA) {
                 prev.requiresStamps = false; prev.numberOfExtraRings = 0;
            }
            return recalculateAll({ ...prev, moduleDetails: newModules });
        });
    };

    const handleProductChange = (index, value) => {
        setForm(prev => {
            const newProds = [...prev.productDetails];
            newProds[index] = { ...newProds[index], quantity: Number(value) || 0 };
            return recalculateAll({ ...prev, productDetails: newProds });
        });
    };

    const handleSave = async () => {
        if (!form.companyName || !form.clientName) { 
            Alert.alert("Validación", "Compañía y Cliente son obligatorios."); 
            return; 
        }
        setSaving(true);
        try {
            const payload = { ...form, isActive: true };
            if (!id) { 
                delete payload.id; 
                delete payload.folio; 
                delete payload.created; 
            }

            // LIMPIEZA DE DATOS
            payload.moduleDetails = payload.moduleDetails
                .filter(m => m.isActive && (Number(m.employeeNumber) || 0) > 0)
                .map(m => { 
                    const { id: modId, quoteId, ...rest } = m; 
                    return { 
                        ...rest, 
                        employeeNumber: Number(m.employeeNumber), 
                        isActive: true 
                    }; 
                });

            payload.productDetails = payload.productDetails
                .filter(p => (Number(p.quantity) || 0) > 0)
                .map(p => { 
                    const { id: prodId, quoteId, ...rest } = p; 
                    return { 
                        ...rest, 
                        productId: p.productId || p.id, 
                        quantity: Number(p.quantity), 
                        isActive: true 
                    }; 
                });

            console.log("============ PAYLOAD LIMPIO ============");
            console.log(JSON.stringify(payload, null, 2));
            console.log("========================================");

            id ? await updateQuote(id, payload) : await createQuote(payload);
            Alert.alert("Éxito", id ? "Cotización actualizada" : "Cotización creada");
            navigation.goBack();
        } catch (error) { 
            console.error(error);
            Alert.alert("Error", "No se pudo guardar la cotización."); 
        }
        finally { setSaving(false); }
    };

    if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
    const tabs = ["Info", "Descuentos", "Módulos", "Hardware", "Resumen"];

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.card} />
            <View style={[styles.actionBar, { paddingTop: insets.top + 10, backgroundColor: colors.card, borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{id ? 'Editar Cotización' : 'Nueva Cotización'}</Text>
                <View style={{width: 26}} />
            </View>
            <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {tabs.map((tab, i) => (
                        <TouchableOpacity 
                            key={i} 
                            style={[
                                styles.tabButton, 
                                { backgroundColor: isDark ? colors.background : '#F9FAFB' },
                                activeTab === i && { 
                                    backgroundColor: isDark ? 'rgba(96, 165, 250, 0.15)' : '#EFF6FF', 
                                    borderWidth: 1, 
                                    borderColor: colors.primary 
                                }
                            ]} 
                            onPress={() => setActiveTab(i)}
                        >
                            <Text style={[
                                styles.tabText, 
                                { color: colors.textSecondary },
                                activeTab === i && { color: colors.primary }
                            ]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <ScrollView style={styles.content}>
                {activeTab === 0 && <GeneralInfoTab data={form} onChange={handleGeneralChange} onPeriodicityChange={handlePeriodicityChange} colors={colors} isDark={isDark} />}
                {activeTab === 1 && <DescuentosTab data={form} onChange={handleGeneralChange} colors={colors} />}
                {activeTab === 2 && <ModulesTab data={form} onModuleChange={handleModuleChange} onGeneralChange={handleGeneralChange} colors={colors} isDark={isDark} />}
                {activeTab === 3 && <ProductsTab products={form.productDetails} onProductChange={handleProductChange} colors={colors} />}
                {activeTab === 4 && <SummaryTab data={form} onSave={handleSave} saving={saving} colors={colors} isDark={isDark} />}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    tabsContainer: { paddingVertical: 12 },
    tabButton: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 5, borderRadius: 20 },
    tabText: { fontWeight: '600', fontSize: 13 },
    content: { flex: 1, padding: 20 },
    tabContent: { paddingBottom: 40 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 12 },
    input: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12 },
    disabledInput: { opacity: 0.8 },
    label: { fontSize: 13, marginBottom: 6, fontWeight: '500' },
    helperText: { fontSize: 12, color: '#EF4444' },
    helperTextGray: { fontSize: 12, marginBottom: 15 },
    row: { flexDirection: 'row', marginBottom: 10 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1 },
    card: { borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700' },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    resultLabel: { fontSize: 14 },
    resultValue: { fontWeight: '600' },
    productRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
    productName: { fontSize: 14, fontWeight: '600' },
    productPrice: { fontSize: 12 },
    inputCentered: { borderWidth: 1, borderRadius: 8, padding: 10, textAlign: 'center', minWidth: 60 },
    summaryCard: { padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1 },
    summaryHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, marginVertical: 12 },
    bold: { fontWeight: 'bold' },
    totalText: { fontSize: 18, fontWeight: '800' },
    
    grandTotalContainer: { 
        paddingVertical: 30, 
        paddingHorizontal: 20, 
        borderRadius: 20, 
        marginBottom: 25, 
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed'
    },
    grandTotalLabel: { 
        color: '#6B7280', 
        fontSize: 11, 
        fontWeight: '800', 
        letterSpacing: 2, 
        marginBottom: 6,
        textTransform: 'uppercase'
    },
    grandTotalValue: { 
        fontSize: 36, 
        fontWeight: '900',
        letterSpacing: -1
    },

    saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, borderWidth: 1 },
    saveButtonText: { color: '#15c899', fontWeight: 'bold', fontSize: 16 },
    
    periodicityGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    periodicityBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
    periodicityBlockText: { fontSize: 12, fontWeight: '500' }
});