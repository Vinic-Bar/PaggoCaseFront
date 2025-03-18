"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import Header from "../../components/Header";

interface Document {
  id: number;
  imageUrl: string;
  text: string;
  createdAt: string;
  llmResponse: string;
  queries: { query: string; response: string }[];
}

const DashboardPage = () => {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user) {
      router.push('/'); // Redireciona para a página principal se o usuário não estiver logado
    }
  }, [auth, router]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("http://localhost:3001/upload/documents", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Erro ao buscar documentos");
        }

        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDownload = async (fileId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/upload/download/${fileId}`);
      if (!response.ok) {
        throw new Error('Erro ao baixar o documento');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document_${fileId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Não foi possível baixar o arquivo. Tente novamente.');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  return (
    <>
      <Header />
      <div className="dashboard-page">
        <h1 className="dashboard-header text-3xl font-semibold">Documentos Enviados</h1>
        <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
          {documents.length === 0 ? (
            <p className="text-gray-600">Nenhum documento enviado.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="flex justify-between items-center w-full">
                  <h2>Documento {doc.id}</h2>
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="download-button"
                  >
                    Baixar Documento
                  </button>
                </div>
                <p>Enviado em: {new Date(doc.createdAt).toLocaleString()}</p>
                <p>Texto Extraído: {doc.text}</p>
                {doc.queries && doc.queries.length > 0 && (
                  <div className="queries-section">
                    <h3>Perguntas e Respostas:</h3>
                    {doc.queries.map((query, index) => (
                      <div key={index}>
                        <p><strong>Pergunta:</strong> {query.query}</p>
                        <p><strong>Resposta:</strong> {query.response}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
