import { PrismaClient} from '@prisma/client';
import { Conversation , Message} from '@prisma/client/wasm';
const prisma = new PrismaClient();

export const conversationService = {
  async createConversation(userEmail: string): Promise<Conversation> {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          title: new Date().toISOString(),
          userEmail: userEmail,
        },
      });
      return conversation;
    } catch (error) {
      throw new Error(`Failed to create conversation: ${(error as Error).message}`);
    }
  },

  async getConversationsByUserEmail(userEmail: string): Promise<Conversation[]> {
    return prisma.conversation.findMany({
      where: {
        userEmail: userEmail,
      },
    });
  },

  async updateConversationTitle(conversationId: number, title: string): Promise<Conversation | null> {
    try {
      const updatedConversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          title: title
        },
      });
      return updatedConversation;
    } catch (error) {
      throw new Error(`Failed to update conversation title: ${(error as Error).message}`);
    }
  },

  async deleteConversation(conversationId: number): Promise<Conversation | null> {
    try {
      const messages = await prisma.message.findMany({
        where: { conversationId: conversationId },
      });
      for (const message of messages) {
        await prisma.message.delete({ where: { id: message.id } });
      }
      const deletedConversation = await prisma.conversation.delete({
        where: { id: conversationId },
      });
      return deletedConversation;
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${(error as Error).message}`);
    }
  },
};
