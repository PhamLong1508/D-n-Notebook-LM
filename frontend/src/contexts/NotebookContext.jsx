import React, { createContext, useContext, useState } from 'react';

const NotebookContext = createContext(null);

export const useNotebook = () => useContext(NotebookContext);

export const NotebookProvider = ({ children }) => {
  const [notebookId, setNotebookId] = useState(null);
  const [notebookSources, setNotebookSources] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [openNoteModal, setOpenNoteModal] = useState(null);
  const [fetchNotebook, setFetchNotebook] = useState(null);

  return (
    <NotebookContext.Provider value={{
      notebookId,
      setNotebookId,
      notebookSources,
      setNotebookSources,
      chatLoading,
      setChatLoading,
      openNoteModal,
      setOpenNoteModal,
      fetchNotebook,
      setFetchNotebook,
    }}>
      {children}
    </NotebookContext.Provider>
  );
};