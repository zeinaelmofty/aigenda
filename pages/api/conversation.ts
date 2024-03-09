import { NextApiRequest, NextApiResponse } from 'next';
import {
  getConversationsByUserEmail,
  updateConversationTitle,
  deleteConversation,
  createConversation 
} from '../../backend/app-layer/controllers/conversationController';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      await getConversationsByUserEmail(req, res);
      break;
    case 'POST': 
      await createConversation(req, res); 
      break;
    case 'PUT':
      await updateConversationTitle(req, res);
      break;
    case 'DELETE':
      await deleteConversation(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
