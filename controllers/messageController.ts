import { NextApiRequest, NextApiResponse } from 'next';
import { messageService } from '../services/messageService';

export async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { conversationId, content} = req.body;
    const responseContent = await generateResponse(content);
    const prompt = await messageService.createMessage(conversationId, content, "User");
    const message = await messageService.createMessage(conversationId, responseContent, "Bot");
    res.status(201).json({ prompt, message });
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

 async function generateResponse(userMessage: string): Promise<string> {
  try {
    const content = await messageService.getResponse(userMessage);
    return content;
  } catch (error) {
    console.error('Error getting response:', error);
    throw new Error('Failed to get response');
  }
}
