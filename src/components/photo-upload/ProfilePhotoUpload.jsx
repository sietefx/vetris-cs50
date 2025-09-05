
import React, { useState, useRef, useEffect } from "react";
import { UploadFile } from "@/api/integrations";
import { User as UserIcon, Upload, Loader2, X, Move, RotateCcw, Check, ImageIcon, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress"; // Added Progress import

export default function ProfilePhotoUpload({ currentPhotoUrl, onPhotoUpdate }) {
  const [isUploading, setIsUploading] = useState(false); // Renamed from 'uploading' for consistency with outline
  const [previewUrl, setPreviewUrl] = useState(currentPhotoUrl || "");
  const [showEditor, setShowEditor] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // New state for tracking image drag in editor
  const [uploadProgress, setUploadProgress] = useState(0); // New state for upload progress
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const { toast } = useToast();

  const handleFileChange = async (file) => {
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError("Por favor, selecione apenas arquivos de imagem (PNG, JPG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError("A imagem deve ter menos de 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage({
        src: e.target.result,
        file: file
      });
      setShowEditor(true);
      setCropPosition({ x: 0, y: 0 }); // Will be overridden by useEffect
      setZoom(1); // Will be overridden by useEffect
      setError(null);
      setUploadProgress(0); // Reset progress on new file
    };
    reader.readAsDataURL(file);
  };

  const handleInputFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleCrop = async () => {
    if (!originalImage || !canvasRef.current || !imageRef.current) return;

    try {
      setIsUploading(true);
      setUploadProgress(0); // Ensure progress is 0 at start
      setError(null);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      const outputSize = 300;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Calculate source image dimensions based on actual image element's current size due to zoom and positioning
      // This is crucial for capturing the visible part of the image
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Calculate the dimensions of the image as rendered within the 256x256 preview area
      const scaledWidth = naturalWidth * zoom;
      const scaledHeight = naturalHeight * zoom;

      // Calculate position relative to the 256x256 preview container
      const containerSize = 256; // The visible preview size
      const drawX = cropPosition.x;
      const drawY = cropPosition.y;

      // Calculate what portion of the original image needs to be drawn onto the 300x300 canvas
      // This needs to map the 256x256 visible area onto the 300x300 canvas
      const scaleRatio = outputSize / containerSize; // Ratio between canvas size and preview size

      // Source rectangle on the original image
      const sx = -drawX / zoom;
      const sy = -drawY / zoom;
      const sWidth = containerSize / zoom;
      const sHeight = containerSize / zoom;
      
      // Destination rectangle on the canvas
      const dx = 0;
      const dy = 0;
      const dWidth = outputSize;
      const dHeight = outputSize;

      ctx.save();
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#f5f5f5'; // Light gray background for transparency
      ctx.fillRect(0, 0, outputSize, outputSize);
      
      // Draw the visible portion of the original image onto the 300x300 canvas
      ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
      ctx.restore();

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Erro ao processar imagem");
        }

        try {
          const file = new File([blob], `profile-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          // Assuming UploadFile supports an onProgress callback. If not, uploadProgress won't update.
          const result = await UploadFile({ 
            file: file, 
            onProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          });
          
          if (result?.file_url) {
            setPreviewUrl(result.file_url);
            
            if (onPhotoUpdate) {
              onPhotoUpdate(result.file_url);
            }
            
            setShowEditor(false);
            setOriginalImage(null);
            
            toast({
              title: "Foto atualizada",
              description: "Sua foto de perfil foi atualizada com sucesso",
            });
          }
        } catch (uploadError) {
          console.error("Profile photo upload error:", uploadError);
          throw uploadError;
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      setError("Não foi possível fazer o upload da imagem");
      toast({
        title: "Erro ao atualizar foto",
        description: "Não foi possível fazer o upload da imagem",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0); // Reset progress after operation
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const removePhoto = async () => {
    try {
      setIsUploading(true);
      
      setPreviewUrl("");
      
      if (onPhotoUpdate) {
        onPhotoUpdate("");
      }
      
      toast({
        title: "Foto removida",
        description: "Sua foto de perfil foi removida com sucesso",
      });
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      toast({
        title: "Erro ao remover foto",
        description: "Não foi possível remover a foto de perfil",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-ajustar imagem quando carregada no editor
  useEffect(() => {
    if (showEditor && originalImage && imageRef.current) {
      const img = imageRef.current;
      
      const handleImageLoad = () => {
        console.log("🖼️ Editor image loaded, auto-adjusting...");
        
        const containerSize = 256; // Container fixo de 256px
        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
        
        // Ensure minimum zoom for 'fill' (image covers the entire container)
        const minZoomForFill = Math.max(
          containerSize / img.naturalWidth,
          containerSize / img.naturalHeight
        );
        
        // Use the 'fill' zoom as the default (covers the entire square)
        const finalZoom = minZoomForFill; // Always aim to fill the container

        const scaledWidth = img.naturalWidth * finalZoom;
        const scaledHeight = img.naturalHeight * finalZoom;
        const centerX = (containerSize - scaledWidth) / 2;
        const centerY = (containerSize - scaledHeight) / 2;
        
        setZoom(finalZoom);
        setCropPosition({ x: centerX, y: centerY });
        
        console.log("✅ Auto-adjustment complete - scale to fill with centering");
      };

      // Check if image is already loaded, otherwise set onload handler
      if (img.complete) {
        handleImageLoad();
      } else {
        img.onload = handleImageLoad;
      }
    }
  }, [showEditor, originalImage]);

  // Editor de recorte - REDESENHADO
  if (showEditor && originalImage) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto bg-white">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Título */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ajustar Foto</h3>
                <p className="text-sm text-gray-600">
                  Posicione e ajuste o zoom da sua foto
                </p>
              </div>

              {/* Preview - TAMANHO FIXO COM PROPORÇÃO FIXA */}
              <div className="flex justify-center">
                <div className="relative">
                  <div 
                    className="w-64 h-64 border-2 border-gray-200 overflow-hidden bg-gray-50 relative rounded-lg shadow-inner"
                    style={{ position: 'relative' }}
                  >
                    <img
                      ref={imageRef}
                      src={originalImage.src}
                      alt="Preview"
                      className={`absolute select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{
                        transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                        maxWidth: 'none',
                        userSelect: 'none',
                        draggable: false
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                        const startX = e.clientX - cropPosition.x;
                        const startY = e.clientY - cropPosition.y;

                        const handleMouseMove = (e) => {
                          setCropPosition({
                            x: e.clientX - startX,
                            y: e.clientY - startY
                          });
                        };

                        const handleMouseUp = () => {
                          setIsDragging(false);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                        const touch = e.touches[0];
                        const startX = touch.clientX - cropPosition.x;
                        const startY = touch.clientY - cropPosition.y;

                        const handleTouchMove = (e) => {
                          const touch = e.touches[0];
                          setCropPosition({
                            x: touch.clientX - startX,
                            y: touch.clientY - startY
                          });
                        };

                        const handleTouchEnd = () => {
                          setIsDragging(false);
                          document.removeEventListener('touchmove', handleTouchMove);
                          document.removeEventListener('touchend', handleTouchEnd);
                        };

                        document.addEventListener('touchmove', handleTouchMove);
                        document.addEventListener('touchend', handleTouchEnd);
                      }}
                    />
                  </div>
                  
                  {/* Dica de uso */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 text-center whitespace-nowrap">
                    Arraste para posicionar
                  </div>
                </div>
              </div>

              {/* Controle de Zoom - SIMPLIFICADO */}
              <div className="px-2"> {/* Changed from px-4 to px-2 */}
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Zoom</Label>
                  <span className="text-sm text-gray-600">{zoom.toFixed(1)}x</span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Botões - SEM RESETAR */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditor(false);
                    setOriginalImage(null);
                    setUploadProgress(0);
                  }}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleCrop}
                  disabled={isUploading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirmar
                    </>
                  )}
                </Button>
              </div>

              {/* Progresso de Upload */}
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Salvando foto...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Canvas oculto */}
            <canvas
              ref={canvasRef}
              className="hidden"
              width={300}
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface normal - versão simplificada
  return (
    <div className="space-y-4">
      {/* Preview da foto atual */}
      <div className="text-center">
        <div className="relative inline-block">
          <Avatar className="w-24 h-24 border-2 border-gray-200 shadow-lg mx-auto">
            <AvatarImage 
              src={previewUrl} 
              alt="Foto de perfil"
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-100 text-gray-500 text-2xl">
              <UserIcon className="w-12 h-12" />
            </AvatarFallback>
          </Avatar>
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Botões de ação simples */}
      <div className="flex justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {previewUrl ? 'Alterar foto' : 'Adicionar foto'}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={removePhoto}
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
}
