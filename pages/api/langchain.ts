// import { NextApiRequest, NextApiResponse } from 'next';
// import OpenAI, { CompletionCreateParamsNonStreaming } from 'openai';

// const openaiApiKey = process.env.OPENAI_API_KEY; 
// const openaiClient = new OpenAI({ apiKey: openaiApiKey });

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     try {
//       const userPrompt = "I need your help in planning an event. I will ask you questions regarding this topic, please keep your answers restricted to this topic only okay?";
//       const botInitialResponse = await openaiClient.completions.create({
//         model: "gpt-4", 
//         prompt: userPrompt,
//       } as CompletionCreateParamsNonStreaming);

//       const initialBotResponse = botInitialResponse.choices[0].text;

//       res.status(200).json({ response: initialBotResponse });

//       const { message } = req.body;

//       const gptResponse = await openaiClient.completions.create({
//         model: "gpt-4", 
//         messages: [{ sender: 'user', content: message }],
//       } as CompletionCreateParamsNonStreaming);
      
//       const finalBotResponse = gptResponse.choices[0].text;

//       res.status(200).json({ response: finalBotResponse });
//     } catch (error) {
//       console.error('Error processing message:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   } else {
//     res.status(405).end(); 
//   }
// }
