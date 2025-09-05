import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Star, Clock, MapPin, Video, Calendar, Check, 
  Heart, ThumbsUp, Phone, Mail
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function VetCard({ vet, selected, onSelect }) {
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
        selected ? "ring-2 ring-purple-500 shadow-md" : "hover:border-purple-200"
      }`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="flex justify-center sm:block">
            <Avatar className="h-20 w-20 rounded-full border-2 border-purple-100 shadow-md">
              <AvatarImage 
                src={vet.photo_url} 
                alt={vet.full_name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-full bg-purple-100 text-purple-800 text-lg font-semibold">
                {vet.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg text-gray-800">{vet.full_name}</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 font-normal">
                  {vet.specialty}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {vet.online_available && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 font-normal flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    Atende online
                  </Badge>
                )}
                <Badge variant="outline" className="bg-purple-50 text-purple-700 font-normal">
                  {vet.crmv}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-medium ml-1">{vet.rating}</span>
              </div>
              <span className="text-gray-500 text-sm">
                ({vet.review_count} avaliações)
              </span>
              {vet.review_count > 50 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-500" />
                <span className="truncate">{vet.clinic_name}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-500" />
                <span className="truncate">{vet.working_hours}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 col-span-1 sm:col-span-2">
                <Calendar className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-500" />
                <span>Próxima vaga: <span className="font-medium text-purple-700">{format(new Date(vet.next_available), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></span>
              </div>
            </div>
            
            {vet.bio && (
              <div className="text-sm text-gray-600 border-t border-gray-100 pt-2 mt-2">
                <p className="line-clamp-2">{vet.bio}</p>
              </div>
            )}
          </div>
          
          <div className="flex sm:flex-col justify-center gap-2 sm:justify-between items-center">
            <Button
              onClick={() => onSelect(vet)}
              variant={selected ? "default" : "outline"}
              className={`${selected ? "bg-purple-700 hover:bg-purple-800" : "border-purple-200 hover:bg-purple-50"} sm:w-32 whitespace-nowrap`}
            >
              {selected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Selecionado
                </>
              ) : (
                "Selecionar"
              )}
            </Button>
            
            <div className="hidden sm:flex flex-col gap-1 items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                title="Favoritar Veterinário"
                onClick={(e) => {
                  e.stopPropagation();
                  // Aqui você pode adicionar a ação para favoritar o veterinário
                }}
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}