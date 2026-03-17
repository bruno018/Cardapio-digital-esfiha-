import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAFF_PASSWORD = process.env.REACT_APP_STAFF_PASSWORD;
const SESSION_KEY = 'esfiharia_staff_auth';

export default function ProtectedPage({ children, title }) {
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem(SESSION_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === STAFF_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta! Tente novamente.');
      setPassword('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  if (authenticated) return children;

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="bg-stone-900 rounded-2xl p-8 w-full max-w-sm border border-stone-800 shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Área Restrita</h1>
            <p className="text-stone-400 mt-1">{title}</p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-stone-800 text-white placeholder-stone-500 border border-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <Button
            onClick={handleLogin}
            className="w-full btn-primary py-3 text-lg"
          >
            Entrar
          </Button>
        </div>
      </div>
    </div>
  );
}