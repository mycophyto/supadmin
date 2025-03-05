import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { initializeSupabase } from '@/lib/supabase';
import { useTranslation } from '@/lib/translations';
import { useConfigStore } from '@/store/configStore';
import { AlertCircle, ChevronRight, Database, Globe, Server } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSupabaseConfig } = useConfigStore();
  
  const [hostingType, setHostingType] = useState<'supabase' | 'self'>('supabase');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = async () => {
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: t('missingFields'),
        description: t('provideCredentials'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsConnecting(true);
    
    try {
      // Test the connection
      const success = await initializeSupabase(supabaseUrl, supabaseKey);
      
      if (success) {
        // Save the configuration
        setSupabaseConfig(supabaseUrl, supabaseKey);
        
        toast({
          title: t('connectedSuccessfully'),
          description: t('supabaseConnected'),
        });
        
        navigate('/');
      } else {
        toast({
          title: t('connectionFailed'),
          description: t('invalidCredentials'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('connectionError'),
        description: t('connectionErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-in slide-in">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('welcomeToAdminDB')}</CardTitle>
          <CardDescription>{t('connectToSupabase')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Tabs 
              defaultValue={hostingType} 
              onValueChange={(value) => setHostingType(value as 'supabase' | 'self')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supabase" className="flex items-center justify-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{t('hostedOnSupabase')}</span>
                </TabsTrigger>
                <TabsTrigger value="self" className="flex items-center justify-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>{t('selfHosted')}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {hostingType === 'self' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('selfHostedCorsWarning').replace('{origin}', window.location.origin)}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">{t('supabaseUrl')}</Label>
                <Input
                  id="supabase-url"
                  placeholder={hostingType === 'supabase' ? "https://your-project.supabase.co" : "http://localhost:54321"}
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supabase-key">{t('supabaseKey')}</Label>
                <Input
                  id="supabase-key"
                  type="password"
                  placeholder="your-anon-key"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleConnect}
            disabled={isConnecting || !supabaseUrl || !supabaseKey}
          >
            {isConnecting ? t('loading') : t('connect')}
            {!isConnecting && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
