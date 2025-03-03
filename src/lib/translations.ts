
import { Language } from '@/store/configStore';
import { useConfigStore } from '@/store/configStore';

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
  | 'french';

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
    french: 'French'
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
    french: 'Français'
  }
};

export function useTranslation() {
  const { language } = useConfigStore();
  
  function t(key: TranslationKey): string {
    return translations[language][key];
  }
  
  return { t };
}
