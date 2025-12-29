import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import { formatCPF, formatPhone, formatCEP } from '@/utils/format'

export const ClientePerfil = () => {
  const { user, cliente } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    endereco: cliente?.endereco || '',
    cidade: cliente?.cidade || '',
    estado: cliente?.estado || '',
    cep: cliente?.cep || '',
  })

  const handleSave = () => {
    // Aqui você chamaria o serviço de atualização
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={48} className="text-primary-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{user?.nome}</h2>
            <p className="text-gray-600">{user?.email}</p>
            {cliente && (
              <p className="text-sm text-gray-500 mt-1">
                CPF: {formatCPF(cliente.cpf)}
              </p>
            )}
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </div>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader title="Informações Pessoais" />
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              disabled={!isEditing}
              icon={<User size={18} />}
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              icon={<Mail size={18} />}
            />

            <Input
              label="Telefone"
              value={formatPhone(formData.telefone)}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              disabled={!isEditing}
              icon={<Phone size={18} />}
            />

            <Input
              label="Data de Nascimento"
              type="date"
              value={cliente?.data_nascimento || ''}
              disabled={!isEditing}
              icon={<Calendar size={18} />}
            />
          </div>
        </form>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader title="Endereço" />
        <form className="space-y-4">
          <Input
            label="CEP"
            value={formatCEP(formData.cep)}
            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
            disabled={!isEditing}
          />

          <Input
            label="Endereço"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            disabled={!isEditing}
            icon={<MapPin size={18} />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cidade"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              disabled={!isEditing}
            />

            <Input
              label="Estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              disabled={!isEditing}
              maxLength={2}
            />
          </div>
        </form>
      </Card>

      {isEditing && (
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      )}
    </div>
  )
}
