
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Image as ImageIcon, Check, Copy, ArrowRight, Loader2, Facebook, Twitter, Instagram, Link2, Share2, MessageCircle, Send, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ShareContent({ type, data, pet, onClose }) {
  const [activeTab, setActiveTab] = useState("social");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  
	const defaultShareImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6a8a19_AppIcon.png";

  useEffect(() => {
    // Gera mensagem baseada no tipo de compartilhamento
    let defaultMessage = "";
    
    if (type === "diario") {
      defaultMessage = `Olá! Quero compartilhar um momento especial com ${pet.name}. ${data.title || `Diário - ${format(new Date(data.date), 'dd/MM/yyyy')}`}`;
    } else if (type === "saude") {
      defaultMessage = `Atualizando sobre a saúde de ${pet.name}! ${data.notes || 'Tudo em dia!'}`;
    } else if (type === "progresso") {
      defaultMessage = `Compartilhando o progresso do ${pet.name} em sua meta de saúde! ${data.status === 'atingida' ? 'Meta atingida! 🎉' : 'Estamos avançando!'}`;
    }
    
    setMessage(defaultMessage);
  }, [type, data, pet]);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleCopyLink = () => {
    // Simula a cópia de um link
    const shareUrl = `https://petcare.app/share/${pet.id}/${type}/${data.id}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleShare = (platform) => {
    setLoading(true);
    
    // Simula envio da publicação
    setTimeout(() => {
      setLoading(false);
      setShared(true);
      
      setTimeout(() => {
        setShared(false);
      }, 2000);
    }, 1000);
  };
  
  const getShareTitle = () => {
    if (type === "diario") {
      return "Compartilhar diário";
    } else if (type === "saude") {
      return "Compartilhar atualização de saúde";
    } else if (type === "progresso") {
      return "Compartilhar progresso";
    }
    
    return "Compartilhar";
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Share2 className="mr-2 h-5 w-5 text-purple-600" />
        {getShareTitle()}
      </h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={pet.photo_url || defaultShareImage}
            alt={pet.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-100"
          />
          <div>
            <h3 className="font-semibold">{pet.name}</h3>
            <p className="text-sm text-gray-500">
              {type === "diario" ? "Momento especial" : 
               type === "saude" ? "Atualização de saúde" : 
               "Progresso"}
            </p>
          </div>
        </div>
        
        <Textarea
          className="mt-4 min-h-[100px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        
        {imagePreview ? (
          <div className="mt-4 relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-40 object-cover rounded-md" 
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => {
                setImage(null);
                setImagePreview(null);
              }}
            >
              Remover
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" type="button" className="w-full">
                <ImageIcon className="mr-2 h-4 w-4" />
                Adicionar imagem
              </Button>
            </label>
          </div>
        )}
      </div>
      
      <h3 className="font-semibold mb-2">Compartilhar via:</h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
        <Button 
          variant="outline" 
          className="flex flex-col items-center py-3 h-auto"
          onClick={() => handleShare('whatsapp')}
        >
          <MessageCircle className="h-6 w-6 text-green-600 mb-1" />
          <span className="text-xs">WhatsApp</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center py-3 h-auto"
          onClick={() => handleShare('facebook')}
        >
          <Facebook className="h-6 w-6 text-blue-600 mb-1" />
          <span className="text-xs">Facebook</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center py-3 h-auto"
          onClick={() => handleShare('instagram')}
        >
          <Instagram className="h-6 w-6 text-pink-600 mb-1" />
          <span className="text-xs">Instagram</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center py-3 h-auto"
          onClick={() => handleShare('twitter')}
        >
          <Twitter className="h-6 w-6 text-sky-500 mb-1" />
          <span className="text-xs">Twitter</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center py-3 h-auto"
          onClick={() => handleShare('email')}
        >
          <Mail className="h-6 w-6 text-gray-700 mb-1" />
          <span className="text-xs">Email</span>
        </Button>
        
        <Button 
          variant="outline"
          className="flex flex-col items-center py-3 h-auto"
          onClick={handleCopyLink}
        >
          <Link2 className="h-6 w-6 text-purple-600 mb-1" />
          <span className="text-xs">Copiar Link</span>
        </Button>
      </div>
      
      <div className="flex justify-end mt-6">
        {loading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </Button>
        ) : shared ? (
          <Button className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" />
            Compartilhado!
          </Button>
        ) : copied ? (
          <Button className="bg-green-600 hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" />
            Link copiado!
          </Button>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        )}
      </div>
    </div>
  );
}
