# Amém Saúde - Portal de Consultas

Sistema completo de gerenciamento de consultas médicas com portal para clientes e sistema administrativo interno, desenvolvido com React, TypeScript e Supabase.

## 🚀 Tecnologias

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Backend:** Supabase (PostgreSQL + Auth)
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Charts:** Chart.js + React-Chartjs-2

## 📋 Funcionalidades

### Portal do Cliente
- ✅ Cadastro e autenticação de clientes
- ✅ Dashboard com visão geral
- ✅ Agendamento de consultas
- ✅ Gestão de pagamentos (coparticipação)
- ✅ Solicitação de reembolsos
- ✅ Gerenciamento de perfil
- ✅ Notificações em tempo real

### Sistema Administrativo
- ✅ Dashboard com métricas e estatísticas
- ✅ Gerenciamento de clientes/beneficiários
- ✅ Controle de agendamentos
- ✅ Gestão de reembolsos
- ✅ Controle financeiro
- ✅ Cadastro de estabelecimentos de saúde
- ✅ Cadastro de especialidades médicas
- ✅ Sistema de logs e auditoria

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos

- Node.js 18+ e npm/yarn
- Conta no Supabase

### 2. Clone o repositório

```bash
git clone <seu-repositorio>
cd amem-saude-consultas
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o Supabase

#### 4.1. Crie um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização e projeto
3. Copie a URL e a Anon Key do projeto

#### 4.2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione suas credenciais:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

#### 4.3. Execute o schema SQL no Supabase

1. Acesse o SQL Editor no Supabase Dashboard
2. Execute o arquivo `dataBases/schema_saude.sql`

Ou via CLI do Supabase:

```bash
supabase db reset
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
amem-saude-consultas/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de UI reutilizáveis
│   │   ├── cliente/        # Componentes do portal do cliente
│   │   └── admin/          # Componentes do sistema administrativo
│   ├── pages/              # Páginas principais
│   │   ├── auth/           # Login e cadastro
│   │   ├── cliente/        # Portal do cliente
│   │   └── admin/          # Sistema administrativo
│   ├── services/           # Serviços de API e Supabase
│   ├── hooks/              # Custom hooks
│   ├── types/              # TypeScript types
│   ├── utils/              # Funções utilitárias
│   └── config/             # Configurações
├── dataBases/              # Schemas SQL
│   └── schema_saude.sql    # Schema principal do banco
├── public/                 # Arquivos públicos
└── [arquivos de config]    # Vite, TS, Tailwind, etc.
```

## 🔐 Autenticação e Permissões

O sistema possui 4 tipos de usuários:

- **cliente**: Acesso ao portal do cliente
- **usuario**: Acesso básico ao sistema
- **tecnico**: Acesso ao sistema administrativo
- **admin**: Acesso total ao sistema

### Row Level Security (RLS)

O banco de dados usa RLS do Supabase para garantir que:
- Clientes só vejam seus próprios dados
- Admins e técnicos tenham acesso total
- Dados sensíveis sejam protegidos

## 💳 Sistema de Pagamentos

- **Coparticipação fixa:** R$ 25,00 por consulta
- **Limite mensal:** R$ 400,00 por beneficiário
- **Integração com gateway:** Preparado para integração com Stripe, PagSeguro, etc.

## 📊 Banco de Dados

### Principais Tabelas

- `usuarios` - Usuários do sistema
- `clientes` - Dados dos beneficiários
- `empresas` - Empresas parceiras
- `especialidades` - Especialidades médicas
- `estabelecimentos` - Estabelecimentos de saúde
- `agendamentos` - Consultas agendadas
- `pagamentos` - Pagamentos de coparticipação
- `reembolsos` - Solicitações de reembolso
- `guias` - Guias de atendimento
- `notificacoes` - Notificações do sistema
- `financeiro` - Controle financeiro
- `logs_sistema` - Logs de auditoria

## 🚀 Deploy

### Build para produção

```bash
npm run build
```

Os arquivos compilados estarão em `dist/`

### Deploy sugerido

- **Frontend:** Vercel, Netlify ou Cloudflare Pages
- **Backend:** Supabase (já configurado)
- **Storage:** Supabase Storage (para uploads)

## 📝 Próximos Passos

- [ ] Integração com gateway de pagamento real
- [ ] Sistema de envio de emails (Resend, SendGrid)
- [ ] Upload de documentos/anexos
- [ ] Geração de PDF para guias
- [ ] Notificações por SMS (Twilio)
- [ ] Dashboard com gráficos avançados (Chart.js)
- [ ] Relatórios exportáveis (Excel, PDF)
- [ ] Aplicativo mobile (React Native)

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e confidencial.

## 👥 Suporte

Para suporte, entre em contato através do email: suporte@amemsaude.com.br

---

Desenvolvido com ❤️ pela equipe Amém Saúde
