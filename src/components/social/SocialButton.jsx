
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import ShareContent from "./ShareContent";
import { useToast } from "@/components/ui/use-toast";

/**
 * Botão para compartilhamento social em diferentes partes do app
 * @param {Object} options
 * @param {string} options.type - diario, saude, ou progresso
 * @param {Object} options.data - Dados a serem compartilhados
 * @param {Object} options.pet - Informações do pet
 * @param {string} options.variant - Estilo do botão (default, outline, etc.)
 * @param {string} options.size - Tamanho do botão (default, sm, lg)
 * @param {boolean} options.iconOnly - Se deve mostrar apenas o ícone
 */
export default function SocialButton({ type, data, pet, size = 'md', iconOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      setLoading(true);
      
      // Por enquanto, apenas mostrar um toast informativo
      toast({
        title: "Função em desenvolvimento",
        description: "O compartilhamento será disponibilizado em breve.",
        duration: 3000
      });
      
      // Código para compartilhamento quando estiver implementado
      /*
      if (navigator.share) {
        await navigator.share({
          title: `${pet?.name || 'Meu pet'} - ${
            type === 'diario' ? 'Registro do Diário' : 
            type === 'saude' ? 'Registro de Saúde' : 
            'Compartilhamento Vetris'
          }`,
          text: `Compartilhando via Vetris: ${
            type === 'diario' ? `Diário de ${pet?.name || 'meu pet'}` : 
            type === 'saude' ? `Saúde de ${pet?.name || 'meu pet'}` : 
            'Informações do meu pet'
          }`,
          url: 'https://vetris.app'
        });
      } else {
        // Fallback para quando a Web Share API não está disponível
        toast({
          title: "Compartilhamento não suportado",
          description: "Seu navegador não suporta o compartilhamento nativo.",
          variant: "destructive"
        });
      }
      */
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar este conteúdo."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!data || !pet) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size={size}
          className="text-gray-700"
          onClick={handleShare}
          disabled={loading}
        >
          <Share2 className={`w-4 h-4 ${!iconOnly ? "mr-2" : ""}`} />
          {!iconOnly && "Compartilhar"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <ShareContent 
          type={type} 
          data={data} 
          pet={pet} 
          onClose={() => setIsOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
