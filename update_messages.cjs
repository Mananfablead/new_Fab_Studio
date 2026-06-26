const fs = require('fs');

const path = '/Users/imac/Desktop/Projects/Fablead_Studio/fabphotopic.fableadtech/src/pages/GroupChat.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the messages state definition
const stateSearch = `  const [messages, setMessages] = useState<{
    id: number, 
    text?: string, 
    time: string,
    file?: { url: string, name: string, type: 'image' | 'video' | 'document' }
  }[]>([]);`;
const stateReplace = `  const [messages, setMessages] = useState<{
    id: number, 
    text?: string, 
    time: string,
    sender_id?: number,
    receiver_id?: number,
    file?: { url: string, name: string, type: 'image' | 'video' | 'document' }
  }[]>([]);`;
content = content.replace(stateSearch, stateReplace);

// 2. Update fetchMessages
const fetchSearch = `          const response = await api.get(\`/chat/messages/\${selectedParticipant.id || selectedParticipant.user_id}\`);
          setMessages(response.data?.data || response.data || []);`;
const fetchReplace = `          const response = await api.get(\`/chat/messages/\${selectedParticipant.id || selectedParticipant.user_id}\`);
          const rawMessages = response.data?.data || response.data || [];
          const formattedMessages = rawMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id
          }));
          setMessages(formattedMessages);`;
content = content.replace(fetchSearch, fetchReplace);

// 3. Update the UI rendering
const uiSearch = `                 messages.map((msg) => (
                   <div key={msg.id} className="flex flex-col items-end w-full">
                     <div className={\`text-white rounded-2xl rounded-tr-none max-w-[85%] md:max-w-[70%] flex flex-col overflow-hidden \${
                       msg.file && !msg.text && (msg.file.type === 'image' || msg.file.type === 'video')
                         ? 'bg-transparent shadow-sm'
                         : 'bg-primary p-1.5 shadow-sm'
                     }\`}>`;
const uiReplace = `                 messages.map((msg) => {
                   const isSentByMe = String(msg.sender_id) === String(currentUser?.id);
                   return (
                   <div key={msg.id} className={\`flex flex-col w-full \${isSentByMe ? 'items-end' : 'items-start'}\`}>
                     <div className={\`rounded-2xl max-w-[85%] md:max-w-[70%] flex flex-col overflow-hidden \${isSentByMe ? 'rounded-tr-none text-white' : 'rounded-tl-none bg-slate-100 text-slate-800'} \${
                       msg.file && !msg.text && (msg.file.type === 'image' || msg.file.type === 'video')
                         ? 'bg-transparent shadow-sm'
                         : (isSentByMe ? 'bg-primary p-1.5 shadow-sm' : 'p-1.5 shadow-sm')
                     }\`}>`;
content = content.replace(uiSearch, uiReplace);

// Also need to close the map block properly
const uiEndSearch = `                     <span className="text-[10px] text-slate-400 mt-1 mr-1">{msg.time}</span>
                   </div>
                 ))`;
const uiEndReplace = `                     <span className={\`text-[10px] text-slate-400 mt-1 \${isSentByMe ? 'mr-1' : 'ml-1'}\`}>{msg.time}</span>
                   </div>
                   );
                 })`;
content = content.replace(uiEndSearch, uiEndReplace);

fs.writeFileSync(path, content);
console.log('Successfully updated GroupChat.tsx for new message API response format.');
