import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../db/supabase';
import { createDocumentLimiter } from '../middleware/rateLimit';

const router = Router();

// Get all documents for user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req;

    // Query documents where user is owner or has permissions
    const { data: ownedDocs, error: ownedError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    if (ownedError) throw ownedError;

    // Get shared documents
    const { data: sharedPerms, error: sharedError } = await supabaseAdmin
      .from('document_permissions')
      .select('document_id, role')
      .eq('user_id', userId)
      .neq('role', 'owner');

    if (sharedError) throw sharedError;

    let sharedDocs: any[] = [];
    if (sharedPerms && sharedPerms.length > 0) {
      const sharedDocIds = sharedPerms.map((p: any) => p.document_id);
      const { data, error } = await supabaseAdmin
        .from('documents')
        .select('*')
        .in('id', sharedDocIds)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        sharedDocs = data.map((doc: any) => ({
          ...doc,
          user_role: sharedPerms.find((p: any) => p.document_id === doc.id)?.role,
        }));
      }
    }

    const ownedWithRole = (ownedDocs || []).map((doc: any) => ({
      ...doc,
      user_role: 'owner',
    }));

    const documents = [...ownedWithRole, ...sharedDocs];

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get single document
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Get document
    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check permission
    const { data: permission } = await supabaseAdmin
      .from('document_permissions')
      .select('role')
      .eq('document_id', id)
      .eq('user_id', userId)
      .single();

    if (!permission && document.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userRole = document.owner_id === userId ? 'owner' : permission?.role;

    res.json({ document: { ...document, user_role: userRole } });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create document
router.post('/', requireAuth, createDocumentLimiter, async (req: AuthRequest, res) => {
  try {
    const { title = 'Untitled Document', content = '' } = req.body;
    const { userId } = req;

    // Create document
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .insert({
        title,
        content,
        owner_id: userId,
      })
      .select()
      .single();

    if (docError || !document) throw docError;

    // Create owner permission
    const { error: permError } = await supabaseAdmin
      .from('document_permissions')
      .insert({
        document_id: document.id,
        user_id: userId,
        role: 'owner',
      });

    if (permError) throw permError;

    res.status(201).json({ document: { ...document, user_role: 'owner' } });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Update document
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const { userId } = req;

    // Check edit permission
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.owner_id !== userId) {
      const { data: permission } = await supabaseAdmin
        .from('document_permissions')
        .select('role')
        .eq('document_id', id)
        .eq('user_id', userId)
        .in('role', ['owner', 'editor'])
        .single();

      if (!permission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    // Update document
    const { data: updatedDoc, error } = await supabaseAdmin
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ document: updatedDoc });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Only owner can delete
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!document || document.owner_id !== userId) {
      return res.status(403).json({ error: 'Only owner can delete document' });
    }

    // Delete document (cascades to permissions and shares)
    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
