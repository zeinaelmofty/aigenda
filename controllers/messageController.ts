import { NextApiRequest, NextApiResponse } from 'next';
import { messageService } from '../services/messageService';

import { Message as VercelChatMessage, StreamingTextResponse } from "ai";
import { Message } from "../components/ChatContainer";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
export const runtime = "edge";

const formatMessage = (message: Message) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `I will ask you questions about event planning. All responses must be related to this context to help me throughout my event planning. If I ask you about anything else please guide me back to the conversation context only.

Current conversation:
{chat_history}

User: {input}
AI:`;
/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { conversationId, content, messages } = req.body;
    const responseContent = await generateResponse(messages, content);
    if (typeof responseContent === 'string') {
      const newMessages = [...messages, { role: "User", content: content }];
      const prompt = await messageService.createMessage(conversationId, content, "User");
      const botMessage = await messageService.createMessage(conversationId, responseContent, "assistant");
      newMessages.push({ role: "assistant", content: responseContent });
      res.status(201).json({ prompt, message: botMessage, messages: newMessages });
    } else {
      res.status(500).json({ error: responseContent.error });
    }
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
async function generateResponse(messages: Message[], currentMessageContent: string): Promise<string | { error: string }> {
  try {
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-3.5-turbo-1106",
    });

    const outputParser = new HttpResponseOutputParser();

    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    let response = '';
    for await (const chunk of stream) {
      // Convert ASCII codes to characters
      response += String.fromCharCode(...chunk);
    }

    return response;
  } catch (error) {
    const errorMessage = (error as Error).message;
    return { error: errorMessage };
  }
}

// // async function POST(req: NextApiRequest) {
// //   try {
// //     const body = await req.json();
// //     const messages = body.messages ?? [];
// //     const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
// //     const currentMessageContent = messages[messages.length - 1].content;
// //     const prompt = PromptTemplate.fromTemplate(TEMPLATE);

// //     /**
// //      * You can also try e.g.:
// //      *
// //      * import { ChatAnthropic } from "langchain/chat_models/anthropic";
// //      * const model = new ChatAnthropic({});
// //      *
// //      * See a full list of supported models at:
// //      * https://js.langchain.com/docs/modules/model_io/models/
// //      */
// //     const model = new ChatOpenAI({
// //       temperature: 0.8,
// //       modelName: "gpt-3.5-turbo-1106",
// //     });

// //     /**
// //      * Chat models stream message chunks rather than bytes, so this
// //      * output parser handles serialization and byte-encoding.
// //      */
// //     const outputParser = new HttpResponseOutputParser();

// //     /**
// //      * Can also initialize as:
// //      *
// //      * import { RunnableSequence } from "@langchain/core/runnables";
// //      * const chain = RunnableSequence.from([prompt, model, outputParser]);
// //      */
// //     const chain = prompt.pipe(model).pipe(outputParser);

// //     const stream = await chain.stream({
// //       chat_history: formattedPreviousMessages.join("\n"),
// //       input: currentMessageContent,
// //     });

// //     return new StreamingTextResponse(stream);
// //   } catch (e: any) {
// //     return NextApiResponse.json({ error: e.message }, { status: e.status ?? 500 });
// //   }

// //  async function generateResponse(userMessage: string): Promise<string> {
// //   try {
// //     const content = await messageService.getResponse(userMessage);
// //     return content;
// //   } catch (error) {
// //     console.error('Error getting response:', error);
// //     throw new Error('Failed to get response');
// //   }
// // }