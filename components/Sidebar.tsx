import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import { signOut, useSession } from "next-auth/react";
import { Conversation } from '@prisma/client/wasm';

interface User {
  id: number;
  username: string;
  profilePictureUrl: string;
}

interface Chat {
  id: number;
  title: string;
}

const Sidebar: React.FC<{ onSelectChat: (chatId: number | null) => void }> = ({ onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [deleteConfirmationChatId, setDeleteConfirmationChatId] = useState<number | null>(null);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editingChatId2, setEditingChatId2] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null); // Track selected chat
  const { data: session, status } = useSession();
  
  const handleSelectSidebarChat = (chatId: number) => {
    setSelectedChatId(chatId);
    onSelectChat(chatId);   
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatsResponse = await fetch(`/api/conversation`);
        const chatsData = await chatsResponse.json();
        chatsData.sort((a: Conversation, b: Conversation) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setChats(chatsData);
        setIsLoading(false); 
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false); 
      }
    };
    fetchData();
  }, []);

  const handleEditChatTitle = async (chatId: number, newTitle: string) => {
    try {
      await fetch(`/api/conversation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: chatId, title: newTitle }), 
      });
      setChats(chats.map(chat => chat.id === chatId ? { ...chat, title: newTitle } : chat));
      setEditingChatId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    try {
      await fetch(`/api/conversation?id=${chatId}`, { 
        method: 'DELETE',
      });
      setChats(chats.filter(chat => chat.id !== chatId));
      setDeleteConfirmationChatId(null);
      setSelectedChatId(null);
      onSelectChat(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleCreateChat = async () => {
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const newChat = await response.json();
      setChats(prevChats => {
        const updatedChats = [...prevChats, newChat];
        updatedChats.sort((a: Conversation, b: Conversation) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return updatedChats;
      }); 
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800">
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={session && session.user && session.user.image ? session.user.image : '/default-profile-image.jpg'}
                alt="Profile Picture"
                className="w-10 h-10 rounded-full"
              />
              <p className="text-lg font-semibold flex ml-4">
                {session && session.user ? session.user.name : <CircularProgress />}
              </p>
            </div>
          </div>
          <h2 className="text-lg font-semibold flex items-center">
            Chats
            <div className="flex items-center" onClick={handleCreateChat}>
              <AddIcon style={{ marginLeft: '5px', cursor: 'pointer' }} />
            </div>
          </h2>
          <div className="mt-8 space-y-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {isLoading ? (
              <CircularProgress />
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex justify-between items-center p-2 rounded-md cursor-pointer mt-2 ${selectedChatId === chat.id ? 'bg-gray-200 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'}`}
                  onClick={() => handleSelectSidebarChat(chat.id)} 
                  onMouseEnter={() => setEditingChatId(chat.id)}
                  onMouseLeave={() => setEditingChatId(null)}
                >
                  <div className="flex-grow" onClick={() => {
                    setEditingChatId(chat.id);
                    setEditTitle(chat.title);
                  }}>
                    {editingChatId2 === chat.id ? (
                      <input
                        type="text"
                        className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md cursor-pointer mt-2"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editTitle.trim() !== '') { 
                              handleEditChatTitle(chat.id, editTitle);
                            }
                            setEditingChatId2(null);
                          }
                        }}
                        onBlur={() => {
                          if (editTitle.trim() !== '') {
                            handleEditChatTitle(chat.id, editTitle);
                          }
                          setEditingChatId2(null);
                        }}
                      />
                    ) : (
                      <p className="block">{chat.title}</p>
                    )}
                  </div>
                  {editingChatId === chat.id && (
                    <div className="flex space-x-2">
                      <EditIcon
                        className="text-lg font-semibold flex items-center"
                        onClick={() => {
                          setEditTitle(chat.title);
                          setEditingChatId2(chat.id);
                        }}
                      />
                      <DeleteIcon
                        className="text-lg font-semibold flex items-center"
                        onClick={() => setDeleteConfirmationChatId(chat.id)}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          {status === 'authenticated' && (
            <button
              className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md cursor-pointer mt-2 ext-lg font-semibold flex items-center"
              style={{
                width: '100%',
                marginTop: 'auto',
                height: '60px'
              }}
              onClick={() => signOut({ callbackUrl: "/", })}
            >
              Logout
            </button>
          )}
        </div>
      </div>
      {deleteConfirmationChatId !== null && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p className="text-lg font-semibold flex items-center text-black">Are you sure you want to delete this chat?</p>
            <div className="flex justify-end mt-4">
              <button
                className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md cursor-pointer mt-2 ext-lg font-semibold flex items-center"
                style={{
                  width: '30%',
                  marginTop: 'auto',
                  marginRight: '10rem',
                  height: '30px'
                }} onClick={() => handleDeleteChat(deleteConfirmationChatId)}>Delete</button>
              <button
                className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md cursor-pointer mt-2 ext-lg font-semibold flex items-center"
                style={{
                  width: '30%',
                  height: '30px'
                }} onClick={() => setDeleteConfirmationChatId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
