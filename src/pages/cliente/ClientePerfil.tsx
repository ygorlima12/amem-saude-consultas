import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User } from 'lucide-react'

export const ClientePerfil = () => {
  const { user, cliente } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-avatar rounded-full flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {user?.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-secondary-900">{user?.nome}</h2>
            <p className="text-text-secondary">{user?.email}</p>
            {cliente && (
              <p className="text-sm text-text-secondary mt-1">
                CPF: {cliente.cpf}
              </p>
            )}
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </div>

        <CardTitle>Informações Pessoais</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Nome Completo
            </label>
            <input
              type="text"
              defaultValue={user?.nome}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Telefone
            </label>
            <input
              type="tel"
              defaultValue={user?.telefone || ''}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              CPF
            </label>
            <input
              type="text"
              defaultValue={cliente?.cpf}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsEditing(false)}>
              Salvar Alterações
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
