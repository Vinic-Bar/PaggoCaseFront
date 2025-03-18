"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import Link from "next/link";
import "../../public/styles.css"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para armazenar a mensagem de erro
  const auth = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (auth?.user) {
      router.push('/upload'); // Redireciona para a página de upload se o usuário estiver logado
    }
  }, [auth, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth) {
      try {
        await auth.login(email, password);
        router.push('/upload'); // Redireciona para a página de upload após login bem-sucedido
      } catch (error) {
        console.error(error);
        setError("Login ou senha incorretos"); // Define a mensagem de erro
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Bem-vindo</h1>
        <form className="login-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="submit-button">Entrar</button>
        </form>
        {error && <p className="error-message">{error}</p>} {/* Exibe a mensagem de erro se houver */}
        <p className="register-text">
          Ainda não tem uma conta? <Link href="/register" className="register-link">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
