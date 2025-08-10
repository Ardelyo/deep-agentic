import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatMessage, ToolCall, ToolName } from '../types';
import { SYSTEM_PROMPT } from '../constants';

// --- LAYER 3: THE SCHEMA SHIELD ---

// Defines the required parameters for each tool. Optional parameters are not listed.
const TOOL_SCHEMAS = {
  [ToolName.RenderAxiomNode]: {
    title: 'string',
    axioms: 'array',
    subsequent_query: 'string',
  },
  [ToolName.FocusQuery]: {
    query: 'string',
  },
  [ToolName.RenderIsomorphism]: {
    title: 'string',
    isomorphic_system_description: 'string',
    concluding_query: 'string',
  },
  [ToolName.InitiateSynthesisProtocol]: {
    language: 'string',
    scaffold_code: 'string',
    synthesis_task: 'string',
  },
  [ToolName.CompileSchema]: {
    schema_points: 'array',
  },
};

// Validates a parsed JSON object against the defined tool schemas.
const validateToolCall = (data: any): data is ToolCall => {
  if (typeof data !== 'object' || data === null || !data.tool_name || !data.parameters) {
    return false;
  }
  const schema = TOOL_SCHEMAS[data.tool_name as ToolName];
  if (!schema) {
    return false; // Unknown tool name
  }

  const params = data.parameters;
  for (const key in schema) {
    const type = schema[key as keyof typeof schema];
    if (params[key] === undefined) {
      return false; // Required parameter is missing
    }
    if (type === 'array') {
      if (!Array.isArray(params[key])) return false;
      // All arrays in Aether tools are expected to be string arrays.
      if (!params[key].every((item: any) => typeof item === 'string')) return false;
    } else {
      if (typeof params[key] !== type) return false;
    }
  }
  return true;
};

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ToolCall<'focus_query'> | null>(null); // New state for modal
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    const initializeChat = () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });
        chatRef.current = chat;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred during initialization.');
        console.error(e);
      }
    };
    initializeChat();
  }, []);

  const startSession = useCallback(() => {
    // Aether is a silent interface. It does not initiate conversation.
    // This function is kept for potential future use or state initialization
    // but it will not send any messages.
  }, []);

  const sendMessage = useCallback(async (text: string, isRetry = false) => {
    if (!chatRef.current) {
      setError('Chat is not initialized.');
      return;
    }

    setIsLoading(true);
    setError(null);
    let willRetry = false;

    if (!isRetry) {
      const userMessage: ChatMessage = {
        id: self.crypto.randomUUID(),
        sender: 'user',
        text,
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    try {
      const retryContext = isRetry
        ? "Protocol error: Previous response was not valid JSON for a tool call. Adhere to protocol. Respond to the user's last message with either standard text or a single, raw JSON object."
        : null;

      const messageToSend = retryContext ? `${retryContext}\n\nUser's message: "${text}"` : text;

      const stream = await chatRef.current.sendMessageStream({ message: messageToSend });
      let fullResponseText = '';
      for await (const chunk of stream) {
        fullResponseText += chunk.text;
      }
      fullResponseText = fullResponseText.trim();

      if (!fullResponseText) {
        // Empty response, do nothing and stop loading.
        return;
      }
      
      let parsedJson: any;
      let isJsonParseSuccess = true;
      try {
        // LAYER 2: THE PARSE SHIELD
        parsedJson = JSON.parse(fullResponseText);
      } catch (e) {
        isJsonParseSuccess = false;
      }

      // LAYER 3: THE SCHEMA SHIELD
      if (isJsonParseSuccess && validateToolCall(parsedJson)) {
        // Handle FocusQuery separately
        if (parsedJson.tool_name === ToolName.FocusQuery) {
          setActiveModal(parsedJson as ToolCall<'focus_query'>);
        } else {
          // SUCCESS: Valid tool call received.
          const aiMessage: ChatMessage = {
            id: self.crypto.randomUUID(),
            sender: 'ai',
            text: '',
            toolCall: parsedJson,
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // FAILURE: Invalid response. Activate recovery protocol.
        if (isRetry) {
          // This was the second attempt. Give up on tools and show the raw text.
          const aiMessage: ChatMessage = {
            id: self.crypto.randomUUID(),
            sender: 'ai',
            text: fullResponseText,
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
        else {
          // This is the first failure. Trigger the "Clarification" fallback.
          console.error("Shield & Recover: Invalid AI response. Retrying.", { response: fullResponseText });

          const clarificationMessage: ChatMessage = {
            id: self.crypto.randomUUID(),
            sender: 'ai',
            text: "[color:syntax]Recalibrating logic path...[/color]",
          };
          setMessages((prev) => [...prev, clarificationMessage]);

          willRetry = true;
          sendMessage(text, true); // Non-blocking call to retry.
        }
      }

    } catch (e) {
      console.error(e);
      let displayError: string;
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';

      if (
        errorMessage.includes('429') || 
        /rate limit/i.test(errorMessage) || 
        /resource has been exhausted/i.test(errorMessage) ||
        /exceeded your current quota/i.test(errorMessage)
      ) {
        displayError = 'System capacity reached. Please wait and try again.';
      } else {
        displayError = 'A system error occurred. Please try again later.';
      }

      setError(displayError);
    } finally {
      if (!willRetry) {
        setIsLoading(false);
      }
    }
  }, []);

  return { messages, isLoading, error, sendMessage, startSession, activeModal, setActiveModal };
};