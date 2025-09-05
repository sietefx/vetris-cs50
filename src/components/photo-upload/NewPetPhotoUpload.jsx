
import React, { useState, useRef, useEffect } from "react";
import { UploadFile } from "@/api/integrations";
import { PawPrint, Upload, Loader2, X, ImageIcon, Move, RotateCcw, Check, Camera, FolderOpen, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function NewPetPhotoUpload({ value, onChange, className = "" }) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [stream, setStream] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(value || "");
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);

  // Atualizar URL atual quando value mudar
  useEffect(() => {
    console.log("📸 Photo URL updated:", value);
    setCurrentPhotoUrl(value || "");
  }, [value]);

  const handleFile = async (file) => {
    if (!file) return;

    console.log("📁 File selected:", file.name, file.size, file.type);

    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setError("Formato inválido. Use JPG, PNG, GIF ou WebP");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 10MB");
      return;
    }

    // Criar preview para editor
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("📖 File read complete, opening editor");
      setOriginalImage({
        src: e.target.result,
        file: file,
        fileName: file.name
      });
      setShowEditor(true);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Auto-ajustar imagem quando carregada no editor
  useEffect(() => {
    if (showEditor && originalImage && imageRef.current) {
      const img = imageRef.current;
      
      const handleImageLoad = () => {
        console.log("🖼️ Editor image loaded, auto-adjusting...");
        
        // Responsive container size based on Tailwind's sm breakpoint (640px)
        const containerSize = window.innerWidth < 640 ? 256 : 320; // Updated from 192 : 256
        const imgAspectRatio = img.naturalWidth / img.naturalHeight;
        
        let initialZoom;
        if (imgAspectRatio > 1) {
          initialZoom = containerSize / img.naturalHeight;
        } else {
          initialZoom = containerSize / img.naturalWidth;
        }
        
        const minZoom = Math.max(initialZoom, 0.8);
        const drawWidth = img.naturalWidth * minZoom;
        const drawHeight = img.naturalHeight * minZoom;
        const centerX = (containerSize - drawWidth) / 2;
        const centerY = (containerSize - drawHeight) / 2;
        
        setZoom(minZoom);
        setCropPosition({ x: centerX, y: centerY });
        
        console.log("✅ Auto-adjustment complete for", containerSize + "px container");
      };

      if (img.complete) {
        handleImageLoad();
      } else {
        img.onload = handleImageLoad;
      }
    }
  }, [showEditor, originalImage]);

  const startCamera = async () => {
    try {
      setError(null);
      console.log("📷 Starting camera...");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(mediaStream);
      setShowCameraModal(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('❌ Camera error:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    console.log("📷 Stopping camera...");
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !captureCanvasRef.current) return;

    console.log("📸 Capturing photo...");
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `pet-camera-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        console.log("📸 Photo captured, opening editor");
        stopCamera();
        handleFile(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCrop = async () => {
    if (!originalImage || !canvasRef.current || !imageRef.current) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      console.log("🎨 Starting image crop process");

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      // Configurar canvas para imagem de 300x300 (otimizado para perfis)
      const outputSize = 300;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Calcular dimensões da imagem com zoom
      const containerSize = window.innerWidth < 640 ? 256 : 320;
      const scale = outputSize / containerSize;
      
      const drawWidth = img.naturalWidth * zoom * scale;
      const drawHeight = img.naturalHeight * zoom * scale;
      const drawX = cropPosition.x * scale;
      const drawY = cropPosition.y * scale;

      // Limpar o canvas completamente
      ctx.clearRect(0, 0, outputSize, outputSize);
      
      // Preencher com fundo branco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputSize, outputSize);
      
      // Desenhar imagem recortada (sem qualquer clip ou máscara)
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      console.log("🖼️ Canvas drawing completed with 300px output (no mask)");

      // Converter canvas para blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Erro ao processar imagem");
        }

        try {
          const file = new File([blob], `pet-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          // Criar intervalo para simular progresso
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress <= 90) {
              setUploadProgress(currentProgress);
            }
          }, 100);

          console.log("⬆️ Starting upload with 300px optimized image");
          
          try {
            const result = await UploadFile({ file: file });
            
            // Limpar intervalo de progresso
            clearInterval(progressInterval);
            setUploadProgress(100);

            console.log("✅ Upload completed:", result);

            if (result?.file_url) {
              console.log("🔗 Calling onChange with URL:", result.file_url);
              onChange(result.file_url);
              
              // Fechar editor após upload bem-sucedido
              setTimeout(() => {
                setShowEditor(false);
                setOriginalImage(null);
                setUploadProgress(0);
                setIsUploading(false);
              }, 1500);
              
              console.log("🎉 Photo uploaded successfully - closing editor");
            } else {
              throw new Error("URL da imagem não retornada");
            }
          } catch (uploadError) {
            // Limpar intervalo de progresso em caso de erro
            clearInterval(progressInterval);
            console.error("Upload error:", uploadError);
            throw uploadError;
          }
        } catch (error) {
          console.error("Erro no processamento:", error);
          throw error;
        }
      }, 'image/jpeg', 0.92);

    } catch (err) {
      console.error("Erro no recorte:", err);
      setError("Não foi possível processar a imagem. Tente novamente.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetEditor = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      const containerSize = window.innerWidth < 640 ? 256 : 320; // Updated from 192 : 256
      const imgAspectRatio = img.naturalWidth / img.naturalHeight;
      
      let initialZoom;
      if (imgAspectRatio > 1) {
        initialZoom = containerSize / img.naturalHeight;
      } else {
        initialZoom = containerSize / img.naturalWidth;
      }
      
      const minZoom = Math.max(initialZoom, 0.8);
      const drawWidth = img.naturalWidth * minZoom;
      const drawHeight = img.naturalHeight * minZoom;
      const centerX = (containerSize - drawWidth) / 2;
      const centerY = (containerSize - drawHeight) / 2;
      
      setZoom(minZoom);
      setCropPosition({ x: centerX, y: centerY });
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

  // Modal da câmera
  if (showCameraModal) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tirar Foto</h3>
            <Button variant="ghost" size="sm" onClick={stopCamera}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-white/70"></div> {/* Updated from w-48 h-48 ... rounded-full */}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={stopCamera} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={capturePhoto} className="flex-1 bg-purple-600 hover:bg-purple-700">
              <Camera className="w-4 h-4 mr-2" />
              Tirar Foto
            </Button>
          </div>
          
          <canvas ref={captureCanvasRef} className="hidden" />
        </div>
      </div>
    );
  }

  // Editor de recorte
  if (showEditor && originalImage) {
    return (
      <Card className={`max-w-lg mx-auto ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Ajustar Foto do Pet</h3>
              <p className="text-sm text-gray-600">
                Posicione e ajuste o zoom para enquadrar o rosto do seu pet
              </p>
            </div>

            {/* Instrução FORA do frame da foto */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
              <div className="flex items-center justify-center gap-2 text-purple-700">
                <Move className="w-4 h-4" />
                <span className="text-sm font-medium">Arraste a imagem para posicionar</span>
              </div>
            </div>

            {/* Preview quadrado */}
            <div className="relative flex justify-center">
              <div className="relative">
                <div 
                  className={`w-64 h-64 sm:w-80 sm:h-80 border-4 border-purple-200 overflow-hidden bg-gray-100 shadow-lg relative ${ // Updated from w-48 h-48 sm:w-64 sm:h-64 rounded-full
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
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
                  
                  {/* Removed subtle central indicator */}
                </div>
              </div>

              <canvas
                ref={canvasRef}
                className="hidden"
                width={300}
                height={300}
              />
            </div>

            {/* Controles de zoom */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Zoom: {zoom.toFixed(1)}x
              </Label>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex gap-2 order-2 sm:order-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetEditor}
                    disabled={isUploading}
                    className="flex-1 sm:flex-none flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resetar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowEditor(false);
                      setOriginalImage(null);
                    }}
                    disabled={isUploading}
                    className="flex-1 sm:flex-none flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Fechar
                  </Button>
                </div>
                
                <Button
                  onClick={handleCrop}
                  disabled={isUploading}
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar
                    </>
                  )}
                </Button>
              </div>

              {/* Indicador de progresso */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Processando imagem...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 flex items-center gap-1 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Interface principal
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview da foto atual */}
      {currentPhotoUrl && (
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 overflow-hidden border-4 border-purple-200 shadow-md bg-gray-100"> {/* Removed rounded-full */}
            <img
              src={currentPhotoUrl}
              alt="Foto atual"
              className="w-full h-full object-cover"
              onLoad={() => console.log("✅ Preview photo loaded:", currentPhotoUrl)}
              onError={(e) => {
                console.error("❌ Preview photo failed:", currentPhotoUrl);
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                `;
              }}
            />
          </div>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 hover:border-purple-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {currentPhotoUrl ? 'Trocar foto do pet' : 'Adicionar foto do pet'}
        </h3>
        <p className="text-gray-600 mb-6">
          Arraste uma imagem ou clique para selecionar
        </p>

        {/* Botões de ação */}
        <div className="flex gap-3 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Escolher arquivo
          </Button>

          <Button
            type="button" 
            variant="outline"
            onClick={startCamera}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Tirar foto
          </Button>
        </div>

        {/* Input oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Informações */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          Formatos: JPG, PNG, GIF, WebP • Máximo: 10MB
        </p>
        <p className="text-xs text-purple-600 font-medium">
          ✨ Ajuste automático com editor de recorte profissional
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 flex items-center gap-2 bg-red-50 p-3 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
