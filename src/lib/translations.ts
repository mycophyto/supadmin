import { Language, useConfigStore } from '@/store/configStore';

type TranslationKey = 
  | 'dashboard'
  | 'tables'
  | 'settings'
  | 'help'
  | 'recordsCount'
  | 'search'
  | 'add'
  | 'edit'
  | 'delete'
  | 'save'
  | 'cancel'
  | 'confirmDelete'
  | 'noRecords'
  | 'loading'
  | 'tableSchema'
  | 'addRecord'
  | 'editRecord'
  | 'deleteRecord'
  | 'refresh'
  | 'back'
  | 'next'
  | 'previous'
  | 'emptyValue'
  | 'totalTables'
  | 'totalRecords'
  | 'storageUsed'
  | 'lastActivity'
  | 'recordsByTable'
  | 'recentActivity'
  | 'newRecordCreated'
  | 'tableSchemaUpdated'
  | 'recordsUpdated'
  | 'recordsDeleted'
  | 'noTablesFound'
  | 'createTable'
  | 'viewTable'
  | 'tableNotFound'
  | 'backToTables'
  | 'connect'
  | 'configure'
  | 'supabaseUrl'
  | 'supabaseKey'
  | 'welcomeToAdminDB'
  | 'connectToSupabase'
  | 'enterSupabaseCredentials'
  | 'selfHosted'
  | 'hostedOnSupabase'
  | 'customizeTableNames'
  | 'language'
  | 'english'
  | 'french'
  | 'inTable'
  | 'disconnect'
  | 'chooseLanguage'
  | 'customizeTableNamesDescription'
  | 'primaryKey'
  | 'fieldType'
  | 'missingFields'
  | 'provideCredentials'
  | 'connectedSuccessfully'
  | 'supabaseConnected'
  | 'connectionFailed'
  | 'invalidCredentials'
  | 'connectionError'
  | 'connectionErrorDescription'
  | 'selfHostedCorsWarning'
  | 'pageNotFound'
  | 'returnToHome'
  | 'tableVisibility'
  | 'tableVisibilityDescription'
  | 'showTable'
  | 'hideTable'
  | 'browseAndManageTables'
  | 'searchTables'
  | 'tryDifferentSearch'
  | 'createTableToStart'
  | 'clearSearch'
  | 'noDescription'
  | 'records'
  | 'storagePreference'
  | 'storagePreferenceDescription'
  | 'localStorage'
  | 'localStorageDescription'
  | 'supabaseStorage'
  | 'supabaseStorageDescription'
  | 'createSettingsTable'
  | 'settingsTableCreated'
  | 'settingsTableError'
  | 'testing'
  | 'configuring'
  | 'settingsConfigured'
  | 'localStorageConfigured'
  | 'supabaseStorageConfigured'
  | 'configurationFailed'
  | 'localStorageError'
  | 'supabaseStorageError';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    dashboard: 'Dashboard',
    tables: 'Tables',
    settings: 'Settings',
    help: 'Help',
    recordsCount: 'records',
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirmDelete: 'Are you sure you want to delete this record?',
    noRecords: 'No records found',
    loading: 'Loading...',
    tableSchema: 'Table Schema',
    addRecord: 'Add Record',
    editRecord: 'Edit Record',
    deleteRecord: 'Delete Record',
    refresh: 'Refresh',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    emptyValue: 'Empty',
    totalTables: 'Total Tables',
    totalRecords: 'Total Records',
    storageUsed: 'Storage Used',
    lastActivity: 'Last Activity',
    recordsByTable: 'Records by Table',
    recentActivity: 'Recent Activity',
    newRecordCreated: 'New record created',
    tableSchemaUpdated: 'Table schema updated',
    recordsUpdated: 'Records updated',
    recordsDeleted: 'Records deleted',
    noTablesFound: 'No tables found',
    createTable: 'Create Table',
    viewTable: 'View Table',
    tableNotFound: 'Table not found',
    backToTables: 'Back to Tables',
    connect: 'Connect',
    configure: 'Configure',
    supabaseUrl: 'Supabase URL',
    supabaseKey: 'Supabase API Key',
    welcomeToAdminDB: 'Welcome to AdminDB',
    connectToSupabase: 'Connect to Supabase',
    enterSupabaseCredentials: 'Enter your Supabase credentials to get started',
    selfHosted: 'Self-hosted',
    hostedOnSupabase: 'Hosted on Supabase.com',
    customizeTableNames: 'Customize Table Names',
    language: 'Language',
    english: 'English',
    french: 'French',
    inTable: 'In table',
    disconnect: 'Disconnect',
    chooseLanguage: 'Choose your preferred language',
    customizeTableNamesDescription: 'Customize how table names are displayed in the interface',
    primaryKey: 'Primary Key',
    fieldType: 'Field Type',
    missingFields: 'Missing fields',
    provideCredentials: 'Please provide both Supabase URL and API key',
    connectedSuccessfully: 'Connected successfully!',
    supabaseConnected: 'Your Supabase instance is now connected.',
    connectionFailed: 'Connection failed',
    invalidCredentials: 'Unable to connect to Supabase with the provided credentials.',
    connectionError: 'Connection error',
    connectionErrorDescription: 'An error occurred while trying to connect to Supabase.',
    selfHostedCorsWarning: 'For self-hosted instances, you\'ll need to configure CORS in your Supabase server to allow requests from this origin. Add \'{origin}\' to your allowed origins.',
    pageNotFound: 'Oops! Page not found',
    returnToHome: 'Return to Home',
    tableVisibility: 'Table Visibility',
    tableVisibilityDescription: 'Choose which tables to display in the interface',
    showTable: 'Show table',
    hideTable: 'Hide table',
    browseAndManageTables: 'Browse and manage your database tables',
    searchTables: 'Search tables...',
    tryDifferentSearch: 'Try with a different search term',
    createTableToStart: 'Create a new table to get started',
    clearSearch: 'Clear Search',
    noDescription: 'No description available',
    records: 'Records',
    storagePreference: 'Storage Preference',
    storagePreferenceDescription: 'Choose where to store your application settings',
    localStorage: 'Local Storage',
    localStorageDescription: 'Settings will be stored in your browser',
    supabaseStorage: 'Supabase Database',
    supabaseStorageDescription: 'Settings will be stored in your Supabase database',
    createSettingsTable: 'Create Settings Table',
    settingsTableCreated: 'Settings table created successfully',
    settingsTableError: 'Failed to create settings table',
    testing: 'Testing connection...',
    configuring: 'Configuring...',
    settingsConfigured: 'Settings configured',
    localStorageConfigured: 'Local storage configured successfully',
    supabaseStorageConfigured: 'Supabase storage configured successfully',
    configurationFailed: 'Configuration failed',
    localStorageError: 'Failed to configure local storage',
    supabaseStorageError: 'Failed to configure Supabase storage'
  },
  fr: {
    dashboard: 'Tableau de bord',
    tables: 'Tables',
    settings: 'Paramètres',
    help: 'Aide',
    recordsCount: 'enregistrements',
    search: 'Rechercher',
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
    noRecords: 'Aucun enregistrement trouvé',
    loading: 'Chargement...',
    tableSchema: 'Schéma de la table',
    addRecord: 'Ajouter un enregistrement',
    editRecord: 'Modifier l\'enregistrement',
    deleteRecord: 'Supprimer l\'enregistrement',
    refresh: 'Rafraîchir',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    emptyValue: 'Vide',
    totalTables: 'Total des tables',
    totalRecords: 'Total des enregistrements',
    storageUsed: 'Espace utilisé',
    lastActivity: 'Dernière activité',
    recordsByTable: 'Enregistrements par table',
    recentActivity: 'Activité récente',
    newRecordCreated: 'Nouvel enregistrement créé',
    tableSchemaUpdated: 'Schéma de table mis à jour',
    recordsUpdated: 'Enregistrements mis à jour',
    recordsDeleted: 'Enregistrements supprimés',
    noTablesFound: 'Aucune table trouvée',
    createTable: 'Créer une table',
    viewTable: 'Voir la table',
    tableNotFound: 'Table non trouvée',
    backToTables: 'Retour aux tables',
    connect: 'Connecter',
    configure: 'Configurer',
    supabaseUrl: 'URL Supabase',
    supabaseKey: 'Clé API Supabase',
    welcomeToAdminDB: 'Bienvenue sur AdminDB',
    connectToSupabase: 'Connexion à Supabase',
    enterSupabaseCredentials: 'Entrez vos identifiants Supabase pour commencer',
    selfHosted: 'Auto-hébergé',
    hostedOnSupabase: 'Hébergé sur Supabase.com',
    customizeTableNames: 'Personnaliser les noms de tables',
    language: 'Langue',
    english: 'Anglais',
    french: 'Français',
    inTable: 'Dans la table',
    disconnect: 'Déconnecter',
    chooseLanguage: 'Choisissez votre langue préférée',
    customizeTableNamesDescription: 'Personnalisez l\'affichage des noms de tables dans l\'interface',
    primaryKey: 'Clé primaire',
    fieldType: 'Type de champ',
    missingFields: 'Champs manquants',
    provideCredentials: 'Veuillez fournir l\'URL Supabase et la clé API',
    connectedSuccessfully: 'Connexion réussie !',
    supabaseConnected: 'Votre instance Supabase est maintenant connectée.',
    connectionFailed: 'Échec de la connexion',
    invalidCredentials: 'Impossible de se connecter à Supabase avec les identifiants fournis.',
    connectionError: 'Erreur de connexion',
    connectionErrorDescription: 'Une erreur s\'est produite lors de la tentative de connexion à Supabase.',
    selfHostedCorsWarning: 'Pour les instances auto-hébergées, vous devez configurer CORS dans votre serveur Supabase pour autoriser les requêtes depuis cette origine. Ajoutez \'{origin}\' à vos origines autorisées.',
    pageNotFound: 'Oups ! Page non trouvée',
    returnToHome: 'Retour à l\'accueil',
    tableVisibility: 'Visibilité des tables',
    tableVisibilityDescription: 'Choisissez quelles tables afficher dans l\'interface',
    showTable: 'Afficher la table',
    hideTable: 'Masquer la table',
    browseAndManageTables: 'Parcourir et gérer vos tables de base de données',
    searchTables: 'Rechercher des tables...',
    tryDifferentSearch: 'Essayez avec un autre terme de recherche',
    createTableToStart: 'Créez une nouvelle table pour commencer',
    clearSearch: 'Effacer la recherche',
    noDescription: 'Aucune description disponible',
    records: 'Enregistrements',
    storagePreference: 'Préférence de stockage',
    storagePreferenceDescription: 'Choisissez où stocker les paramètres de votre application',
    localStorage: 'Stockage local',
    localStorageDescription: 'Les paramètres seront stockés dans votre navigateur',
    supabaseStorage: 'Base de données Supabase',
    supabaseStorageDescription: 'Les paramètres seront stockés dans votre base de données Supabase',
    createSettingsTable: 'Créer la table des paramètres',
    settingsTableCreated: 'Table des paramètres créée avec succès',
    settingsTableError: 'Échec de la création de la table des paramètres',
    testing: 'Test de la connexion...',
    configuring: 'Configuration...',
    settingsConfigured: 'Paramètres configurés',
    localStorageConfigured: 'Stockage local configuré avec succès',
    supabaseStorageConfigured: 'Stockage Supabase configuré avec succès',
    configurationFailed: 'Échec de la configuration',
    localStorageError: 'Échec de la configuration du stockage local',
    supabaseStorageError: 'Échec de la configuration du stockage Supabase'
  }
};

export function useTranslation() {
  const { language } = useConfigStore();
  
  function t(key: TranslationKey): string {
    return translations[language][key];
  }
  
  return { t };
}
