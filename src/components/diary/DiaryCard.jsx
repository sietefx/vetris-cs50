import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { 
  Edit, Trash2, Camera, Video, Download, Share2,
  Smile, Frown, Zap, Thermometer, UtensilsCrossed, Droplet
} from "lucide-react";

export default function DiaryCard({ entry, onEdit, onDelete, onShare, onMediaDownload }) {
  const moodIcons = {
    feliz: <Smile className="w-5 h-5 text-green-500" />,
    normal: <Smile className="w-5 h-5 text-blue-500" />,
    triste: <Frown className="w-5 h-5 text-purple-500" />,
    agitado: <Zap className="w-5 h-5 text-orange-500" />,
    doente: <Thermometer className="w-5 h-5 text-red-500" />
  };

  const foodIntakeColors = {
    normal: "bg-green-100 text-green-800",
    aumentado: "bg-blue-100 text-blue-800",
    diminuido: "bg-yellow-100 text-yellow-800",
    nao_comeu: "bg-red-100 text-red-800"
  };

  const waterIntakeColors = {
    normal: "bg-blue-100 text-blue-800",
    aumentado: "bg-green-100 text-green-800",
    diminuido: "bg-yellow-100 text-yellow-800",
    nao_bebeu: "bg-red-100 text-red-800"
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {format(new Date(entry.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {moodIcons[entry.mood]}
              <span className="text-sm text-gray-600 capitalize">{entry.mood}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {entry.media_type !== "none" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMediaDownload(entry)}
                className="h-8 w-8"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onShare(entry)}
              className="h-8 w-8"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(entry)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry)}
              className="h-8 w-8 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mídia */}
        {entry.media_type === "photo" && entry.photo_url && (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={entry.photo_url}
              alt="Foto do dia"
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/50 text-white">
                <Camera className="w-3 h-3 mr-1" />
                Foto
              </Badge>
            </div>
          </div>
        )}

        {entry.media_type === "video" && entry.video_url && (
          <div className="relative rounded-lg overflow-hidden">
            <video
              src={entry.video_url}
              controls
              className="w-full h-48 object-contain bg-black"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-black/50 text-white">
                <Video className="w-3 h-3 mr-1" />
                Vídeo
              </Badge>
            </div>
          </div>
        )}

        {/* Peso */}
        {entry.weight && (
          <div>
            <h4 className="text-sm font-medium mb-1">Peso</h4>
            <Badge variant="outline" className="bg-purple-50">
              {entry.weight} kg
            </Badge>
          </div>
        )}

        {/* Alimentação e Hidratação */}
        <div className="flex gap-4">
          {entry.food_intake && (
            <div>
              <div className="flex items-center gap-1 text-sm font-medium mb-1">
                <UtensilsCrossed className="w-4 h-4" />
                Alimentação
              </div>
              <Badge className={foodIntakeColors[entry.food_intake]}>
                {entry.food_intake.replace("_", " ").capitalize()}
              </Badge>
            </div>
          )}

          {entry.water_intake && (
            <div>
              <div className="flex items-center gap-1 text-sm font-medium mb-1">
                <Droplet className="w-4 h-4" />
                Hidratação
              </div>
              <Badge className={waterIntakeColors[entry.water_intake]}>
                {entry.water_intake.replace("_", " ").capitalize()}
              </Badge>
            </div>
          )}
        </div>

        {/* Atividades */}
        {entry.activities?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Atividades</h4>
            <div className="flex flex-wrap gap-2">
              {entry.activities.map((activity, idx) => (
                <Badge key={idx} className="bg-blue-100 text-blue-800">
                  {activity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sintomas */}
        {entry.symptoms?.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Sintomas</h4>
            <div className="flex flex-wrap gap-2">
              {entry.symptoms.map((symptom, idx) => (
                <Badge key={idx} className="bg-red-100 text-red-800">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Observações */}
        {entry.notes && (
          <div>
            <h4 className="text-sm font-medium mb-1">Observações</h4>
            <p className="text-gray-600 text-sm whitespace-pre-line">{entry.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}