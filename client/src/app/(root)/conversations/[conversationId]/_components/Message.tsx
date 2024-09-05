const Message = ({
  senderSocketId,
  messageContent,
  createdAt,
}: {
  senderSocketId: string;
  messageContent: string;
  createdAt: string;
}) => {
  return (
    <div className="mb-4 p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">
          {senderSocketId}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-gray-800">{messageContent}</p>
    </div>
  );
};

export default Message;
