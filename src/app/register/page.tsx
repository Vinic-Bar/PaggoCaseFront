"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("https://paggocaseback-production.up.railway.app/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Erro ao registrar usuário");
      }

      setSuccess("Conta criada com sucesso!");
      setTimeout(() => {
        router.push("/"); // Redireciona para login após 2 segundos
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-box">
          <h1>Registrar</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
