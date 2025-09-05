import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInYears, differenceInMonths, parseISO, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Cake, ChevronRight, Heart, Award, Calendar } from "lucide-react";

export default function PetProfileCard({ pet, showActions = true }) {
  const navigate = useNavigate();

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    try {
      const birth = parseISO(birthDate);
      const now = new Date();
      const years = differenceInYears(now, birth);
      
      if (years > 0) {
        return `${years} ${years === 1 ? "ano" : "anos"}`;
      } else {
        const months = differenceInMonths(now, birth);
        return `${months} ${months === 1 ? "mês" : "meses"}`;
      }
    } catch (e) {
      console.error("Erro ao calcular idade:", e);
      return null;
    }
  };

  const handleViewProfile = () => {
    navigate(createPageUrl("PetProfile") + `?id=${pet.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-3 bg-gradient-to-r from-purple-400 to-blue-500"></div>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-2 border-purple-100">
            <AvatarImage src={pet.photo_url || "https://images.unsplash.com/photo-1560807707-8cc77767d783"} alt={pet.name} />
            <AvatarFallback className="bg-purple-100 text-purple-800">
              {pet.name?.charAt(0).toUpperCase() || "P"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{pet.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                {pet.species === "cachorro" ? "Cachorro" : pet.species === "gato" ? "Gato" : "Outro"}
              </Badge>
              
              {pet.breed && (
                <Badge variant="outline" className="text-xs">{pet.breed}</Badge>
              )}
              
              {pet.birth_date && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Cake className="w-3 h-3" />
                  {calculateAge(pet.birth_date)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={() => navigate(createPageUrl("Health") + `?pet_id=${pet.id}`)}
            >
              <Heart className="w-3 h-3 mr-1 text-red-500" />
              Saúde
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={() => navigate(createPageUrl("Diary") + `?pet_id=${pet.id}`)}
            >
              <Award className="w-3 h-3 mr-1 text-amber-500" />
              Diário
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={() => navigate(createPageUrl("Calendar") + `?pet_id=${pet.id}`)}
            >
              <Calendar className="w-3 h-3 mr-1 text-blue-500" />
              Agenda
            </Button>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-purple-700 hover:text-purple-800 hover:bg-purple-50 font-medium text-sm"
          onClick={handleViewProfile}
        >
          Ver perfil completo
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}