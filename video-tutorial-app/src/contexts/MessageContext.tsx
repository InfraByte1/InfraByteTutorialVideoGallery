import React, { createContext, useContext } from "react";
import { message } from "antd";

type MessageApi = ReturnType<typeof message.useMessage>[0];

const MessageApiContext = createContext<MessageApi | null>(null);

export let globalMessageApi: MessageApi;

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
globalMessageApi = messageApi;
  return (
    <MessageApiContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageApiContext.Provider>
  );
};

export const useMessageApi = (): MessageApi => {
  const context = useContext(MessageApiContext);
  if (!context) {
    throw new Error("useMessageApi must be used within a MessageProvider");
  }
  return context;
};
