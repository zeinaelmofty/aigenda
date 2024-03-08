import { NextApiRequest, NextApiResponse } from 'next';
import { conversationService } from '../services/conversationService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export async function createConversation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.email) {
      throw new Error('User email not found in session');
    }
    const userEmail = session.user.email;
    const conversation = await conversationService.createConversation(userEmail);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getConversationsByUserEmail(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.email) {
      throw new Error('User email not found in session');
    }
    const userEmail = session.user.email;
    const conversations = await conversationService.getConversationsByUserEmail(userEmail);
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}


export async function updateConversationTitle(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, title } = req.body;
    const updatedConversation = await conversationService.updateConversationTitle(id, title);
    if (updatedConversation) {
      res.status(200).json(updatedConversation);
    } else {
      res.status(404).json({ message: 'Conversation not found' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function deleteConversation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (typeof id !== 'string') {
      throw new Error('Invalid conversation id');
    }
    const conversationId = parseInt(id, 10);
    const deletedConversation = await conversationService.deleteConversation(conversationId);
    if (deletedConversation) {
      res.status(200).json(deletedConversation);
    } else {
      res.status(404).json({ message: 'Conversation not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
}
