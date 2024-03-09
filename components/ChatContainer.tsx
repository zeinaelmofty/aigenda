import React, { useState, useEffect, useRef } from "react";
import Input from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useSession } from "next-auth/react";

export interface Message {
  id: number;
  role: string;
  content: string;
}

interface Props {
  selectedChatId: number | null;
}

const ChatContainer: React.FC<Props> = ({ selectedChatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (selectedChatId !== null) {
          const response = await fetch(`/api/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ conversationId: selectedChatId }),
          });
          if (response.ok) {
            const data: Message[] = await response.json();
            setMessages(data);
            setLoading(false);
          } else {
            setMessages([]);
            setLoading(false);
          }
        } else {
          setMessages([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async () => {
    try {
      if (!newMessageText.trim() || !selectedChatId) return;
  
      const response = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId: selectedChatId, content: newMessageText, messages: messages }),
      });
  
      if (response.ok) {
        const { prompt, message } = await response.json();
        setMessages([...messages, prompt, message]);
        setNewMessageText('');
      } else {
        console.error('Failed to send user message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <main className="flex-1 bg-gray-200 dark:bg-gray-800 p-4">
      <h1 className="text-2xl font-semibold">AI-genda Chatbot</h1>
      <div className="mt-4 bg-white dark:bg-gray-700 p-4 rounded-md h-[calc(100vh-150px)] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <div className="w-full">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                {selectedChatId ? "No messages" : "Start a new Chat by pressing +"}
              </p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2">
                  <p className="font-semibold">
                    {message.role === 'User' ? (session && session.user ? session.user.name : 'Anonymous') : 'Bot'}
                  </p>
                  <p>{message.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {selectedChatId && (
        <div className="mt-4">
          <form className="flex gap-2 items-center" onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}>
            <Input
              className="flex-1"
              placeholder="Type your message..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              style={{
                marginRight: '8px',
                borderRadius: '4px',
                backgroundColor: '#FFFFFF',
                color: '#333333',
                height: '50px',
                borderColor: '#555555'
              }}
              InputProps={{
                style: { borderRadius: '4px', height: '100%' }
              }}
            />
            <button
              type="submit"
              className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md cursor-pointer mt-2 ext-lg font-semibold flex items-center"
              style={{
                height: '50px'
              }}
              disabled={!newMessageText.trim()} 
            >
              Send
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

export default ChatContainer;
