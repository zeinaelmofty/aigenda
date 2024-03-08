'use client';
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import GetStarted from "./Starter";
import React, { useState} from 'react';

const Chatbot: React.FC = () => {
  const { data: session, status } = useSession({required:true});
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  return (
     <>
        {status=='authenticated' ? (
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <Sidebar onSelectChat={setSelectedChatId} />
          <ChatContainer selectedChatId={selectedChatId} />
          </div>
        ) : (
          <GetStarted />
        )}
   </>
  );
};

const ChatbotWithSession: React.FC = () => {
  return (
    <SessionProvider>
      <Chatbot />
    </SessionProvider>
  );
};

export default ChatbotWithSession;
