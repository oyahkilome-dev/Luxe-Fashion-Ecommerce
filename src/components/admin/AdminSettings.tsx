import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';
type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface AdminSettingsProps {}

export const AdminSettings: React.FC<AdminSettingsProps> = () => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'paystack' | 'whatsapp' | 'smtp' | 'website'>('supabase');
  const [settings, setSettings] = useState<any>({
    supabase: {},
    paystack: {},
    whatsapp: {},
    smtp: {},
    website: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async (section: string) => {
    setSaveStatus('saving');
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data: settings[section] })
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleTestConnection = async (type: string) => {
    setTestStatus('testing');
    try {
      await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (error) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  const tabs = [
    { id: 'supabase', label: 'Supabase' },
    { id: 'paystack', label: 'Paystack' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'smtp', label: 'Email (SMTP)' },
    { id: 'website', label: 'Website Settings' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900">Environment Variables Managed</h4>
          <p className="text-sm text-blue-700 mt-1">
            These credentials are securely loaded from your Environment Variables. To permanently update them, use the AI Studio <strong>Environment Variables</strong> configuration panel.
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-200 flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-md mr-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Supabase Settings */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900">Supabase Configuration</h3>
            <p className="text-sm text-slate-500">Connect your Supabase project for database, authentication, and storage.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project URL</label>
                <input 
                  type="text" 
                  value={settings.supabase.projectUrl}
                  onChange={(e) => handleChange('supabase', 'projectUrl', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                  placeholder="https://xxxx.supabase.co"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project ID</label>
                <input 
                  type="text" 
                  value={settings.supabase.projectId}
                  onChange={(e) => handleChange('supabase', 'projectId', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Anon Key</label>
                <input 
                  type="text" 
                  value={settings.supabase.anonKey}
                  onChange={(e) => handleChange('supabase', 'anonKey', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Role Key</label>
                <input 
                  type="password" 
                  value={settings.supabase.serviceRoleKey}
                  onChange={(e) => handleChange('supabase', 'serviceRoleKey', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Storage Bucket Name</label>
                <input 
                  type="text" 
                  value={settings.supabase.storageBucket}
                  onChange={(e) => handleChange('supabase', 'storageBucket', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleSave('supabase')}
                disabled={saveStatus === 'saving'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {saveStatus === 'saving' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </button>
              <button 
                onClick={() => handleTestConnection('Supabase')}
                disabled={testStatus === 'testing'}
                className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-70"
              >
                {testStatus === 'testing' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test Connection
              </button>
              
              {saveStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</span>}
              {testStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Connection Successful</span>}
            </div>
          </div>
        )}

        {/* Paystack Settings */}
        {activeTab === 'paystack' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900">Paystack Configuration</h3>
            <p className="text-sm text-slate-500">Configure payment gateway credentials for processing transactions.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Public Key</label>
                <input 
                  type="text" 
                  value={settings.paystack.publicKey}
                  onChange={(e) => handleChange('paystack', 'publicKey', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secret Key</label>
                <input 
                  type="password" 
                  value={settings.paystack.secretKey}
                  onChange={(e) => handleChange('paystack', 'secretKey', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Webhook Secret</label>
                <input 
                  type="password" 
                  value={settings.paystack.webhookSecret}
                  onChange={(e) => handleChange('paystack', 'webhookSecret', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Callback URL</label>
                <input 
                  type="text" 
                  value={settings.paystack.callbackUrl}
                  onChange={(e) => handleChange('paystack', 'callbackUrl', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleSave('paystack')}
                disabled={saveStatus === 'saving'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {saveStatus === 'saving' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </button>
              <button 
                onClick={() => handleTestConnection('Paystack')}
                disabled={testStatus === 'testing'}
                className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-70"
              >
                {testStatus === 'testing' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test Connection
              </button>

              {saveStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</span>}
              {testStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Connection Successful</span>}
            </div>
          </div>
        )}

        {/* WhatsApp Settings */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900">WhatsApp Configuration</h3>
            <p className="text-sm text-slate-500">Manage post-purchase automated redirects and messages.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  id="enableRedirect"
                  checked={settings.whatsapp.enableRedirect}
                  onChange={(e) => handleChange('whatsapp', 'enableRedirect', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="enableRedirect" className="text-sm font-medium text-slate-700">Enable automatic redirect after successful payment</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number (with country code, no +)</label>
                <input 
                  type="text" 
                  value={settings.whatsapp.number}
                  onChange={(e) => handleChange('whatsapp', 'number', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                  placeholder="e.g. 1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Payment Confirmation Message</label>
                <p className="text-xs text-slate-500 mb-2">Use tags like {'{order_number}'}, {'{customer_name}'}, {'{amount}'} to inject dynamic data.</p>
                <textarea 
                  value={settings.whatsapp.message}
                  onChange={(e) => handleChange('whatsapp', 'message', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900 h-40" 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleSave('whatsapp')}
                disabled={saveStatus === 'saving'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {saveStatus === 'saving' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </button>
              
              {saveStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</span>}
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'smtp' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900">Email (SMTP) Configuration</h3>
            <p className="text-sm text-slate-500">Set up SMTP to send order confirmations and newsletters.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Host</label>
                <input 
                  type="text" 
                  value={settings.smtp.host}
                  onChange={(e) => handleChange('smtp', 'host', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Port</label>
                <input 
                  type="text" 
                  value={settings.smtp.port}
                  onChange={(e) => handleChange('smtp', 'port', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Username</label>
                <input 
                  type="text" 
                  value={settings.smtp.username}
                  onChange={(e) => handleChange('smtp', 'username', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SMTP Password</label>
                <input 
                  type="password" 
                  value={settings.smtp.password}
                  onChange={(e) => handleChange('smtp', 'password', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sender Email</label>
                <input 
                  type="email" 
                  value={settings.smtp.senderEmail}
                  onChange={(e) => handleChange('smtp', 'senderEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleSave('smtp')}
                disabled={saveStatus === 'saving'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {saveStatus === 'saving' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </button>
              <button 
                onClick={() => handleTestConnection('SMTP')}
                disabled={testStatus === 'testing'}
                className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-sm hover:bg-slate-50 transition-colors disabled:opacity-70"
              >
                {testStatus === 'testing' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send Test Email
              </button>

              {saveStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</span>}
              {testStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Test Email Sent</span>}
            </div>
          </div>
        )}

        {/* Website Settings */}
        {activeTab === 'website' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900">Website Details</h3>
            <p className="text-sm text-slate-500">General settings for your e-commerce storefront.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website Name</label>
                <input 
                  type="text" 
                  value={settings.website.name}
                  onChange={(e) => handleChange('website', 'name', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                <input 
                  type="text" 
                  value={settings.website.logo}
                  onChange={(e) => handleChange('website', 'logo', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <input 
                  type="email" 
                  value={settings.website.contactEmail}
                  onChange={(e) => handleChange('website', 'contactEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={settings.website.phone}
                  onChange={(e) => handleChange('website', 'phone', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <textarea 
                  value={settings.website.address}
                  onChange={(e) => handleChange('website', 'address', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900 h-24" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select 
                  value={settings.website.currency}
                  onChange={(e) => handleChange('website', 'currency', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-sm focus:ring-slate-900 focus:border-slate-900"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NGN">NGN (₦)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleSave('website')}
                disabled={saveStatus === 'saving'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {saveStatus === 'saving' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </button>
              
              {saveStatus === 'success' && <span className="flex items-center text-green-600 text-sm"><CheckCircle2 className="w-4 h-4 mr-1" /> Saved</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
