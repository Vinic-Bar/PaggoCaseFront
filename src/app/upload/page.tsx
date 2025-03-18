"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../components/Header";
import { FaPaperPlane } from 'react-icons/fa'; // Importe o ícone

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface User {
  id: string;
  email: string;
}

const UploadPage = () => {
  const auth = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!auth?.user) {
      router.push('/'); // Redireciona para a página principal se o usuário não estiver logado
    }
  }, [auth, router]);

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [invoiceId, setInvoiceId] = useState<number | null>(null); // Armazena o invoiceId
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Por favor, selecione um arquivo para enviar.");
      return;
    }

    setIsUploading(true);
    setMessage(""); // Limpa a mensagem anterior

    const formData = new FormData();
    formData.append("file", file);
    if (auth && auth.user && typeof auth.user === 'object' && 'id' in auth.user) {
      formData.append("userId", auth.user.id); // Adiciona o ID do usuário logado
    } else {
      alert("Erro: Usuário não está autenticado corretamente.");
      setIsUploading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Resposta da API não é JSON:", text);
        setMessage("Erro ao enviar o arquivo. Resposta inválida do servidor.");
        setIsUploading(false);
        return;
      }

      const data = await res.json();
      console.log("Resposta da API (JSON):", data);

      if (res.ok) {
        setMessage(`Arquivo enviado com sucesso!`);
        if (data.invoiceId) {
          setInvoiceId(Number(data.invoiceId)); // Garante que seja um número
        }

        // Chamar a API de OCR
        const ocrRes = await fetch("http://localhost:3001/ocr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imagePath: data.filePath, userId: auth.user.id }), // Inclui o userId
        });

        const ocrContentType = ocrRes.headers.get("content-type");
        if (!ocrContentType || !ocrContentType.includes("application/json")) {
          const ocrText = await ocrRes.text();
          console.error("Resposta da API de OCR não é JSON:", ocrText);
          setMessage("Erro ao extrair o texto. Resposta inválida do servidor.");
          setIsUploading(false);
          return;
        }

        const ocrData = await ocrRes.json();
        console.log("Texto extraído (OCR):", ocrData.text);
        setExtractedText(ocrData.text);

        // Atualizar o texto da fatura no backend
        await fetch("http://localhost:3001/upload/update-invoice-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            invoiceId: data.invoiceId,
            text: ocrData.text,
          }),
        });
      } else {
        setMessage(`Erro: ${data.error}`);
      }
    } catch (err) {
      console.error("Erro ao enviar o arquivo:", err);
      setMessage("Erro ao enviar o arquivo.");
    }

    setIsUploading(false);
  };

  const handleQuery = async () => {
    if (!extractedText || !query || !invoiceId) {
      alert("Por favor, forneça o texto extraído, a consulta e um invoiceId válido.");
      return;
    }

    setIsLoading(true); // Inicia o carregamento

    try {
      const res = await fetch("http://localhost:3001/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: extractedText, query, invoiceId }),
      });

      const data = await res.json();
      console.log("Resposta da API de LLM (JSON):", data);

      if (res.ok) {
        setExplanation(data.explanation);

        // Salvar a pergunta e resposta no backend
        await fetch("http://localhost:3001/upload/save-query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            invoiceId: invoiceId,
            query,
            response: data.explanation,
          }),
        });

        // Atualizar o estado com a resposta salva
        setExplanation(data.explanation);
      } else {
        setMessage(`Erro: ${data.error}`);
      }
    } catch (err) {
      console.error("Erro ao obter explicação:", err);
      setMessage("Erro ao obter explicação.");
    }

    setIsLoading(false); // Finaliza o carregamento
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-start p-8">
        <div className="left-side">
          <h1 className="text-3xl font-semibold mb-8">Faça upload da sua fatura</h1>

          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="custom-file-input"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">Arquivo selecionado: {file.name}</p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="button-limited"
          >
            {isUploading ? <div className="spinner"></div> : "Upload"}
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="button-limited"
          >
            Ver Documentos
          </button>

          {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}

          {extractedText && (
            <div className="mt-8 p-4 border rounded bg-gray-100">
              <h2 className="text-lg font-semibold mb-2">Texto obtido da imagem:</h2>
              <p className="text-sm text-gray-800">{extractedText}</p>
            </div>
          )}
        </div>

        <div className="right-side">
          {extractedText && (
            <>
              <div className="flex flex-col items-center gap-4">
                {explanation && (
                  <div className="message-container">
                    <h2>Explicação:</h2>
                    <p>{explanation}</p>
                  </div>
                )}
              </div>
              <div className="input-container">
                {isLoading && (
                  <div className="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                )}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Faça uma pergunta sobre o texto"
                  className="input-field"
                />
                <button
                  onClick={handleQuery}
                  className="send-button"
                  disabled={isLoading} // Desabilita o botão enquanto carrega
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <FaPaperPlane /> // Use o ícone aqui
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadPage;