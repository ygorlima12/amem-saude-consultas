import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart } from 'lucide-react'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      
      // ✅ Redirecionar baseado no tipo de usuário
      if (result.usuario.tipo_usuario === 'admin') {
        navigate('/admin')
      } else {
        navigate('/cliente')
      }
    } catch (err: any) {
      // Mensagens de erro mais amigáveis
      if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.')
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Tente novamente.')
      } else {
        setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Amém Saúde</h1>
          <p className="text-gray-600 mt-2">Acesse sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            className="mt-6"
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-primary-600 hover:text-primary-700 font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-xs text-gray-500">
            Portal de Consultas com Preço Fixo
          </p>
        </div>
      </div>
    </div>
  )
}