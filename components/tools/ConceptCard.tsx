import { motion } from 'framer-motion';
import { ToolCall } from '../../types'; // Assuming your types are in ../../types

// Define specific props for this component for type safety
interface ConceptCardProps {
  toolCall: ToolCall<'display_concept_card'>;
}

// Icon for visual flair
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const ConceptCard = ({ toolCall }: ConceptCardProps) => {
  const { title, points, follow_up_question } = toolCall.parameters;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1 + 0.3, duration: 0.4 },
    }),
  };

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-lg p-6 my-2 w-full max-w-2xl mx-auto border border-gray-100"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 className="text-xl font-bold text-gray-800 font-manrope mb-4" variants={itemVariants} custom={0}>
        {title}
      </motion.h3>
      <ul className="space-y-3 mb-4">
        {points.map((point, index) => (
          <motion.li key={index} className="flex items-start" variants={itemVariants} custom={index + 1}>
            <div className="mr-3 pt-1 flex-shrink-0">
              <CheckIcon />
            </div>
            <p className="text-gray-700 font-inter">{point}</p>
          </motion.li>
        ))}
      </ul>
      <motion.p className="text-blue-600 italic font-inter mt-6 border-t pt-4 border-gray-200" variants={itemVariants} custom={points.length + 1}>
        {follow_up_question}
      </motion.p>
    </motion.div>
  );
};
