
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useConfigStore, Language } from '@/store/configStore';
import { useTranslation } from '@/lib/translations';
import { getTables } from '@/lib/supabase';
import { Globe, Pencil, Database } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

export default function Settings() {
  const { t } = useTranslation();
  const { 
    language, 
    setLanguage, 
    tableDisplayNames, 
    setTableDisplayName, 
    supabaseConfig,
    clearSupabaseConfig
  } = useConfigStore();
  
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: getTables,
  });
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
    
    toast({
      title: value === 'en' ? 'Language updated' : 'Langue mise à jour',
      description: value === 'en' 
        ? 'The interface will now be displayed in English' 
        : 'L\'interface sera maintenant affichée en français',
    });
  };
  
  const toggleEditMode = (tableName: string) => {
    setEditMode(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };
  
  const handleDisplayNameChange = (tableName: string, displayName: string) => {
    setTableDisplayName(tableName, displayName);
    toggleEditMode(tableName);
    
    toast({
      title: t('save'),
      description: `${tableName} → ${displayName}`,
    });
  };
  
  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect from Supabase?')) {
      clearSupabaseConfig();
      window.location.href = '/onboarding';
    }
  };
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <main className="p-6 pt-4">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Globe className="h-5 w-5 mr-2" />
                    {t('language')}
                  </CardTitle>
                  <CardDescription>
                    {language === 'en' 
                      ? 'Choose your preferred language' 
                      : 'Choisissez votre langue préférée'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">{t('language')}</Label>
                      <Select
                        value={language}
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder={t('language')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">{t('english')}</SelectItem>
                          <SelectItem value="fr">{t('french')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Database className="h-5 w-5 mr-2" />
                    {t('connectToSupabase')}
                  </CardTitle>
                  <CardDescription>
                    {supabaseConfig.isConfigured 
                      ? supabaseConfig.url 
                      : t('enterSupabaseCredentials')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supabaseConfig.isConfigured ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleDisconnect}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => window.location.href = '/onboarding'}
                      >
                        {t('configure')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Pencil className="h-5 w-5 mr-2" />
                  {t('customizeTableNames')}
                </CardTitle>
                <CardDescription>
                  {language === 'en' 
                    ? 'Customize how table names are displayed in the interface' 
                    : 'Personnalisez l\'affichage des noms de tables dans l\'interface'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">{t('loading')}</div>
                ) : tables.length === 0 ? (
                  <div className="text-center py-4">{t('noTablesFound')}</div>
                ) : (
                  <div className="space-y-4">
                    {tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between space-x-2">
                        <div className="font-medium">{table.name}</div>
                        {editMode[table.name] ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              className="w-40"
                              defaultValue={tableDisplayNames[table.name] || table.name}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleDisplayNameChange(
                                    table.name, 
                                    (e.target as HTMLInputElement).value
                                  );
                                }
                              }}
                            />
                            <Button 
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement)
                                  .closest('.flex')
                                  ?.querySelector('input');
                                if (input) {
                                  handleDisplayNameChange(table.name, input.value);
                                }
                              }}
                            >
                              {t('save')}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="text-muted-foreground">
                              {tableDisplayNames[table.name] || table.name}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleEditMode(table.name)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
