-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document permissions
CREATE TABLE IF NOT EXISTS document_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, user_id)
);

-- Share tokens for invite links
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('editor', 'viewer')),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for compliance
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_permissions_document ON document_permissions(document_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user ON document_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON document_shares(token);
CREATE INDEX IF NOT EXISTS idx_shares_document ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_comments_document ON comments(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_document ON audit_log(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Documents: Users can see documents they own or have permission to access
CREATE POLICY "Users can view own documents or shared documents"
  ON documents FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT document_id FROM document_permissions 
      WHERE user_id = auth.uid()
    )
  );

-- Documents: Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Documents: Users can update documents they own or have editor permission
CREATE POLICY "Users can update own or editor documents"
  ON documents FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT document_id FROM document_permissions 
      WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    )
  );

-- Documents: Only owners can delete
CREATE POLICY "Only owners can delete documents"
  ON documents FOR DELETE
  USING (owner_id = auth.uid());

-- Permissions: Users can view permissions for documents they have access to
CREATE POLICY "Users can view permissions for accessible documents"
  ON document_permissions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE owner_id = auth.uid() OR
      id IN (SELECT document_id FROM document_permissions WHERE user_id = auth.uid())
    )
  );

-- Permissions: Only owners can manage permissions
CREATE POLICY "Only owners can manage permissions"
  ON document_permissions FOR ALL
  USING (
    document_id IN (SELECT id FROM documents WHERE owner_id = auth.uid())
  );
