import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../db/supabase';
import crypto from 'crypto';

const router = Router();

// Generate share link
router.post('/documents/:id/share', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id: documentId } = req.params;
    const { userId } = req;
    const { role = 'viewer', expiresInDays } = req.body;

    // Check if user has permission to share
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.owner_id !== userId) {
      const { data: permission } = await supabaseAdmin
        .from('document_permissions')
        .select('role')
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .in('role', ['owner', 'editor'])
        .single();

      if (!permission) {
        return res.status(403).json({ error: 'Insufficient permissions to share' });
      }
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration
    let expiresAt = null;
    if (expiresInDays) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expiresInDays);
      expiresAt = expireDate.toISOString();
    }

    // Create share record
    const { data: share, error } = await supabaseAdmin
      .from('document_shares')
      .insert({
        document_id: documentId,
        token,
        role,
        created_by: userId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;

    const shareLink = `${process.env.FRONTEND_URL}/join/${token}`;

    res.json({ share, link: shareLink });
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// Join document via token
router.get('/join/:token', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;
    const { userId } = req;

    // Find valid share token
    const { data: share, error } = await supabaseAdmin
      .from('document_shares')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !share) {
      return res.status(404).json({ error: 'Invalid or expired share link' });
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Share link has expired' });
    }

    // Add user to document permissions
    const { error: permError } = await supabaseAdmin
      .from('document_permissions')
      .upsert({
        document_id: share.document_id,
        user_id: userId,
        role: share.role,
      }, {
        onConflict: 'document_id,user_id',
      });

    if (permError) throw permError;

    // Mark share as used
    await supabaseAdmin
      .from('document_shares')
      .update({
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', share.id);

    res.json({
      documentId: share.document_id,
      role: share.role,
    });
  } catch (error) {
    console.error('Error joining document:', error);
    res.status(500).json({ error: 'Failed to join document' });
  }
});

// Get collaborators
router.get('/documents/:id/collaborators', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id: documentId } = req.params;
    const { userId } = req;

    // Check if user has access
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.owner_id !== userId) {
      const { data: access } = await supabaseAdmin
        .from('document_permissions')
        .select('role')
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .single();

      if (!access) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get all collaborators
    const { data: permissions, error } = await supabaseAdmin
      .from('document_permissions')
      .select('user_id, role, created_at')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get user emails from auth
    const collaborators = await Promise.all(
      (permissions || []).map(async (p: any) => {
        try {
          const { data } = await supabaseAdmin.auth.admin.getUserById(p.user_id);
          return {
            id: p.user_id,
            email: data.user?.email || 'Unknown',
            role: p.role,
            created_at: p.created_at,
          };
        } catch {
          return {
            id: p.user_id,
            email: 'Unknown',
            role: p.role,
            created_at: p.created_at,
          };
        }
      })
    );

    res.json({ collaborators });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// Remove collaborator
router.delete('/documents/:id/collaborators/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id: documentId, userId: targetUserId } = req.params;
    const { userId } = req;

    // Only owner can remove collaborators
    const { data: document } = await supabaseAdmin
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (!document || document.owner_id !== userId) {
      return res.status(403).json({ error: 'Only owner can remove collaborators' });
    }

    // Cannot remove owner
    if (targetUserId === document.owner_id) {
      return res.status(400).json({ error: 'Cannot remove owner' });
    }

    // Remove permission
    const { error } = await supabaseAdmin
      .from('document_permissions')
      .delete()
      .eq('document_id', documentId)
      .eq('user_id', targetUserId);

    if (error) throw error;

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

export default router;
