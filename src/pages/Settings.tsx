import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { getTables } from '@/lib/supabase';
import { useTranslation } from '@/lib/translations';
import { Language, useConfigStore } from '@/store/configStore';
import { useQuery } from '@tanstack/react-query';
import { Database, Eye, EyeOff, Globe, Pencil } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { t } = useTranslation();
  const { 
    language, 
    setLanguage, 
    tableDisplayNames, 
    setTableDisplayName,
    hiddenTables,
    setHiddenTable,
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
      title: value === 'en' ? t('language') + ' updated' : t('language') + ' mise à jour',
      description: value === 'en' 
        ? t('chooseLanguage')
        : t('chooseLanguage'),
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

  const handleVisibilityToggle = (tableName: string) => {
    setHiddenTable(tableName, !hiddenTables.includes(tableName));
    toast({
      title: hiddenTables.includes(tableName) ? t('showTable') : t('hideTable'),
      description: tableName,
    });
  };
  
  const handleDisconnect = () => {
    if (confirm(t('confirmDelete'))) {
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
                    {t('chooseLanguage')}
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
                        {t('disconnect')}
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
                  <Database className="h-5 w-5 mr-2" />
                  {t('tables')}
                </CardTitle>
                <CardDescription>
                  {t('customizeTableNamesDescription')}
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
                        <div className="flex-1">
                          {editMode[table.name] ? (
                            <Input
                              className="w-full"
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
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="font-medium">
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVisibilityToggle(table.name)}
                          className="flex items-center gap-2"
                        >
                          {hiddenTables.includes(table.name) ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              {t('showTable')}
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              {t('hideTable')}
                            </>
                          )}
                        </Button>
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
