
export type MessageSender = 'user' | 'ai';

export enum ToolName {
  RenderAxiomNode = 'render_axiom_node',
  FocusQuery = 'focus_query',
  RenderIsomorphism = 'render_isomorphism',
  InitiateSynthesisProtocol = 'initiate_synthesis_protocol',
  CompileSchema = 'compile_schema',
}

export interface AxiomNodePayload {
  tool_name: ToolName.RenderAxiomNode;
  parameters: {
    title: string;
    axioms: string[];
    subsequent_query: string;
  };
}

export interface FocusQueryPayload {
  tool_name: ToolName.FocusQuery;
  parameters: {
    query: string;
  };
}

export interface IsomorphismPayload {
  tool_name: ToolName.RenderIsomorphism;
  parameters: {
    title: string;
    isomorphic_system_description: string;
    concluding_query: string;
  };
}

export interface SynthesisProtocolPayload {
  tool_name: ToolName.InitiateSynthesisProtocol;
  parameters: {
    language: string;
    scaffold_code: string;
    synthesis_task: string;
  };
}

export interface CompileSchemaPayload {
  tool_name: ToolName.CompileSchema;
  parameters: {
    schema_points: string[];
  };
}

export type ToolCall =
  | AxiomNodePayload
  | FocusQueryPayload
  | IsomorphismPayload
  | SynthesisProtocolPayload
  | CompileSchemaPayload;

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  toolCall?: ToolCall;
}
