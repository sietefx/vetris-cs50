import React, { useState, useRef } from "react";
import { UploadFile } from "@/api/integrations";
import { PawPrint, Upload, Loader2 } from "lucide-react";
// Removido import de Image que não existe em lucide-react
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PetPhotoUpload({ value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) {
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setError(`Formato de arquivo inválido: ${file.type}. Apenas JPG, PNG, GIF ou WebP são permitidos.`);
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. O limite é 10MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload simplificado sem processamento de imagem
      const result = await UploadFile({ file });

      if (result?.file_url) {
        onChange(result.file_url);
      } else {
        throw new Error("API não retornou URL da imagem");
      }
    } catch (err) {
      setError(`Erro no upload: ${err.message || "Erro desconhecido"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setPreviewImage(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-purple-500 bg-purple-50" : "border-gray-200"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {value || previewImage ? (
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-3">
              <img 
                src={previewImage || value} 
                alt="Foto do pet" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  setError("Falha ao carregar imagem. O formato pode ser incompatível.");
                  e.target.src = "";
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="mt-2"
            >
              Remover foto
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <Loader2 className="h-12 w-12 text-purple-400 animate-spin mb-2" />
            ) : (
              <PawPrint className="h-12 w-12 text-gray-400 mb-2" />
            )}
            <p className="text-purple-600 font-medium mb-2">
              {isUploading 
                ? "Processando imagem..." 
                : "Arraste uma foto do seu pet ou clique para selecionar"}
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            
            {!isUploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar foto
              </Button>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG, GIF ou WebP até 10MB
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}