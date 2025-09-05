import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  User as UserIcon,
  ChevronLeft,
  Save,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Trash2,
  Download,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Componente de Configurações de Notificação
const NotificationSettings = ({ user, onSave }) => {
  const [settings, setSettings] = useState({
    push_notifications: user?.notification_settings?.push_notifications ?? true,
    email_notifications: user?.notification_settings?.email_notifications ?? true,
    reminder_notifications: user?.notification_settings?.reminder_notifications ?? true,
    marketing_emails: user?.notification_settings?.marketing_emails ?? false,
    event_reminders: user?.notification_settings?.event_reminders ?? true,
    health_alerts: user?.notification_settings?.health_alerts ?? true
  });

  const handleSave = async () => {
    await onSave({ notification_settings: settings });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Preferências de Notificação</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Notificações Push</Label>
              <p className="text-sm text-gray-500">Receba notificações no aplicativo</p>
            </div>
            <Switch
              checked={settings.push_notifications}
              onCheckedChange={(checked) => setSettings({...settings, push_notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Notificações por Email</Label>
              <p className="text-sm text-gray-500">Receba notificações no seu email</p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Lembretes</Label>
              <p className="text-sm text-gray-500">Lembretes de consultas e medicamentos</p>
            </div>
            <Switch
              checked={settings.reminder_notifications}
              onCheckedChange={(checked) => setSettings({...settings, reminder_notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Alertas de Saúde</Label>
              <p className="text-sm text-gray-500">Alertas importantes sobre a saúde dos pets</p>
            </div>
            <Switch
              checked={settings.health_alerts}
              onCheckedChange={(checked) => setSettings({...settings, health_alerts: checked})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Emails de Marketing</Label>
              <p className="text-sm text-gray-500">Dicas e novidades sobre cuidados com pets</p>
            </div>
            <Switch
              checked={settings.marketing_emails}
              onCheckedChange={(checked) => setSettings({...settings, marketing_emails: checked})}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="mt-6">
          <Save className="w-4 h-4 mr-2" />
          Salvar Preferências
        </Button>
      </div>
    </div>
  );
};

// Componente de Configurações de Privacidade
const PrivacySettings = ({ user, onSave }) => {
  const [settings, setSettings] = useState({
    profile_visibility: user?.privacy_settings?.profile_visibility ?? "private",
    share_health_data: user?.privacy_settings?.share_health_data ?? false,
    analytics: user?.privacy_settings?.analytics ?? true,
    data_collection: user?.privacy_settings?.data_collection ?? "essential"
  });

  const handleSave = async () => {
    await onSave({ privacy_settings: settings });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Configurações de Privacidade</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-base">Visibilidade do Perfil</Label>
            <p className="text-sm text-gray-500 mb-2">Quem pode ver seu perfil</p>
            <Select 
              value={settings.profile_visibility} 
              onValueChange={(value) => setSettings({...settings, profile_visibility: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
                <SelectItem value="vets_only">Apenas Veterinários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Compartilhar Dados de Saúde</Label>
              <p className="text-sm text-gray-500">Permitir compartilhamento para pesquisas</p>
            </div>
            <Switch
              checked={settings.share_health_data}
              onCheckedChange={(checked) => setSettings({...settings, share_health_data: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Análise de Uso</Label>
              <p className="text-sm text-gray-500">Ajudar a melhorar o app com dados de uso</p>
            </div>
            <Switch
              checked={settings.analytics}
              onCheckedChange={(checked) => setSettings({...settings, analytics: checked})}
            />
          </div>

          <div>
            <Label className="text-base">Coleta de Dados</Label>
            <p className="text-sm text-gray-500 mb-2">Nível de dados coletados</p>
            <Select 
              value={settings.data_collection} 
              onValueChange={(value) => setSettings({...settings, data_collection: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Mínimo</SelectItem>
                <SelectItem value="essential">Essencial</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} className="mt-6">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

// Componente de Configurações da Conta
const AccountSettings = ({ user, onSave, onDeleteAccount }) => {
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  const exportData = () => {
    // TODO: Implementar exportação de dados
    alert("Funcionalidade de exportação será implementada em breve");
  };

  const handleDeleteAccount = () => {
    if (confirmDelete.toLowerCase() === "excluir") {
      onDeleteAccount();
    } else {
      alert('Digite "excluir" para confirmar a exclusão da conta');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Gerenciar Conta</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-base">Informações da Conta</Label>
            <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Membro desde:</span>
                <span className="text-sm font-medium">
                  {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipo de usuário:</span>
                <Badge variant={user?.user_type === 'veterinario' ? 'default' : 'secondary'}>
                  {user?.user_type === 'veterinario' ? 'Veterinário' : 'Tutor'}
                </Badge>
              </div>
            </div>
          </div>

          <Button onClick={exportData} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Exportar Meus Dados
          </Button>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base text-red-600">Zona Perigosa</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDangerZone(!showDangerZone)}
              >
                {showDangerZone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {showDangerZone && (
              <div className="border border-red-200 rounded-md p-4 space-y-4">
                <div>
                  <h4 className="text-base font-medium text-red-900 mb-2">Excluir Conta</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Esta ação é irreversível. Todos os seus dados, incluindo pets, histórico de saúde 
                    e lembretes serão permanentemente excluídos.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-delete" className="text-sm">
                      Digite "excluir" para confirmar:
                    </Label>
                    <Input
                      id="confirm-delete"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      placeholder="excluir"
                      className="max-w-xs"
                    />
                  </div>

                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    className="mt-3"
                    disabled={confirmDelete.toLowerCase() !== "excluir"}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Conta Permanentemente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("notifications");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });

  // Remover qualquer referência a Stripe/pagamentos
  useEffect(() => {
    const removePaymentElements = () => {
      const paymentSelectors = [
        'script[src*="stripe"]',
        '[class*="stripe"]', 
        '[id*="stripe"]',
        '[data-stripe]'
      ];
      
      paymentSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
    };

    removePaymentElements();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      window.location.href = createPageUrl("Welcome");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (dataToUpdate) => {
    if (saving) return;

    try {
      setSaving(true);
      await User.updateMyUserData(dataToUpdate);
      
      // Recarregar dados do usuário
      const updatedUser = await User.me();
      setUser(updatedUser);
      
      setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
      setTimeout(() => setMessage({ type: null, text: "" }), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setMessage({ type: "error", text: "Erro ao salvar configurações." });
      setTimeout(() => setMessage({ type: null, text: "" }), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSaving(true);
      await User.logout();
      window.location.href = createPageUrl("Welcome");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      setMessage({ type: "error", text: "Erro ao excluir conta." });
    } finally {
      setSaving(false);
    }
  };

  // Seções de configuração (removido billing/pagamentos)
  const sections = [
    {
      id: "notifications",
      title: "Notificações",
      icon: <Bell className="w-5 h-5" />,
      component: NotificationSettings
    },
    {
      id: "privacy",
      title: "Privacidade",
      icon: <Shield className="w-5 h-5" />,
      component: PrivacySettings
    },
    {
      id: "account", 
      title: "Conta",
      icon: <UserIcon className="w-5 h-5" />,
      component: AccountSettings
    }
  ];

  const ActiveComponent = sections.find(section => section.id === activeSection)?.component;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Gerencie suas preferências e conta</p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-md flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Seções</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left ${
                    activeSection === section.id
                      ? "bg-purple-100 text-purple-800"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="md:col-span-3">
            <CardContent className="p-6">
              {ActiveComponent && (
                <ActiveComponent 
                  user={user} 
                  onSave={handleSave}
                  onDeleteAccount={handleDeleteAccount}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}