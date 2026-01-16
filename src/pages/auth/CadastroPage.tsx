import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart, Mail, CheckCircle } from 'lucide-react'
import { isValidCPF, isValidEmail, formatCPF, removeFormatting } from '@/utils/format'

export const CadastroPage = () => {
  const { cadastrar } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cpf') {
      formattedValue = formatCPF(value)
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (!isValidEmail(formData.email)) {
      setError('Email inválido')
      return
    }

    if (!isValidCPF(formData.cpf)) {
      setError('CPF inválido')
      return
    }

    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório')
      return
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      await cadastrar({
        ...formData,
        cpf: removeFormatting(formData.cpf),
      })
      
      // ✅ Salvar email e mostrar mensagem de sucesso
      setUserEmail(formData.email)
      setSuccess(true)
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      
      // Mensagens de erro mais específicas
      if (err.message?.includes('already registered') || err.message?.includes('duplicate')) {
        setError('Este email já está cadastrado. Tente fazer login.')
      } else if (err.message?.includes('email')) {
        setError('Erro ao enviar email de confirmação. Tente novamente.')
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ Tela de sucesso após cadastro
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h1>
            <p className="text-gray-600">Verifique seu email para continuar</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Email de confirmação enviado
                </p>
                <p className="text-sm text-blue-700">
                  Enviamos um link de confirmação para{' '}
                  <span className="font-semibold">{userEmail}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">1.</span>
              <span>Abra seu email e procure por uma mensagem da Amém Saúde</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">2.</span>
              <span>Clique no link de confirmação (verifique a pasta de spam)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">3.</span>
              <span>Após confirmar, você será redirecionado para fazer login</span>
            </p>
          </div>

          <Link to="/login">
            <Button fullWidth variant="outline">
              Ir para Login
            </Button>
          </Link>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Não recebeu o email?{' '}
              <button 
                onClick={() => setSuccess(false)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Tentar novamente
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Formulário de cadastro
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">Cadastre-se no Amém Saúde</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="nome"
            label="Nome Completo"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <Input
            type="text"
            name="cpf"
            label="CPF"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            maxLength={14}
            required
          />

          <Input
            type="tel"
            name="telefone"
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={handleChange}
            required
            autoComplete="tel"
          />

          <Input
            type="password"
            name="senha"
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            value={formData.senha}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <Input
            type="password"
            name="confirmarSenha"
            label="Confirmar Senha"
            placeholder="Digite a senha novamente"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            className="mt-6"
          >
            Criar Conta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}