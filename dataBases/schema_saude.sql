-- ============================================
-- AMÉM SAÚDE - SCHEMA SQL PARA SUPABASE (CORRIGIDO)
-- ============================================
-- IMPORTANTE: Execute este SQL completo de uma vez
-- Este script limpa e recria todo o banco de dados

-- ============================================
-- PASSO 1: LIMPAR TUDO (RESET COMPLETO)
-- ============================================
DROP TRIGGER IF EXISTS update_usuarios_timestamp ON usuarios;
DROP TRIGGER IF EXISTS update_empresas_timestamp ON empresas;
DROP TRIGGER IF EXISTS update_clientes_timestamp ON clientes;
DROP TRIGGER IF EXISTS update_especialidades_timestamp ON especialidades;
DROP TRIGGER IF EXISTS update_estabelecimentos_timestamp ON estabelecimentos;
DROP TRIGGER IF EXISTS update_agendamentos_timestamp ON agendamentos;
DROP TRIGGER IF EXISTS update_pagamentos_timestamp ON pagamentos;
DROP TRIGGER IF EXISTS update_reembolsos_timestamp ON reembolsos;
DROP TRIGGER IF EXISTS update_indicacoes_timestamp ON indicacoes;

DROP TABLE IF EXISTS logs_sistema CASCADE;
DROP TABLE IF EXISTS financeiro CASCADE;
DROP TABLE IF EXISTS notificacoes CASCADE;
DROP TABLE IF EXISTS indicacoes CASCADE;
DROP TABLE IF EXISTS guias CASCADE;
DROP TABLE IF EXISTS reembolsos CASCADE;
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS estabelecimentos CASCADE;
DROP TABLE IF EXISTS especialidades CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP FUNCTION IF EXISTS update_ultima_atualizacao() CASCADE;

-- ============================================
-- PASSO 2: CRIAR TABELAS
-- ============================================

-- USUÁRIOS (UUID compatível com Supabase Auth)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tipo_usuario VARCHAR(20) DEFAULT 'cliente' CHECK (tipo_usuario IN ('admin', 'tecnico', 'usuario', 'cliente')),
    telefone VARCHAR(20),
    avatar_url TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- EMPRESAS
CREATE TABLE empresas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    telefone VARCHAR(20),
    email VARCHAR(255),
    responsavel VARCHAR(200),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTES/BENEFICIÁRIOS
CREATE TABLE clientes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    tipo_pessoa VARCHAR(10) DEFAULT 'fisica' CHECK (tipo_pessoa IN ('fisica', 'juridica')),
    cnpj VARCHAR(18),
    razao_social VARCHAR(200),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    data_nascimento DATE,
    data_entrada DATE DEFAULT CURRENT_DATE,
    empresa_id BIGINT REFERENCES empresas(id),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- ESPECIALIDADES MÉDICAS
CREATE TABLE especialidades (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- ESTABELECIMENTOS DE SAÚDE
CREATE TABLE estabelecimentos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    endereco TEXT NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(10),
    telefone VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    especialidades INTEGER[] DEFAULT '{}',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- AGENDAMENTOS
CREATE TABLE agendamentos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    especialidade_id BIGINT NOT NULL REFERENCES especialidades(id),
    estabelecimento_id BIGINT REFERENCES estabelecimentos(id),
    data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
    data_agendamento TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'realizado', 'cancelado')),
    observacoes TEXT,
    valor_coparticipacao DECIMAL(10, 2) DEFAULT 25.00,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- PAGAMENTOS
CREATE TABLE pagamentos (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
    link_pagamento TEXT,
    data_pagamento TIMESTAMPTZ,
    forma_pagamento VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- REEMBOLSOS
CREATE TABLE reembolsos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('consulta', 'exame')),
    valor_solicitado DECIMAL(10, 2) NOT NULL,
    valor_aprovado DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado', 'pago')),
    data_solicitacao TIMESTAMPTZ DEFAULT NOW(),
    data_aprovacao TIMESTAMPTZ,
    data_pagamento TIMESTAMPTZ,
    observacoes TEXT,
    documentos JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- GUIAS DE ATENDIMENTO
CREATE TABLE guias (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('atendimento', 'exame')),
    numero_guia VARCHAR(50) UNIQUE NOT NULL,
    arquivo_url TEXT,
    data_emissao TIMESTAMPTZ DEFAULT NOW(),
    validade DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDICAÇÕES DE ESTABELECIMENTOS
CREATE TABLE indicacoes (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    nome_estabelecimento VARCHAR(200) NOT NULL,
    endereco TEXT NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    telefone VARCHAR(20),
    especialidades_oferecidas TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICAÇÕES
CREATE TABLE notificacoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'info' CHECK (tipo IN ('info', 'sucesso', 'alerta', 'erro')),
    lida BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FINANCEIRO (RECEITAS E DESPESAS)
CREATE TABLE financeiro (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_lancamento DATE DEFAULT CURRENT_DATE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOGS DO SISTEMA
CREATE TABLE logs_sistema (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    acao VARCHAR(200) NOT NULL,
    tabela VARCHAR(100),
    registro_id BIGINT,
    detalhes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASSO 3: CRIAR ÍNDICES
-- ============================================
CREATE INDEX idx_usuarios_auth_user ON usuarios(auth_user_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_clientes_usuario ON clientes(usuario_id);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_pagamentos_agendamento ON pagamentos(agendamento_id);
CREATE INDEX idx_reembolsos_cliente ON reembolsos(cliente_id);
CREATE INDEX idx_reembolsos_status ON reembolsos(status);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_data ON logs_sistema(created_at);
CREATE INDEX idx_estabelecimentos_cidade ON estabelecimentos(cidade, estado);

-- ============================================
-- PASSO 4: CRIAR FUNÇÃO DE ATUALIZAÇÃO
-- ============================================
CREATE OR REPLACE FUNCTION update_ultima_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASSO 5: CRIAR TRIGGERS
-- ============================================
CREATE TRIGGER update_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_empresas_timestamp
    BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_clientes_timestamp
    BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_especialidades_timestamp
    BEFORE UPDATE ON especialidades
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_estabelecimentos_timestamp
    BEFORE UPDATE ON estabelecimentos
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_agendamentos_timestamp
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_pagamentos_timestamp
    BEFORE UPDATE ON pagamentos
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_reembolsos_timestamp
    BEFORE UPDATE ON reembolsos
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_indicacoes_timestamp
    BEFORE UPDATE ON indicacoes
    FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

-- ============================================
-- PASSO 6: CRIAR FUNÇÃO PARA SINCRONIZAR USUÁRIO
-- ============================================
-- Função que cria registro na tabela usuarios quando um usuário se cadastra no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (auth_user_id, email, nome)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASSO 7: INSERIR DADOS INICIAIS
-- ============================================
INSERT INTO especialidades (nome, descricao, valor) VALUES
('Clínico Geral', 'Consulta com médico clínico geral', 150.00),
('Cardiologia', 'Consulta cardiológica', 250.00),
('Dermatologia', 'Consulta dermatológica', 200.00),
('Pediatria', 'Consulta pediátrica', 180.00),
('Ginecologia', 'Consulta ginecológica', 220.00),
('Ortopedia', 'Consulta ortopédica', 230.00),
('Oftalmologia', 'Consulta oftalmológica', 200.00),
('Psicologia', 'Consulta psicológica', 180.00),
('Nutrição', 'Consulta nutricional', 150.00),
('Fisioterapia', 'Sessão de fisioterapia', 120.00);

-- Inserir estabelecimentos de exemplo
INSERT INTO estabelecimentos (nome, endereco, cidade, estado, cep, telefone, especialidades) VALUES
('Clínica Saúde Plena', 'Rua das Flores, 123 - Centro', 'São Paulo', 'SP', '01234-567', '(11) 3000-0001', ARRAY[1,2,3,4,5]),
('Hospital São Lucas', 'Av. Principal, 456 - Zona Sul', 'São Paulo', 'SP', '04567-890', '(11) 3000-0002', ARRAY[1,2,3,4,5,6,7]),
('Policlínica Vida', 'Rua do Comércio, 789 - Zona Norte', 'São Paulo', 'SP', '02345-678', '(11) 3000-0003', ARRAY[1,3,4,8,9,10]);

-- ============================================
-- PASSO 8: CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES - USUÁRIOS
-- ============================================

-- Usuário pode ver seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados"
ON usuarios FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

-- Usuário pode atualizar seus próprios dados
CREATE POLICY "Usuários podem atualizar seus próprios dados"
ON usuarios FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id);

-- Admin pode ver todos os usuários
CREATE POLICY "Admin pode ver todos os usuários"
ON usuarios FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

-- ============================================
-- POLICIES - CLIENTES
-- ============================================

-- Cliente pode ver seus próprios dados
CREATE POLICY "Cliente vê seus próprios dados"
ON clientes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = clientes.usuario_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

-- Cliente pode atualizar seus próprios dados
CREATE POLICY "Cliente atualiza seus dados"
ON clientes FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = clientes.usuario_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

-- Admin pode ver todos os clientes
CREATE POLICY "Admin vê todos os clientes"
ON clientes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

-- Admin pode criar clientes
CREATE POLICY "Admin cria clientes"
ON clientes FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

-- ============================================
-- POLICIES - ESPECIALIDADES E ESTABELECIMENTOS
-- ============================================

-- Todos podem ver especialidades e estabelecimentos ativos
CREATE POLICY "Todos veem especialidades ativas"
ON especialidades FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Todos veem estabelecimentos ativos"
ON estabelecimentos FOR SELECT
TO authenticated
USING (ativo = true);

-- Admin pode gerenciar especialidades e estabelecimentos
CREATE POLICY "Admin gerencia especialidades"
ON especialidades FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

CREATE POLICY "Admin gerencia estabelecimentos"
ON estabelecimentos FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

-- ============================================
-- POLICIES - AGENDAMENTOS
-- ============================================

-- Cliente vê seus agendamentos
CREATE POLICY "Cliente vê seus agendamentos"
ON agendamentos FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM clientes
        JOIN usuarios ON usuarios.id = clientes.usuario_id
        WHERE clientes.id = agendamentos.cliente_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

-- Cliente cria agendamento
CREATE POLICY "Cliente cria agendamento"
ON agendamentos FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM clientes
        JOIN usuarios ON usuarios.id = clientes.usuario_id
        WHERE clientes.id = agendamentos.cliente_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

-- Admin vê todos os agendamentos
CREATE POLICY "Admin vê todos os agendamentos"
ON agendamentos FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

-- Admin atualiza agendamentos
CREATE POLICY "Admin atualiza agendamentos"
ON agendamentos FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

-- ============================================
-- POLICIES - NOTIFICAÇÕES
-- ============================================

-- Usuário vê suas notificações
CREATE POLICY "Usuário vê suas notificações"
ON notificacoes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = notificacoes.usuario_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

-- Usuário atualiza suas notificações
CREATE POLICY "Usuário atualiza suas notificações"
ON notificacoes FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = notificacoes.usuario_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

-- Sistema/Admin pode criar notificações
CREATE POLICY "Sistema cria notificações"
ON notificacoes FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- POLICIES - OUTRAS TABELAS
-- ============================================

-- Pagamentos, Reembolsos, Guias - Cliente vê os seus
CREATE POLICY "Cliente vê seus pagamentos"
ON pagamentos FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM agendamentos
        JOIN clientes ON clientes.id = agendamentos.cliente_id
        JOIN usuarios ON usuarios.id = clientes.usuario_id
        WHERE agendamentos.id = pagamentos.agendamento_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

CREATE POLICY "Cliente vê seus reembolsos"
ON reembolsos FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM clientes
        JOIN usuarios ON usuarios.id = clientes.usuario_id
        WHERE clientes.id = reembolsos.cliente_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

CREATE POLICY "Cliente vê suas guias"
ON guias FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM agendamentos
        JOIN clientes ON clientes.id = agendamentos.cliente_id
        JOIN usuarios ON usuarios.id = clientes.usuario_id
        WHERE agendamentos.id = guias.agendamento_id
        AND usuarios.auth_user_id = auth.uid()
    )
);

-- Admin vê tudo
CREATE POLICY "Admin vê todos os pagamentos"
ON pagamentos FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

CREATE POLICY "Admin vê todos os reembolsos"
ON reembolsos FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

CREATE POLICY "Admin vê todas as guias"
ON guias FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.auth_user_id = auth.uid()
        AND usuarios.tipo_usuario IN ('admin', 'tecnico')
    )
);

-- ============================================
-- PASSO 9: VERIFICAÇÃO
-- ============================================
-- Listar todas as tabelas criadas
SELECT
    'Tabela criada: ' || table_name as resultado
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Contar especialidades inseridas
SELECT
    'Total de especialidades: ' || COUNT(*)::text as resultado
FROM especialidades;

-- Contar estabelecimentos inseridos
SELECT
    'Total de estabelecimentos: ' || COUNT(*)::text as resultado
FROM estabelecimentos;

-- ============================================
-- PASSO 10: CRIAR USUÁRIO ADMIN INICIAL (OPCIONAL)
-- ============================================
-- Descomente as linhas abaixo para criar um usuário admin de teste
-- IMPORTANTE: Substitua 'seu-email@admin.com' e 'sua-senha-segura'

-- Primeiro, crie o usuário no Supabase Auth manualmente via dashboard
-- Depois execute:
/*
INSERT INTO usuarios (auth_user_id, email, nome, tipo_usuario)
VALUES (
    'cole-aqui-o-uuid-do-auth-user',
    'seu-email@admin.com',
    'Administrador',
    'admin'
);
*/