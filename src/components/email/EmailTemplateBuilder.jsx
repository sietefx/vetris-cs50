import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Eye, 
  Send, 
  Palette, 
  Type, 
  Image as ImageIcon,
  Code,
  Save
} from 'lucide-react';

export default function EmailTemplateBuilder({ 
  onSend, 
  initialTemplate = null,
  recipientEmail = "" 
}) {
  const [template, setTemplate] = useState({
    subject: initialTemplate?.subject || "",
    fromName: initialTemplate?.fromName || "Vetris",
    headerTitle: initialTemplate?.headerTitle || "Bem-vindo ao Vetris",
    headerSubtitle: initialTemplate?.headerSubtitle || "Plataforma de Saúde Animal",
    greeting: initialTemplate?.greeting || "Olá!",
    mainContent: initialTemplate?.mainContent || "Esta é uma mensagem da plataforma Vetris.",
    ctaText: initialTemplate?.ctaText || "Acessar Plataforma",
    ctaUrl: initialTemplate?.ctaUrl || "",
    footerText: initialTemplate?.footerText || "Obrigado por usar o Vetris!",
    primaryColor: initialTemplate?.primaryColor || "#7c3aed",
    backgroundColor: initialTemplate?.backgroundColor || "#f9fafb"
  });

  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const handleInputChange = (field, value) => {
    setTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateEmailHTML = () => {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.subject}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #374151; 
            background-color: ${template.backgroundColor};
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, ${template.primaryColor} 0%, ${template.primaryColor}dd 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo { 
            width: 150px;
            height: auto;
            margin-bottom: 20px;
            filter: brightness(0) invert(1);
        }
        .header h1 { 
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header p { 
            opacity: 0.9;
            font-size: 16px;
        }
        .content { 
            padding: 40px 30px;
        }
        .greeting { 
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .main-content { 
            font-size: 16px;
            margin-bottom: 30px;
            color: #4b5563;
            line-height: 1.7;
        }
        .cta-container { 
            text-align: center;
            margin: 30px 0;
        }
        .cta-button { 
            display: inline-block;
            background: ${template.primaryColor};
            color: white !important;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
        }
        .footer { 
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer img { 
            width: 100px;
            height: auto;
            margin-bottom: 15px;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/71990b_Asset8.png" 
                alt="Vetris" 
                class="logo"
            />
            <h1>${template.headerTitle}</h1>
            <p>${template.headerSubtitle}</p>
        </div>
        
        <div class="content">
            <div class="greeting">${template.greeting}</div>
            <div class="main-content">${template.mainContent.replace(/\n/g, '<br>')}</div>
            
            ${template.ctaUrl ? `
            <div class="cta-container">
                <a href="${template.ctaUrl}" class="cta-button">
                    ${template.ctaText}
                </a>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/71990b_Asset8.png" 
                alt="Vetris"
            />
            <p>${template.footerText}</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Este email foi enviado pela plataforma Vetris<br>
                <strong>vetris.app</strong>
            </p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      alert("Email do destinatário é obrigatório");
      return;
    }

    if (!template.subject.trim()) {
      alert("Assunto do email é obrigatório");
      return;
    }

    setSending(true);
    try {
      const emailHTML = generateEmailHTML();
      
      await onSend({
        to: recipientEmail,
        subject: template.subject,
        html: emailHTML,
        from_name: template.fromName,
        template_type: "custom_builder"
      });

      alert("Email enviado com sucesso!");
      
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      alert("Erro ao enviar email: " + error.message);
    } finally {
      setSending(false);
    }
  };

  if (preview) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Preview do Email</h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPreview(false)}>
              <Code className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button 
              onClick={handleSend}
              disabled={sending || !recipientEmail}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {sending ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 p-4 bg-gray-50 rounded border-l-4 border-purple-600">
              <div className="text-sm font-semibold text-gray-700">Para: {recipientEmail}</div>
              <div className="text-sm font-semibold text-gray-700">Assunto: {template.subject}</div>
              <div className="text-sm text-gray-600">De: {template.fromName} &lt;noreply@vetris.app&gt;</div>
            </div>
            <div 
              className="border rounded-lg overflow-hidden"
              dangerouslySetInnerHTML={{ __html: generateEmailHTML() }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Construtor de Email</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPreview(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={handleSend}
            disabled={sending || !recipientEmail || !template.subject.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {sending ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Agora
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Edição */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Configurações do Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientEmail">Email do Destinatário *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => onSend?.({ recipientEmail: e.target.value })}
                  placeholder="destinatario@exemplo.com"
                  readOnly={!!recipientEmail}
                />
              </div>

              <div>
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  value={template.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Assunto do email"
                />
              </div>

              <div>
                <Label htmlFor="fromName">Nome do Remetente</Label>
                <Input
                  id="fromName"
                  value={template.fromName}
                  onChange={(e) => handleInputChange('fromName', e.target.value)}
                  placeholder="Vetris"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={template.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={template.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    placeholder="#7c3aed"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={template.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={template.backgroundColor}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    placeholder="#f9fafb"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="headerTitle">Título do Cabeçalho</Label>
                <Input
                  id="headerTitle"
                  value={template.headerTitle}
                  onChange={(e) => handleInputChange('headerTitle', e.target.value)}
                  placeholder="Bem-vindo ao Vetris"
                />
              </div>

              <div>
                <Label htmlFor="headerSubtitle">Subtítulo do Cabeçalho</Label>
                <Input
                  id="headerSubtitle"
                  value={template.headerSubtitle}
                  onChange={(e) => handleInputChange('headerSubtitle', e.target.value)}
                  placeholder="Plataforma de Saúde Animal"
                />
              </div>

              <div>
                <Label htmlFor="greeting">Saudação</Label>
                <Input
                  id="greeting"
                  value={template.greeting}
                  onChange={(e) => handleInputChange('greeting', e.target.value)}
                  placeholder="Olá!"
                />
              </div>

              <div>
                <Label htmlFor="mainContent">Conteúdo Principal</Label>
                <Textarea
                  id="mainContent"
                  value={template.mainContent}
                  onChange={(e) => handleInputChange('mainContent', e.target.value)}
                  placeholder="Esta é uma mensagem da plataforma Vetris..."
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="ctaText">Texto do Botão (opcional)</Label>
                <Input
                  id="ctaText"
                  value={template.ctaText}
                  onChange={(e) => handleInputChange('ctaText', e.target.value)}
                  placeholder="Acessar Plataforma"
                />
              </div>

              <div>
                <Label htmlFor="ctaUrl">URL do Botão (opcional)</Label>
                <Input
                  id="ctaUrl"
                  value={template.ctaUrl}
                  onChange={(e) => handleInputChange('ctaUrl', e.target.value)}
                  placeholder="https://vetris.app"
                />
              </div>

              <div>
                <Label htmlFor="footerText">Texto do Rodapé</Label>
                <Input
                  id="footerText"
                  value={template.footerText}
                  onChange={(e) => handleInputChange('footerText', e.target.value)}
                  placeholder="Obrigado por usar o Vetris!"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Lateral */}
        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-50 max-h-96 overflow-y-auto">
                <div 
                  className="transform scale-75 origin-top-left w-[133%]"
                  dangerouslySetInnerHTML={{ __html: generateEmailHTML() }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}