-- Banco de Dados: Sistema de Chamados (PostgreSQL)
-- Criação das tabelas principais

-- Tabela de Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    departamento VARCHAR(50),
    cargo VARCHAR(50),
    tipo_usuario VARCHAR(20) DEFAULT 'usuario' CHECK (tipo_usuario IN ('admin', 'tecnico', 'usuario')),
    ativo BOOLEAN DEFAULT TRUE,
    foto_perfil VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias de Chamados
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(50),
    cor VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Prioridades
CREATE TABLE prioridades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    nivel INT NOT NULL,
    cor VARCHAR(20),
    tempo_resposta_horas INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Status
CREATE TABLE status_chamados (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    cor VARCHAR(20),
    ordem INT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Chamados
CREATE TABLE chamados (
    id SERIAL PRIMARY KEY,
    numero_chamado VARCHAR(20) UNIQUE NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    prioridade_id INT NOT NULL,
    status_id INT NOT NULL,
    tecnico_responsavel_id INT,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_prazo TIMESTAMP,
    data_fechamento TIMESTAMP,
    tempo_resposta_minutos INT,
    tempo_resolucao_minutos INT,
    avaliacao INT CHECK (avaliacao BETWEEN 1 AND 5),
    comentario_avaliacao TEXT,
    data_avaliacao TIMESTAMP,
    anexos JSONB,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (prioridade_id) REFERENCES prioridades(id),
    FOREIGN KEY (status_id) REFERENCES status_chamados(id),
    FOREIGN KEY (tecnico_responsavel_id) REFERENCES usuarios(id)
);

-- Tabela de Histórico de Chamados
CREATE TABLE historico_chamados (
    id SERIAL PRIMARY KEY,
    chamado_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo_acao VARCHAR(50) NOT NULL CHECK (tipo_acao IN ('comentario', 'alteracao_status', 'atribuicao', 'anexo', 'outros')),
    descricao TEXT NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Comentários
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    chamado_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario TEXT NOT NULL,
    interno BOOLEAN DEFAULT FALSE,
    anexos JSONB,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Base de Conhecimento
CREATE TABLE base_conhecimento (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    categoria_id INT,
    tags JSONB,
    autor_id INT NOT NULL,
    visualizacoes INT DEFAULT 0,
    util INT DEFAULT 0,
    nao_util INT DEFAULT 0,
    publicado BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
);

-- Tabela de Anexos
CREATE TABLE anexos (
    id SERIAL PRIMARY KEY,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(50),
    tamanho_bytes BIGINT,
    caminho_arquivo VARCHAR(500) NOT NULL,
    relacionado_tipo VARCHAR(50) NOT NULL CHECK (relacionado_tipo IN ('chamado', 'comentario', 'conhecimento')),
    relacionado_id INT NOT NULL,
    usuario_upload_id INT NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_upload_id) REFERENCES usuarios(id)
);

-- Tabela de Notificações
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    link VARCHAR(255),
    lida BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_leitura TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela de Configurações do Sistema
CREATE TABLE configuracoes (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(50),
    descricao TEXT,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs do Sistema
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INT,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(50),
    registro_id INT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    detalhes JSONB,
    data_acao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices para melhor performance
CREATE INDEX idx_chamados_usuario ON chamados(usuario_id);
CREATE INDEX idx_chamados_status ON chamados(status_id);
CREATE INDEX idx_chamados_tecnico ON chamados(tecnico_responsavel_id);
CREATE INDEX idx_chamados_data ON chamados(data_abertura);
CREATE INDEX idx_historico_chamado ON historico_chamados(chamado_id);
CREATE INDEX idx_comentarios_chamado ON comentarios(chamado_id);
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_logs_usuario ON logs_sistema(usuario_id);
CREATE INDEX idx_logs_data ON logs_sistema(data_acao);

-- Trigger para atualizar ultima_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_conhecimento_updated_at BEFORE UPDATE ON base_conhecimento
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();