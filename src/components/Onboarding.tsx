
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfigStore } from '@/store/configStore';
import { useTranslation } from '@/lib/translations';
import { Database, Globe, Server, ChevronRight, AlertCircle } from 'lucide-react';
import { initializeSupabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        title: 'Missing fields',
        description: 'Please provide both Supabase URL and API key',
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
          title: 'Connected successfully!',
          description: 'Your Supabase instance is now connected.',
        });
        
        navigate('/');
      } else {
        toast({
          title: 'Connection failed',
          description: 'Unable to connect to Supabase with the provided credentials.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection error',
        description: 'An error occurred while trying to connect to Supabase.',
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
                  For self-hosted instances, you'll need to configure CORS in your Supabase server to allow requests from this origin. Add '{window.location.origin}' to your allowed origins.
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
