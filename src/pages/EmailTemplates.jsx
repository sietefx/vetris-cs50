import React, { useState, useEffect } from "react";
import { EmailTemplate } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChromePicker } from 'react-color';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Palette, Edit2, Save, RotateCcw, Eye } from "lucide-react";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await EmailTemplate.list();
      setTemplates(loadedTemplates);
      if (loadedTemplates.length > 0) {
        setSelectedTemplate(loadedTemplates[0]);
        setEditingTemplate(loadedTemplates[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateName) => {
    const template = templates.find(t => t.name === templateName);
    setSelectedTemplate(template);
    setEditingTemplate(template);
    setPreviewMode(false);
  };

  const handleColorChange = (color, field) => {
    setEditingTemplate(prev => ({
      ...prev,
      [field]: color.hex
    }));
  };

  const handleSave = async () => {
    try {
      if (editingTemplate.id) {
        await EmailTemplate.update(editingTemplate.id, editingTemplate);
      } else {
        await EmailTemplate.create(editingTemplate);
      }
      await loadTemplates();
      alert("Template salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      alert("Erro ao salvar template");
    }
  };

  const handleReset = () => {
    setEditingTemplate(selectedTemplate);
    setPreviewMode(false);
  };

  const renderPreview = () => {
    if (!editingTemplate) return null;

    return (
      <div style={{ backgroundColor: "#F5F5F5", padding: "20px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: editingTemplate.background_color }}>
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            {editingTemplate.logo_url && (
              <img 
                src={editingTemplate.logo_url} 
                alt="Logo" 
                style={{ maxWidth: "150px", marginBottom: "20px" }}
              />
            )}
            
            <h1 style={{ 
              color: editingTemplate.text_color,
              fontSize: "24px",
              marginBottom: "10px"
            }}>
              {editingTemplate.title || "Título do Email"}
            </h1>
            
            {editingTemplate.subtitle && (
              <h2 style={{ 
                color: editingTemplate.secondary_text_color,
                fontSize: "18px",
                marginBottom: "20px"
              }}>
                {editingTemplate.subtitle}
              </h2>
            )}
            
            <div style={{ 
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              padding: "30px",
              marginBottom: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <div style={{ 
                color: editingTemplate.text_color,
                fontSize: "16px",
                lineHeight: "1.6",
                marginBottom: "25px"
              }}>
                {editingTemplate.body_text}
              </div>
              
              <button style={{
                backgroundColor: editingTemplate.button_color,
                color: editingTemplate.button_text_color,
                padding: "12px 24px",
                borderRadius: "6px",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: "500"
              }}>
                {editingTemplate.button_text || "Clique Aqui"}
              </button>
            </div>
            
            <div style={{ 
              color: editingTemplate.secondary_text_color,
              fontSize: "14px",
              lineHeight: "1.4"
            }}>
              {editingTemplate.footer_text}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Templates de Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-6">
                <Label>Selecione o Template</Label>
                <Select 
                  value={selectedTemplate?.name} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invite">Convite</SelectItem>
                    <SelectItem value="welcome">Boas-vindas</SelectItem>
                    <SelectItem value="password_reset">Redefinir Senha</SelectItem>
                    <SelectItem value="appointment_confirmation">Confirmação de Consulta</SelectItem>
                    <SelectItem value="reminder">Lembrete</SelectItem>
                    <SelectItem value="vaccination_due">Vacina Pendente</SelectItem>
                    <SelectItem value="donation_receipt">Recibo de Doação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="content">
                <TabsList className="w-full">
                  <TabsTrigger value="content" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Conteúdo
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Estilo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label>Assunto</Label>
                    <Input
                      value={editingTemplate?.subject || ""}
                      onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        subject: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Título</Label>
                    <Input
                      value={editingTemplate?.title || ""}
                      onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Subtítulo</Label>
                    <Input
                      value={editingTemplate?.subtitle || ""}
                      onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        subtitle: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Texto Principal</Label>
                    <Textarea
                      rows={6}
                      value={editingTemplate?.body_text || ""}
                      onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        body_text: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Texto do Botão</Label>
                    <Input
                      value={editingTemplate?.button_text || ""}
                      onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        button_text: e.target.value
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Rodapé</Label>
                    <Textarea
                      value={editingTemplate?.footer_text || ""}
                      onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        footer_text: e.target.value
                      }))}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label>URL do Logo</Label>
                    <Input
                      value={editingTemplate?.logo_url || ""}
                      onChange={(e) => setEditingTemplate(prev => ({
                        ...prev,
                        logo_url: e.target.value
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Cor de Fundo</Label>
                      <div 
                        className="w-full h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: editingTemplate?.background_color }}
                        onClick={() => {
                          setSelectedColor('background_color');
                          setShowColorPicker(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Cor Primária</Label>
                      <div 
                        className="w-full h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: editingTemplate?.primary_color }}
                        onClick={() => {
                          setSelectedColor('primary_color');
                          setShowColorPicker(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Cor do Texto</Label>
                      <div 
                        className="w-full h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: editingTemplate?.text_color }}
                        onClick={() => {
                          setSelectedColor('text_color');
                          setShowColorPicker(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Cor do Texto Secundário</Label>
                      <div 
                        className="w-full h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: editingTemplate?.secondary_text_color }}
                        onClick={() => {
                          setSelectedColor('secondary_text_color');
                          setShowColorPicker(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Cor do Botão</Label>
                      <div 
                        className="w-full h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: editingTemplate?.button_color }}
                        onClick={() => {
                          setSelectedColor('button_color');
                          setShowColorPicker(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Cor do Texto do Botão</Label>
                      <div 
                        className="w-full h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: editingTemplate?.button_text_color }}
                        onClick={() => {
                          setSelectedColor('button_text_color');
                          setShowColorPicker(true);
                        }}
                      />
                    </div>
                  </div>

                  {showColorPicker && selectedColor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-4 rounded-lg">
                        <ChromePicker 
                          color={editingTemplate[selectedColor]}
                          onChange={(color) => handleColorChange(color, selectedColor)}
                        />
                        <Button 
                          className="w-full mt-4"
                          onClick={() => setShowColorPicker(false)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-purple-700 hover:bg-purple-800"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Prévia</h3>
                <Button 
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? "Editar" : "Visualizar"}
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                {renderPreview()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}