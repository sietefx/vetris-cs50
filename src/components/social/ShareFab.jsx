import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import ShareContent from "./ShareContent";

/**
 * Componente de Botão de Ação Flutuante (FAB) para compartilhamento rápido
 * nas páginas principais
 */
export default function ShareFab({ pet, defaultType = "saude" }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!pet) return null;
  
  // Cria dados genéricos para compartilhamento rápido
  const generateQuickShareData = () => {
    const today = new Date();
    
    return {
      id: `quick-share-${Date.now()}`,
      date: today.toISOString(),
      title: `Cuidados com ${pet.name}`,
      notes: `Compartilhando os momentos especiais com ${pet.name}!`,
      // Adiciona alguns dados extras dependendo do tipo de compartilhamento
      ...(defaultType === "saude" ? { 
        weight: pet.weight,
        activity_level: "normal"
      } : {}),
      ...(defaultType === "progresso" ? {
        progress: 100,
        status: "em_andamento",
        target_value: pet.weight
      } : {})
    };
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <ShareContent 
            type={defaultType} 
            data={generateQuickShareData()} 
            pet={pet} 
            onClose={() => setIsOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 rounded-full w-12 h-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700 text-white z-10"
      >
        <Share2 className="w-5 h-5" />
      </Button>
    </>
  );
}