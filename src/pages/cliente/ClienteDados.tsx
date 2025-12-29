import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export const ClienteDados = () => {
  const { user, cliente } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // TODO: Implementar salvamento no Supabase
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      {saved && (
        <Alert variant="info">
          ✓ Seus dados foram salvos com sucesso!
        </Alert>
      )}

      <Card>
        <CardTitle>Dados Pessoais</CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Nome Completo
            </label>
            <input
              type="text"
              defaultValue={user?.nome}
              disabled={!editing}
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

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              E-mail
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              disabled={!editing}
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
              disabled={!editing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Data de Nascimento
            </label>
            <input
              type="date"
              defaultValue={cliente?.data_nascimento || ''}
              disabled={!editing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              CEP
            </label>
            <input
              type="text"
              defaultValue={cliente?.cep || ''}
              disabled={!editing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block font-semibold text-text-primary mb-2 text-sm">
            Endereço
          </label>
          <input
            type="text"
            defaultValue={cliente?.endereco || ''}
            disabled={!editing}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Cidade
            </label>
            <input
              type="text"
              defaultValue={cliente?.cidade || ''}
              disabled={!editing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2 text-sm">
              Estado
            </label>
            <select
              defaultValue={cliente?.estado || ''}
              disabled={!editing}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm transition-all focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(13,181,166,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Selecione</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              {/* Add more states */}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              Editar Dados
            </Button>
          ) : (
            <>
              <Button onClick={handleSave}>
                Salvar Alterações
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
