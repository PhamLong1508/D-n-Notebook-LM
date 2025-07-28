import { createContext, useState, useContext } from "react";
import { v4 as uuidv4 } from 'uuid';

const ContextPanelContext = createContext();

export const ContextPanelProvider = ({ children }) => {
  const [snippets, setSnippets] = useState([]);
  const [noteCreator, setNoteCreator] = useState(null);

  const addSnippet = (content) => {
    const newSnippet = { id: uuidv4(), content };
    setSnippets(prevSnippets => [...prevSnippets, newSnippet]);
  };

  const removeSnippet = (id) => {
    setSnippets(prevSnippets => prevSnippets.filter(s => s.id !== id));
  };

  const clearContext = () => {
    setSnippets([]);
  };

  const registerNoteCreator = (creator) => {
    setNoteCreator(() => creator);
  };

  const unregisterNoteCreator = () => {
    setNoteCreator(null);
  }

  return (
    <ContextPanelContext.Provider
      value={{ snippets, addSnippet, removeSnippet, clearContext, noteCreator, registerNoteCreator, unregisterNoteCreator }}
    >
      {children}
    </ContextPanelContext.Provider>
  );
};

export const useContextMenu = () => useContext(ContextPanelContext);
