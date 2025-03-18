import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUser } from 'react-icons/fa'; // Certifique-se de ter instalado react-icons

const Header = () => {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
      router.push('/'); // Redireciona para a página principal após logout
    }
  };

  return (
    <>
      <header className="header">
        <nav className="nav">
          <div className="nav-content">
            <div className="user-info">
              <FaUser className="user-icon" />
              <span className="user-email">{auth?.user?.email}</span>
            </div>
            <div className="nav-buttons">
              <button onClick={() => router.push('/dashboard')} className="nav-button">
                Ver Documentos
              </button>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>
      <div className="header-spacer"></div> {/* Adiciona um espaçador */}
      <style jsx>{`
        .header {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px;
          background-color: #f8f9fa;
        }
        .nav {
          width: 100%;
          max-width: 1200px;
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .user-info {
          display: flex;
          align-items: center;
        }
        .user-icon {
          margin-right: 8px;
        }
        .user-email {
          font-size: 14px; /* Diminui o tamanho da fonte */
          font-weight: bold;
        }
        .nav-buttons {
          display: flex;
          gap: 10px;
        }
        .nav-button {
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
        }
        .header-spacer {
          height: 20px;
        }
      `}</style>
    </>
  );
};

export default Header;