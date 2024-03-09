import React from 'react';
import { signIn } from "next-auth/react";

const GetStartedButton: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div style={{ height: '100vh' }}>
        <button
          className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md cursor-pointer mt-2 ext-lg font-semibold flex items-center"
          style={{
            color: 'white',
            backgroundColor: 'black',
            marginTop: '100%',
            width: '20rem', 
            height: '6rem', 
          }}
          onClick={() => signIn()}
        >
          Try AI-Genda
        </button>
      </div>
    </div>
  );
};

export default GetStartedButton;
