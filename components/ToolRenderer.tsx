import { ToolCall, ToolName } from '../types';
import { ConceptCard } from './tools/ConceptCard';
// Import other tool components as you create them
// import { AnalogyBox } from './tools/AnalogyBox';
// import { CodeChallenge } from './tools/CodeChallenge';

interface ToolRendererProps {
  toolCall: ToolCall;
}

export const ToolRenderer = ({ toolCall }: ToolRendererProps) => {
  // Use a switch statement to determine which component to render
  switch (toolCall.tool_name) {
    case ToolName.RenderAxiomNode: // Assuming this is the name for ConceptCard
    case 'display_concept_card': // Fallback for raw string
      // Type assertion to satisfy the component's props
      return <ConceptCard toolCall={toolCall as ToolCall<'display_concept_card'>} />;

    // case ToolName.RenderIsomorphism:
    //   return <AnalogyBox toolCall={toolCall as ToolCall<'display_analogy_box'>} />;
      
    // case ToolName.InitiateSynthesisProtocol:
    //   return <CodeChallenge toolCall={toolCall as ToolCall<'display_code_challenge'>} />;
    
    // NOTE: We don't render FocusQueryModal here, as modals are typically
    // handled at a higher level in the component tree to overlay the whole screen.

    default:
      // Fallback for an unknown but validated tool - useful for development.
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
          <p className="font-bold">Rendering Error</p>
          <p>No component found for tool: {toolCall.tool_name}</p>
        </div>
      );
  }
};
