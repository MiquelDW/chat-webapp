// Layout Component that wraps around all routes inside folder 'conversations'
// it ensures a consistent layout for all routes within the folder 'conversations'
// this Layout component will be given to the 'Layout' component as a child (one level higher)
const ConversationsLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ConversationsLayout;
