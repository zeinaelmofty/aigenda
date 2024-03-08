import { NextApiRequest, NextApiResponse } from 'next';
import { messageService } from '../services/messageService';

export async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { conversationId, content , sender } = req.body;
    const message = await messageService.createMessage(conversationId, content , sender);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getMessages(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { conversationId } = req.body;
    if (!conversationId || typeof conversationId !== 'number') {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    const messages = await messageService.getMessagesByConversationId(conversationId);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

export async function query(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userMessage } = req.body;
    const content = await messageService.getResponse(userMessage);
    res.status(200).json({ content });
  } catch (error) {
    console.error('Error getting response:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
}
