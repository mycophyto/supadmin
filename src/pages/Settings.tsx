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
import { getSetting, setSetting } from '@/lib/db';
import { getTables } from '@/lib/supabase';
import { useTranslation } from '@/lib/translations';
import { Language, useConfigStore } from '@/store/configStore';
import { useQuery } from '@tanstack/react-query';
import { Database, Eye, EyeOff, Globe, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Settings() {
  const { t } = useTranslation();
  const { 
    language, 
    setLanguage, 
    tableDisplayNames, 
    setTableDisplayName,
    hiddenTables,
    setHiddenTable,
  } = useConfigStore();
  
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: getTables,
  });

  // Load settings from SQLite on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSetting('app_settings');
        if (settings) {
          // Update the store with saved settings
          if (settings.language) setLanguage(settings.language);
          if (settings.tableDisplayNames) {
            Object.entries(settings.tableDisplayNames).forEach(([key, value]) => {
              setTableDisplayName(key, value as string);
            });
          }
          if (settings.hiddenTables) {
            settings.hiddenTables.forEach((table: string) => {
              setHiddenTable(table, true);
            });
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [setLanguage, setTableDisplayName, setHiddenTable]);
  
  const handleLanguageChange = async (value: string) => {
    setLanguage(value as Language);
    
    // Save to SQLite
    try {
      const currentSettings = await getSetting('app_settings') || {};
      await setSetting('app_settings', {
        ...currentSettings,
        language: value
      });
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
    
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
  
  const handleDisplayNameChange = async (tableName: string, displayName: string) => {
    setTableDisplayName(tableName, displayName);
    toggleEditMode(tableName);
    
    // Save to SQLite
    try {
      const currentSettings = await getSetting('app_settings') || {};
      await setSetting('app_settings', {
        ...currentSettings,
        tableDisplayNames: {
          ...currentSettings.tableDisplayNames,
          [tableName]: displayName
        }
      });
    } catch (error) {
      console.error('Error saving table display name:', error);
    }
    
    toast({
      title: t('save'),
      description: `${tableName} → ${displayName}`,
    });
  };

  const handleVisibilityToggle = async (tableName: string) => {
    const newHiddenTables = hiddenTables.includes(tableName)
      ? hiddenTables.filter(t => t !== tableName)
      : [...hiddenTables, tableName];
    
    setHiddenTable(tableName, !hiddenTables.includes(tableName));
    
    // Save to SQLite
    try {
      const currentSettings = await getSetting('app_settings') || {};
      await setSetting('app_settings', {
        ...currentSettings,
        hiddenTables: newHiddenTables
      });
    } catch (error) {
      console.error('Error saving table visibility:', error);
    }
    
    toast({
      title: hiddenTables.includes(tableName) ? t('showTable') : t('hideTable'),
      description: tableName,
    });
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
