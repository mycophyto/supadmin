import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { getCreateSettingsTableSQL, supabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/translations';
import { StorageType, useConfigStore } from '@/store/configStore';
import { AlertCircle, ChevronRight, Copy, Database, Globe, HardDrive, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSupabaseConfig, setStorageType } = useConfigStore();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [storageType, setStorageTypeState] = useState<StorageType>('local');
  const [instanceType, setInstanceType] = useState<'supabase' | 'self'>('supabase');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load saved connection settings when component mounts
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('supadmin_settings')
          .select('value')
          .eq('key', 'connection_config')
          .single();

        if (error) {
          console.error('Error loading saved settings:', error);
          return;
        }

        if (data?.value) {
          const config = data.value;
          setSupabaseUrl(config.url);
          setSupabaseKey(config.key);
          setSupabaseServiceKey(config.serviceKey || '');
          setInstanceType(config.instanceType);
          setStorageTypeState(config.storageType);
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSettings();
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Validate URL format
      if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
        setError(t('onboarding.errors.invalidUrl'));
        return;
      }

      // Validate key format
      if (!supabaseKey || supabaseKey.length < 10) {
        setError(t('onboarding.errors.invalidKey'));
        return;
      }

      // For self-hosted instances with Supabase storage, require service key
      if (instanceType === 'self' && storageType === 'supabase' && !supabaseServiceKey) {
        setError(t('onboarding.errors.serviceKeyRequired'));
        return;
      }

      // Try to connect with Supabase
      await setSupabaseConfig(supabaseUrl, supabaseKey, supabaseServiceKey);
      
      // If connection is successful, set storage type to Supabase
      await setStorageType(storageType);
      
      // If using Supabase storage, sync the config
      if (storageType === 'supabase') {
        await useConfigStore.getState().syncWithSupabase();
        
        // Store connection data in supadmin_settings
        const { error: settingsError } = await supabase
          .from('supadmin_settings')
          .upsert({
            key: 'connection_config',
            value: {
              url: supabaseUrl,
              key: supabaseKey,
              serviceKey: supabaseServiceKey,
              instanceType,
              storageType,
              lastUpdated: new Date().toISOString()
            }
          });

        if (settingsError) {
          console.error('Error storing connection settings:', settingsError);
          toast({
            title: t('onboarding.errors.connectionFailed'),
            description: t('onboarding.errors.connectionFailed'),
            variant: 'destructive',
          });
        }
      }
      
      // Show success message
      toast({
        title: t('onboarding.success.title'),
        description: t('onboarding.success.description'),
      });
      
      // Navigate to the main app
      navigate('/');
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(error.message || t('onboarding.errors.connectionFailed'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(getCreateSettingsTableSQL());
      toast({
        title: t('settingsTableCreated'),
        description: t('settingsTableCreated'),
      });
    } catch (error) {
      console.error('Failed to copy SQL:', error);
      toast({
        title: t('settingsTableError'),
        description: t('settingsTableError'),
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-in slide-in">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('onboarding.title')}</CardTitle>
          <CardDescription>{t('onboarding.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleConnect();
            }} className="space-y-6">
              <div className="space-y-6">
                {/* Instance Type Selection */}
                <div className="space-y-2">
                  <Label>{t('onboarding.instanceType')}</Label>
                  <Tabs 
                    defaultValue={instanceType} 
                    onValueChange={(value) => setInstanceType(value as 'supabase' | 'self')}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="supabase" className="flex items-center justify-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{t('connection.supabaseHosted')}</span>
                      </TabsTrigger>
                      <TabsTrigger value="self" className="flex items-center justify-center gap-2">
                        <Server className="h-4 w-4" />
                        <span>{t('connection.selfHosted')}</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Storage Type Selection */}
                <div className="space-y-2">
                  <Label>{t('connection.storageType')}</Label>
                  <Tabs 
                    defaultValue={storageType} 
                    onValueChange={(value) => setStorageTypeState(value as StorageType)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="local" className="flex items-center justify-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        <span>{t('connection.localStorage')}</span>
                      </TabsTrigger>
                      <TabsTrigger value="supabase" className="flex items-center justify-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>{t('connection.supabaseStorage')}</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* SQL Setup Instructions for Supabase Storage */}
                {storageType === 'supabase' && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t('createSettingsTable')}
                      </AlertDescription>
                    </Alert>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                        {getCreateSettingsTableSQL()}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleCopySQL}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t('copy')}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('copySQLInstructions')}
                    </p>
                  </div>
                )}

                {/* Connection Details */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="supabase-url">{t('connection.urlLabel')}</Label>
                    <Input
                      id="supabase-url"
                      name="url"
                      placeholder={instanceType === 'supabase' 
                        ? t('connection.urlPlaceholder')
                        : t('connection.urlPlaceholder')}
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supabase-key">{t('connection.keyLabel')}</Label>
                    <Input
                      id="supabase-key"
                      name="key"
                      type="password"
                      placeholder={t('connection.keyPlaceholder')}
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                    />
                  </div>

                  {/* Service Key field only shown for self-hosted with Supabase storage */}
                  {instanceType === 'self' && storageType === 'supabase' && (
                    <div className="space-y-2">
                      <Label htmlFor="supabase-service-key">{t('connection.serviceKeyLabel')}</Label>
                      <Input
                        id="supabase-service-key"
                        name="service-key"
                        type="password"
                        placeholder={t('connection.serviceKeyPlaceholder')}
                        value={supabaseServiceKey}
                        onChange={(e) => setSupabaseServiceKey(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t('connection.serviceKeyDescription')}
                      </p>
                    </div>
                  )}

                  {/* Instance-specific information */}
                  {instanceType === 'self' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t('connection.selfHostedWarning')?.replace('{origin}', window.location.origin) || t('connection.selfHostedWarning')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit"
            className="w-full" 
            disabled={isConnecting || !supabaseUrl || !supabaseKey || (instanceType === 'self' && storageType === 'supabase' && !supabaseServiceKey)}
            onClick={handleConnect}
          >
            {isConnecting ? t('connection.connecting') : t('connection.connect')}
            {!isConnecting && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
