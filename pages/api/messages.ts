import { NextApiRequest, NextApiResponse } from 'next';
import {
  createMessage,
  getMessages,
} from '../../backend/app-layer/controllers/messageController';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      const { content, question } = req.body;
      if (content) {
        await createMessage(req, res);
      } else {
        await getMessages(req, res);
      }
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
