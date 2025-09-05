
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Image, Loader2, X } from "lucide-react";
import { User } from "@/api/entities";
import { Pet } from "@/api/entities";
import { Post } from "@/api/entities/Post";
import { InvokeLLM, GenerateImage } from "@/api/integrations";

export default function PostForm({ open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "historia",
    category: "comportamento",
    pet_id: "",
    is_public: true,
    tags: []
  });
  
  const [pets, setPets] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  
  useEffect(() => {
    const fetchUserAndPets = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        const petsData = await Pet.list();
        setPets(petsData);
        
        if (petsData.length > 0) {
          setFormData(prev => ({
            ...prev,
            pet_id: petsData[0].id
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    
    if (open) {
      fetchUserAndPets();
      resetForm();
    }
  }, [open]);
  
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "historia",
      category: "comportamento",
      pet_id: "",
      is_public: true,
      tags: []
    });
    setErrors({});
    setPhotoPreview(null);
    setPhotoFile(null);
    setGeneratedImage(null);
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoError(null);
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("A imagem deve ter no máximo 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        setPhotoError("O arquivo deve ser uma imagem");
        return;
      }
      
      setPhotoFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setGeneratedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearPhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setGeneratedImage(null);
    setPhotoError(null);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = "O título é obrigatório";
    }
    
    if (!formData.content?.trim()) {
      newErrors.content = "O conteúdo é obrigatório";
    }
    
    if (!formData.type) {
      newErrors.type = "Selecione o tipo de post";
    }
    
    if (!formData.category) {
      newErrors.category = "Selecione a categoria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const postData = {
        ...formData,
        user_id: user.id,
        photo_url: generatedImage || photoPreview || null
      };
      
      await Post.create(postData);
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar post:", error);
      setErrors(prev => ({
        ...prev,
        submit: "Houve um erro ao criar o post. Tente novamente."
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateImage = async () => {
    if (!formData.content?.trim()) {
      setErrors(prev => ({
        ...prev,
        content: "Digite algum conteúdo para gerar uma imagem"
      }));
      return;
    }
    
    setGenerating(true);
    try {
      const selectedPet = pets.find(p => p.id === formData.pet_id);
      const petName = selectedPet ? selectedPet.name : "pet";
      
      const prompt = await InvokeLLM({
        prompt: `Crie um prompt para gerar uma imagem a partir do seguinte texto sobre um pet chamado ${petName}: "${formData.content}". 
                 O prompt deve ser detalhado, artístico e visualmente descritivo para gerar uma bela ilustração. 
                 Não inclua o nome do pet no prompt, mas descreva-o. 
                 Retorne apenas o prompt, sem comentários adicionais. Máximo 100 palavras.`,
      });
      
      const generatedImageResult = await GenerateImage({
        prompt: prompt
      });
      
      if (generatedImageResult && generatedImageResult.url) {
        setGeneratedImage(generatedImageResult.url);
        setPhotoPreview(null);
        setPhotoFile(null);
      } else {
        throw new Error("Falha ao gerar imagem");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      setPhotoError("Não foi possível gerar a imagem. Tente novamente mais tarde.");
    } finally {
      setGenerating(false);
    }
  };

  const postTypes = [
    { value: "historia", label: "História" },
    { value: "dica", label: "Dica" },
    { value: "pergunta", label: "Pergunta" },
    { value: "recomendacao", label: "Recomendação" }
  ];
  
  const categories = [
    { value: "saude", label: "Saúde" },
    { value: "comportamento", label: "Comportamento" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "cuidados", label: "Cuidados" },
    { value: "treinamento", label: "Treinamento" },
    { value: "outro", label: "Outro" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw] sm:w-full p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="bg-purple-50 px-3 py-2 sm:p-4 border-b border-purple-100 text-left flex flex-row justify-between items-start">
          <div>
            <DialogTitle className="text-lg font-semibold text-purple-800">
              Criar novo post
            </DialogTitle>
            <p className="text-purple-700 opacity-80 text-xs mt-0.5">
              Compartilhe histórias ou dicas sobre seu pet
            </p>
          </div>
          <DialogClose className="relative -mr-1 -mt-1 p-1 rounded-full bg-purple-50 hover:bg-purple-100">
            <X className="h-4 w-4 text-purple-700" />
            <span className="sr-only">Fechar</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[80vh] flex-1">
          <div className="px-3 py-2 sm:p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Um título para seu post"
                  className={`${errors.title ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.title}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Tipo de post <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger className={`${errors.type ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {postTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.type}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger className={`${errors.category ? "border-red-500 focus-visible:ring-red-500" : ""} h-9 text-sm`}>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="pet" className="text-sm font-medium">
                  Sobre qual pet?
                </Label>
                <Select
                  value={formData.pet_id}
                  onValueChange={(value) => handleChange("pet_id", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Selecione um pet" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="content" className="text-sm font-medium">
                  Conteúdo <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="O que você quer compartilhar?"
                  className={`resize-none min-h-[90px] ${errors.content ? "border-red-500 focus-visible:ring-red-500" : ""} text-sm`}
                  rows={4}
                />
                {errors.content && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.content}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label className="text-sm font-medium">Visibilidade</Label>
                <RadioGroup
                  value={formData.is_public ? "public" : "private"}
                  onValueChange={(value) => handleChange("is_public", value === "public")}
                  className="flex items-center space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="public" id="public" className="h-4 w-4" />
                    <Label htmlFor="public" className="cursor-pointer text-sm">Público</Label>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="private" id="private" className="h-4 w-4" />
                    <Label htmlFor="private" className="cursor-pointer text-sm">Somente seguidores</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-sm font-medium">Foto</Label>
                  <div className="flex gap-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerateImage}
                      disabled={generating || !formData.content}
                      className="text-xs h-6 px-2"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        "Gerar com IA"
                      )}
                    </Button>
                    {(photoPreview || generatedImage) && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearPhoto}
                        className="text-xs h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
                
                {photoPreview || generatedImage ? (
                  <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 w-full aspect-video">
                    <img 
                      src={photoPreview || generatedImage} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-3 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => document.getElementById('photo-upload').click()}>
                    <Image className="w-6 h-6 mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">
                      Clique para adicionar uma foto
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ou use "Gerar com IA" para criar uma imagem
                    </p>
                    <input
                      type="file"
                      id="photo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </div>
                )}
                
                {photoError && (
                  <div className="flex items-center text-xs text-red-500 mt-0.5">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {photoError}
                  </div>
                )}
              </div>
              
              {errors.submit && (
                <div className="bg-red-50 p-2 rounded-lg text-red-600 text-xs flex items-start">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 mr-1.5 flex-shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}
              
              <DialogFooter className="mt-4 pt-2 border-t">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-8 px-3 text-sm mr-2"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 h-8 px-3 text-sm"
                  size="sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    "Publicar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
