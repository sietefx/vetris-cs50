
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, AlertTriangle, RefreshCw, UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AboutPage() {
  const [imageLoadError, setImageLoadError] = useState({
    gabriel: false
  });

  const handleImageError = (developer) => {
    setImageLoadError((prev) => ({
      ...prev,
      [developer]: true
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f6c0fa_AppIconV.png"
            alt="Vetris Logo"
            className="w-24 h-24 mx-auto mb-6" />

          <h1 className="text-3xl font-bold mb-4">Sobre o Vetris</h1>
          <p className="text-gray-600">Conheça nossa história e quem está por trás do projeto</p>
        </div>

        {/* Card de doação destacado no topo */}
        <Card className="mb-12 bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Apoie esse Trabalho!</h2>
            <p className="text-gray-600 text-xl mb-4">
              Sua doação ajuda a manter a plataforma e melhorar a saúde dos pets.
            </p>
            
            <p className="text-lg text-gray-800 mb-6">
              Fazemos o possível para fornecer as melhores ferramentas para cuidar do seu pet. Se você acha este serviço útil, considere fazer uma doação.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-lg px-8 py-6">

              <Link to={createPageUrl("Donation")}>
                Doar Agora
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f4e2f7_gabrieltesserfelix.png"
                    alt="Gabriel Tesser Felix"
                    className="w-full rounded-lg shadow-lg"
                    onError={() => handleImageError('gabriel')}
                    style={{
                      display: imageLoadError.gabriel ? 'none' : 'block',
                      minHeight: '200px',
                      objectFit: 'cover'
                    }} />

                  {imageLoadError.gabriel &&
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Erro ao carregar imagem</p>
                      </div>
                    </div>
                  }
                </div>
                <div className="flex-1">
                  <div className="prose max-w-none">
                    <p className="text-lg leading-relaxed mb-6">Oi! Eu sou o Gabriel Tesser Felix — administrador, professor, desenvolvedor… e apaixonado por pets! Criei esse app com muito carinho, pensando em quem, como a gente, busca uma fonte confiável de informações para cuidar melhor dos seus companheiros.



                    </p>
                    <p className="text-lg leading-relaxed mb-6">
                      Aqui, você pode registrar a rotina do seu pet, compartilhar o histórico de saúde com o veterinário 
                      que preferir e ainda guardar momentos especiais da vida do seu bichinho. Tudo em um só lugar, 
                      do jeitinho que eles merecem. 🐾
                    </p>
                    <p className="text-lg leading-relaxed mb-6">Há muitas ideias incríveis para tornar o app ainda mais útil e completo — novas funcionalidades, integração com clínicas, lembretes de vacinação, entre outras. Mas para isso, precisamos de recursos que nos permitam dedicar mais tempo e energia ao desenvolvimento. Faça parte desse projeto, e ajude o Vetris a crescer e ganhar força. Muito obrigado.



                    </p>
                    <p className="text-lg leading-relaxed">
                      Se você curtiu a ideia e acredita no que estamos construindo, considere fazer uma doação. 
                      Qualquer valor ajuda — e muito — a manter o projeto vivo, evoluir a plataforma e levar 
                      informação de qualidade para ainda mais tutores e seus peludos.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xl font-medium mb-2">Vamos juntos cuidar melhor dos nossos amigos de estimação?</p>
            <Button
              asChild
              size="lg"
              className="bg-purple-700 hover:bg-purple-800 mt-4">

              <Link to={createPageUrl("Donation")}>
                <Heart className="w-5 h-5 mr-2" />
                Apoiar o Projeto
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desenvolvedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f4e2f7_gabrieltesserfelix.png"
                    alt="Gabriel Tesser Felix"
                    className="w-full h-full object-cover rounded-full"
                    onError={() => handleImageError('gabriel')}
                    style={{ display: imageLoadError.gabriel ? 'none' : 'block' }} />

                  {imageLoadError.gabriel &&
                  <div className="absolute inset-0 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  }
                </div>
                <h3 className="text-xl font-semibold">Gabriel Tesser Felix</h3>
                <p className="text-gray-600">Administrador e Desenvolvedor</p>
              </div>
            </CardContent>
          </Card>

          {imageLoadError.gabriel &&
          <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                A imagem não pôde ser carregada. Por favor, verifique sua conexão com a internet.
                <Button
                variant="link"
                className="text-yellow-700 underline pl-1"
                onClick={() => window.location.reload()}>

                  <RefreshCw className="w-4 h-4 mr-1" />
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          }
        </div>
      </div>
    </div>);

}