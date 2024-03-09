import { PrismaClient } from '@prisma/client';
import { Message } from '@prisma/client/wasm';

const prisma = new PrismaClient();

export const messageService = {
  async createMessage(conversationId: number, content: string , sender: string): Promise<Message> {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: conversationId,
          content: content,
          sender: sender as any, 
        },
      });
      console.log(message);
      return message;
    } catch (error) {
      throw new Error(`Failed to create message: ${(error as Error).message}`);
    }
  },

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId: conversationId,
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
      return messages;
    } catch (error) {
      throw new Error('Failed to fetch messages by conversation ID');
    }
  },
};
