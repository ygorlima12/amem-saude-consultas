-- Banco de Dados: Sistema Amém Saúde Consultas (PostgreSQL/Supabase)
-- Schema completo para gestão de consultas, clientes e estabelecimentos

-- ============================================
-- TABELA DE USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) DEFAULT 'cliente' CHECK (tipo_usuario IN ('admin', 'tecnico', 'usuario', 'cliente')),
    telefone VARCHAR(20),
    avatar_url TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE EMPRESAS PARCEIRAS
-- ============================================
CREATE TABLE IF NOT EXISTS empresas (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE CLIENTES/BENEFICIÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE ESPECIALIDADES MÉDICAS
-- ============================================
CREATE TABLE IF NOT EXISTS especialidades (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE ESTABELECIMENTOS DE SAÚDE
-- ============================================
CREATE TABLE IF NOT EXISTS estabelecimentos (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE AGENDAMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS agendamentos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    especialidade_id BIGINT NOT NULL REFERENCES especialidades(id),
    estabelecimento_id BIGINT NOT NULL REFERENCES estabelecimentos(id),
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_agendamento TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'realizado', 'cancelado')),
    observacoes TEXT,
    valor_coparticipacao DECIMAL(10, 2) DEFAULT 25.00,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE PAGAMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
    link_pagamento TEXT,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    forma_pagamento VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE REEMBOLSOS
-- ============================================
CREATE TABLE IF NOT EXISTS reembolsos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('consulta', 'exame')),
    valor_solicitado DECIMAL(10, 2) NOT NULL,
    valor_aprovado DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado', 'pago')),
    data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    documentos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE GUIAS DE ATENDIMENTO
-- ============================================
CREATE TABLE IF NOT EXISTS guias (
    id BIGSERIAL PRIMARY KEY,
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('atendimento', 'exame')),
    numero_guia VARCHAR(50) UNIQUE NOT NULL,
    arquivo_url TEXT,
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    validade DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE INDICAÇÕES DE ESTABELECIMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS indicacoes (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE NOTIFICAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS notificacoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'info' CHECK (tipo IN ('info', 'sucesso', 'alerta', 'erro')),
    lida BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA FINANCEIRO (RECEITAS E DESPESAS)
-- ============================================
CREATE TABLE IF NOT EXISTS financeiro (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data_lancamento DATE DEFAULT CURRENT_DATE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA DE LOGS DO SISTEMA
-- ============================================
CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id),
    acao VARCHAR(200) NOT NULL,
    tabela VARCHAR(100),
    registro_id BIGINT,
    detalhes JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clientes_usuario ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendamento ON pagamentos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_cliente ON reembolsos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reembolsos_status ON reembolsos(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_data ON logs_sistema(created_at);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_cidade ON estabelecimentos(cidade, estado);

-- ============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================
CREATE OR REPLACE FUNCTION update_ultima_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_timestamp BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_empresas_timestamp BEFORE UPDATE ON empresas
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_clientes_timestamp BEFORE UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_especialidades_timestamp BEFORE UPDATE ON especialidades
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_estabelecimentos_timestamp BEFORE UPDATE ON estabelecimentos
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_agendamentos_timestamp BEFORE UPDATE ON agendamentos
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_pagamentos_timestamp BEFORE UPDATE ON pagamentos
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_reembolsos_timestamp BEFORE UPDATE ON reembolsos
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

CREATE TRIGGER update_indicacoes_timestamp BEFORE UPDATE ON indicacoes
FOR EACH ROW EXECUTE FUNCTION update_ultima_atualizacao();

-- ============================================
-- DADOS INICIAIS - ESPECIALIDADES
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
('Fisioterapia', 'Sessão de fisioterapia', 120.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
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

-- Políticas para clientes (podem ver apenas seus próprios dados)
CREATE POLICY "Clientes podem ver seus próprios dados" ON clientes
FOR SELECT USING (usuario_id = auth.uid()::bigint);

CREATE POLICY "Clientes podem atualizar seus próprios dados" ON clientes
FOR UPDATE USING (usuario_id = auth.uid()::bigint);

-- Políticas para agendamentos
CREATE POLICY "Clientes podem ver seus agendamentos" ON agendamentos
FOR SELECT USING (
    cliente_id IN (SELECT id FROM clientes WHERE usuario_id = auth.uid()::bigint)
);

CREATE POLICY "Clientes podem criar agendamentos" ON agendamentos
FOR INSERT WITH CHECK (
    cliente_id IN (SELECT id FROM clientes WHERE usuario_id = auth.uid()::bigint)
);

-- Políticas para reembolsos
CREATE POLICY "Clientes podem ver seus reembolsos" ON reembolsos
FOR SELECT USING (
    cliente_id IN (SELECT id FROM clientes WHERE usuario_id = auth.uid()::bigint)
);

CREATE POLICY "Clientes podem criar reembolsos" ON reembolsos
FOR INSERT WITH CHECK (
    cliente_id IN (SELECT id FROM clientes WHERE usuario_id = auth.uid()::bigint)
);

-- Políticas para notificações
CREATE POLICY "Usuários podem ver suas notificações" ON notificacoes
FOR SELECT USING (usuario_id = auth.uid()::bigint);

CREATE POLICY "Usuários podem atualizar suas notificações" ON notificacoes
FOR UPDATE USING (usuario_id = auth.uid()::bigint);

-- Políticas para leitura pública (especialidades e estabelecimentos)
CREATE POLICY "Todos podem ver especialidades ativas" ON especialidades
FOR SELECT USING (ativo = true);

CREATE POLICY "Todos podem ver estabelecimentos ativos" ON estabelecimentos
FOR SELECT USING (ativo = true);

-- Políticas para admins (acesso total)
CREATE POLICY "Admins têm acesso total a clientes" ON clientes
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid()::bigint
        AND tipo_usuario IN ('admin', 'tecnico')
    )
);

CREATE POLICY "Admins têm acesso total a agendamentos" ON agendamentos
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid()::bigint
        AND tipo_usuario IN ('admin', 'tecnico')
    )
);

CREATE POLICY "Admins têm acesso total a reembolsos" ON reembolsos
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid()::bigint
        AND tipo_usuario IN ('admin', 'tecnico')
    )
);

CREATE POLICY "Admins têm acesso total a financeiro" ON financeiro
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid()::bigint
        AND tipo_usuario IN ('admin', 'tecnico')
    )
);
