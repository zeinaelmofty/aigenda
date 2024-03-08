import React, { useState, useEffect } from "react";
import Input from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { useSession } from "next-auth/react";

interface Message {
  id: number;
  sender: string;
  content: string;
}

interface Props {
  selectedChatId: number | null;
}

const ChatContainer: React.FC<Props> = ({ selectedChatId}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session} = useSession();

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
    if (selectedChatId === null) {
      setMessages([]);
    }
  }, [selectedChatId]);

  const sendMessage = async () => {
    try {
      if (!newMessageText.trim() || !selectedChatId) return;

      const userMessageResponse = await fetch(`/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId: selectedChatId, content: newMessageText , sender : "User"}),
      });

      if (userMessageResponse.ok) {
        const userMessage: Message = await userMessageResponse.json();

        const botResponse = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userMessage: newMessageText }),
        });

        if (botResponse.ok) {
          const botMessage: Message = await botResponse.json();
          setMessages(prevMessages => [...prevMessages, userMessage, botMessage]);
          setNewMessageText('');
        } else {
          console.error('Failed to get bot response');
        }
      } else {
        console.error('Failed to send user message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (selectedChatId === null) {
      setMessages([]);
    }
  }, [selectedChatId]);

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
              <p className="text-center text-gray-500 dark:text-gray-400">No messages</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-2">
                  <p className="font-semibold">{message.sender === 'User' ? (session && session.user ? session.user.name : 'Anonymous') : 'Bot'}</p>
                  <p>{message.content}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
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
            className="flex justify-center items-center bg-gray-400 dark:bg-gray-700 p-2 rounded-md cursor-pointer mt-2 ext-lg font-semibold flex items-center"
            style={{
              height: '50px',
              opacity: newMessageText.trim() ? 1 : 0.5, // Set opacity based on newMessageText
              pointerEvents: newMessageText.trim() ? 'auto' : 'none' // Enable/disable pointer events based on newMessageText
            }}
            disabled={!newMessageText.trim()} // Disable button if newMessageText is empty or only whitespace
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChatContainer;
