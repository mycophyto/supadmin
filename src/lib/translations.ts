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
  | 'supabaseStorageError'
  | 'connection.title'
  | 'connection.description'
  | 'connection.urlLabel'
  | 'connection.urlPlaceholder'
  | 'connection.keyLabel'
  | 'connection.keyPlaceholder'
  | 'connection.serviceKeyLabel'
  | 'connection.serviceKeyPlaceholder'
  | 'connection.connect'
  | 'connection.connecting'
  | 'connection.success'
  | 'connection.successDescription'
  | 'connection.failed'
  | 'connection.invalidUrl'
  | 'connection.invalidKey'
  | 'connection.selfHostedWarning'
  | 'connection.storageType'
  | 'connection.localStorage'
  | 'connection.supabaseStorage'
  | 'connection.supabaseHosted'
  | 'connection.selfHosted'
  | 'connection.serviceKeyDescription'
  | 'onboarding.title'
  | 'onboarding.description'
  | 'onboarding.instanceType'
  | 'onboarding.storageType'
  | 'onboarding.supabaseHosted'
  | 'onboarding.selfHosted'
  | 'onboarding.localStorage'
  | 'onboarding.supabaseStorage'
  | 'onboarding.urlLabel'
  | 'onboarding.supabaseUrlPlaceholder'
  | 'onboarding.selfHostedUrlPlaceholder'
  | 'onboarding.keyLabel'
  | 'onboarding.keyPlaceholder'
  | 'onboarding.serviceKeyLabel'
  | 'onboarding.serviceKeyPlaceholder'
  | 'onboarding.serviceKeyDescription'
  | 'onboarding.selfHostedWarning'
  | 'onboarding.connect'
  | 'onboarding.connecting'
  | 'onboarding.errors.invalidUrl'
  | 'onboarding.errors.invalidKey'
  | 'onboarding.errors.serviceKeyRequired'
  | 'onboarding.errors.connectionFailed'
  | 'onboarding.success.title'
  | 'onboarding.success.description'
  | 'copy'
  | 'copySQLInstructions'
  | 'errorLoadingTable';

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
    supabaseStorageError: 'Failed to configure Supabase storage',
    'connection.title': 'Connect to Supabase',
    'connection.description': 'Enter your Supabase project details to get started',
    'connection.urlLabel': 'Project URL',
    'connection.urlPlaceholder': 'https://your-project.supabase.co or http://localhost:54321',
    'connection.keyLabel': 'Anon Key',
    'connection.keyPlaceholder': 'your-anon-key',
    'connection.serviceKeyLabel': 'Service Role Key (Optional)',
    'connection.serviceKeyPlaceholder': 'your-service-role-key',
    'connection.connect': 'Connect',
    'connection.connecting': 'Connecting...',
    'connection.success': 'Connected Successfully',
    'connection.successDescription': 'Your Supabase connection has been established.',
    'connection.failed': 'Connection failed. Please check your credentials.',
    'connection.invalidUrl': 'Please enter a valid URL',
    'connection.invalidKey': 'Please enter a valid key',
    'connection.selfHostedWarning': 'For self-hosted instances, make sure to enable CORS for {origin}',
    'connection.storageType': 'Storage Type',
    'connection.localStorage': 'Local Storage',
    'connection.supabaseStorage': 'Supabase Storage',
    'connection.supabaseHosted': 'Supabase Hosted',
    'connection.selfHosted': 'Self Hosted',
    'connection.serviceKeyDescription': 'Required for self-hosted instances with Supabase storage',
    'onboarding.title': 'Welcome to AdminDB',
    'onboarding.description': 'Connect to your Supabase instance to get started',
    'onboarding.instanceType': 'Instance Type',
    'onboarding.storageType': 'Storage Type',
    'onboarding.supabaseHosted': 'Supabase Hosted',
    'onboarding.selfHosted': 'Self Hosted',
    'onboarding.localStorage': 'Local Storage',
    'onboarding.supabaseStorage': 'Supabase Storage',
    'onboarding.urlLabel': 'Project URL',
    'onboarding.supabaseUrlPlaceholder': 'https://your-project.supabase.co',
    'onboarding.selfHostedUrlPlaceholder': 'http://localhost:54321',
    'onboarding.keyLabel': 'Anon Key',
    'onboarding.keyPlaceholder': 'your-anon-key',
    'onboarding.serviceKeyLabel': 'Service Role Key',
    'onboarding.serviceKeyPlaceholder': 'your-service-role-key',
    'onboarding.serviceKeyDescription': 'Required for self-hosted instances with Supabase storage',
    'onboarding.selfHostedWarning': 'For self-hosted instances, make sure to enable CORS for {origin}',
    'onboarding.connect': 'Connect',
    'onboarding.connecting': 'Connecting...',
    'onboarding.errors.invalidUrl': 'Please enter a valid URL',
    'onboarding.errors.invalidKey': 'Please enter a valid key',
    'onboarding.errors.serviceKeyRequired': 'Service role key is required for self-hosted instances with Supabase storage',
    'onboarding.errors.connectionFailed': 'Connection failed. Please check your credentials.',
    'onboarding.success.title': 'Connected Successfully',
    'onboarding.success.description': 'Your Supabase connection has been established.',
    copy: 'Copy',
    copySQLInstructions: 'Copy SQL Instructions',
    errorLoadingTable: 'Error loading table data',
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
    supabaseStorageError: 'Échec de la configuration du stockage Supabase',
    'connection.title': 'Se connecter à Supabase',
    'connection.description': 'Entrez les détails de votre projet Supabase pour commencer',
    'connection.urlLabel': 'URL du projet',
    'connection.urlPlaceholder': 'https://votre-projet.supabase.co ou http://localhost:54321',
    'connection.keyLabel': 'Clé Anon',
    'connection.keyPlaceholder': 'votre-clé-anon',
    'connection.serviceKeyLabel': 'Clé Service Role (Optionnel)',
    'connection.serviceKeyPlaceholder': 'votre-clé-service-role',
    'connection.connect': 'Se connecter',
    'connection.connecting': 'Connexion en cours...',
    'connection.success': 'Connecté avec succès',
    'connection.successDescription': 'Votre connexion Supabase a été établie.',
    'connection.failed': 'Échec de la connexion. Vérifiez vos identifiants.',
    'connection.invalidUrl': 'Veuillez entrer une URL valide',
    'connection.invalidKey': 'Veuillez entrer une clé valide',
    'connection.selfHostedWarning': 'Pour les instances auto-hébergées, assurez-vous d\'activer CORS pour {origin}',
    'connection.storageType': 'Type de stockage',
    'connection.localStorage': 'Stockage local',
    'connection.supabaseStorage': 'Stockage Supabase',
    'connection.supabaseHosted': 'Hébergé par Supabase',
    'connection.selfHosted': 'Auto-hébergé',
    'connection.serviceKeyDescription': 'Requis pour les instances auto-hébergées avec stockage Supabase',
    'onboarding.title': 'Bienvenue sur AdminDB',
    'onboarding.description': 'Connectez-vous à votre instance Supabase pour commencer',
    'onboarding.instanceType': 'Type d\'instance',
    'onboarding.storageType': 'Type de stockage',
    'onboarding.supabaseHosted': 'Hébergé par Supabase',
    'onboarding.selfHosted': 'Auto-hébergé',
    'onboarding.localStorage': 'Stockage local',
    'onboarding.supabaseStorage': 'Stockage Supabase',
    'onboarding.urlLabel': 'URL du projet',
    'onboarding.supabaseUrlPlaceholder': 'https://votre-projet.supabase.co',
    'onboarding.selfHostedUrlPlaceholder': 'http://localhost:54321',
    'onboarding.keyLabel': 'Clé Anon',
    'onboarding.keyPlaceholder': 'votre-clé-anon',
    'onboarding.serviceKeyLabel': 'Clé Service Role',
    'onboarding.serviceKeyPlaceholder': 'votre-clé-service-role',
    'onboarding.serviceKeyDescription': 'Requis pour les instances auto-hébergées avec stockage Supabase',
    'onboarding.selfHostedWarning': 'Pour les instances auto-hébergées, assurez-vous d\'activer CORS pour {origin}',
    'onboarding.connect': 'Se connecter',
    'onboarding.connecting': 'Connexion en cours...',
    'onboarding.errors.invalidUrl': 'Veuillez entrer une URL valide',
    'onboarding.errors.invalidKey': 'Veuillez entrer une clé valide',
    'onboarding.errors.serviceKeyRequired': 'La clé service role est requise pour les instances auto-hébergées avec stockage Supabase',
    'onboarding.errors.connectionFailed': 'Échec de la connexion. Vérifiez vos identifiants.',
    'onboarding.success.title': 'Connecté avec succès',
    'onboarding.success.description': 'Votre connexion Supabase a été établie.',
    copy: 'Copier',
    copySQLInstructions: 'Copier les instructions SQL',
    errorLoadingTable: 'Erreur lors de la chargement des données de la table',
  }
};

export function useTranslation() {
  const { language } = useConfigStore();
  
  function t(key: TranslationKey): string {
    return translations[language][key];
  }
  
  return { t };
}
