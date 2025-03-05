import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/translations';
import { StorageType, useConfigStore } from '@/store/configStore';
import { Database, HardDrive, Server } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isSelfHosted, setIsSelfHosted] = useState(false);
  const [storageType, setStorageType] = useState<StorageType>('local');
  const [isLoading, setIsLoading] = useState(false);
  const { setSupabaseConfig, setStorageType: setConfigStorageType } = useConfigStore();

  const handleNext = async () => {
    if (!url || !key) {
      toast({
        title: t('missingFields'),
        description: t('provideCredentials'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test connection before proceeding
      await setSupabaseConfig(url, key);
      
      toast({
        title: t('connectedSuccessfully'),
        description: t('supabaseConnected'),
      });
      
      setStep(2);
    } catch (error) {
      toast({
        title: t('connectionFailed'),
        description: t('invalidCredentials'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await setConfigStorageType(storageType);
      toast({
        title: t('settingsConfigured'),
        description: storageType === 'local' ? t('localStorageConfigured') : t('supabaseStorageConfigured'),
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('configurationFailed'),
        description: storageType === 'local' ? t('localStorageError') : t('supabaseStorageError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Database className="h-6 w-6 mr-2" />
            {t('welcomeToAdminDB')}
          </CardTitle>
          <CardDescription>
            {t('connectToSupabase')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={!isSelfHosted ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setIsSelfHosted(false)}
                  >
                    {t('hostedOnSupabase')}
                  </Button>
                  <Button
                    variant={isSelfHosted ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setIsSelfHosted(true)}
                  >
                    {t('selfHosted')}
                  </Button>
                </div>

                {isSelfHosted && (
                  <div className="bg-muted p-3 rounded-lg mb-4 text-sm">
                    {t('selfHostedCorsWarning').replace('{origin}', 'http://localhost:8080')}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="url">{t('supabaseUrl')}</Label>
                  <Input
                    id="url"
                    placeholder={isSelfHosted ? "http://localhost:54321" : "https://your-project.supabase.co"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">{t('supabaseKey')}</Label>
                  <Input
                    id="key"
                    type="password"
                    placeholder="your-anon-key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {isLoading ? t('testing') : t('next')}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('storagePreference')}</Label>
                  <div className="grid gap-4">
                    <Button
                      variant={storageType === 'local' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setStorageType('local')}
                      disabled={isLoading}
                    >
                      <HardDrive className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{t('localStorage')}</div>
                        <div className="text-sm text-muted-foreground">
                          {t('localStorageDescription')}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={storageType === 'supabase' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setStorageType('supabase')}
                      disabled={isLoading}
                    >
                      <Server className="h-5 w-5 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{t('supabaseStorage')}</div>
                        <div className="text-sm text-muted-foreground">
                          {t('supabaseStorageDescription')}
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    {t('back')}
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleConnect}
                    disabled={isLoading}
                  >
                    {isLoading ? t('configuring') : t('connect')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 