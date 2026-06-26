import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Search, MessageSquare, Send, Paperclip, FileText, Video, X } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { useAppDispatch, useAppSelector } from "@/store";
import api from "@/services/api";

export default function GroupChat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ url: string, name: string, type: 'image' | 'video' | 'document' } | null>(null);
  const [messages, setMessages] = useState<{
    id: number, 
    text?: string, 
    time: string,
    sender_id?: number,
    receiver_id?: number,
    file?: { url: string, name: string, type: 'image' | 'video' | 'document' }
  }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredParticipants = conversations.filter((p) => {
    const isNotCurrentUser = String(p.id || p.user_id) !== String(currentUser?.id);
    const matchesSearch = (p.firstName || p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    return isNotCurrentUser && matchesSearch;
  });
  
  const [selectedParticipant, setSelectedParticipant] = useState<typeof filteredParticipants[0] | null>(null);

  useEffect(() => {
    if (!selectedParticipant && filteredParticipants.length > 0) {
      setSelectedParticipant(filteredParticipants[0]);
    }
  }, [filteredParticipants, selectedParticipant]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedFile) return;
    
    try {
      await api.post('/chat/messages', {
        receiver_id: selectedParticipant?.id || selectedParticipant?.user_id,
        message: messageInput.trim()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setMessages([
      ...messages, 
      { 
        id: Date.now(), 
        text: messageInput.trim() || undefined, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file: selectedFile || undefined
      }
    ]);
    setMessageInput("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' 
                   : file.type.startsWith('video/') ? 'video' 
                   : 'document';
    
    const fileUrl = URL.createObjectURL(file);

    setSelectedFile({ url: fileUrl, name: file.name, type: fileType });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/groups/${groupId}/participants?page=1&limit=20`);
        setConversations(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) {
      fetchConversations();
    }
  }, [groupId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedParticipant) {
        try {
          const response = await api.get(`/chat/messages/${selectedParticipant.id || selectedParticipant.user_id}`);
          const rawMessages = response.data?.data || response.data || [];
          const formattedMessages = rawMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id
          }));
          setMessages(formattedMessages);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };
    fetchMessages();
  }, [selectedParticipant]);

  return (
    <div className="h-screen h-[100dvh] bg-[#f8fafc] flex flex-col overflow-hidden">
      <AppHeader />
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16 py-4 md:py-6 flex-1 flex flex-col mx-auto max-w-[1600px] min-h-0">
        
        {/* Main Content Area - Split View */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-0">
          
          {/* Left Sidebar - Chat List / Participants */}
          <div className="w-full md:w-80 lg:w-[350px] border-b md:border-b-0 md:border-r border-slate-200 flex flex-col bg-white shrink-0">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="h-8 pl-2 pr-3 rounded-full bg-white border border-slate-200 flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0 group"
                  title="Back to Gallery"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">Back to Gallery</span>
                </button>
              </div>
              <div className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                {filteredParticipants.length}
              </div>
            </div>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..." 
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm" 
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-40 gap-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500">Loading members...</p>
                </div>
              ) : filteredParticipants.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-900">No members found</p>
                  <p className="text-xs text-slate-500 mt-1">Other members will appear here.</p>
                </div>
              ) : (
                filteredParticipants.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedParticipant(p)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border group ${
                      selectedParticipant?.id === p.id 
                        ? 'bg-primary/5 border-primary/20 shadow-sm' 
                        : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 group-hover:scale-105 transition-transform">
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold uppercase">
                          {p.firstName?.charAt(0) || p.email?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-primary transition-colors">
                        {p.firstName} {p.lastName}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{p.email}</p>
                    </div>
                    <div className={`px-2 py-1 text-[10px] rounded-lg font-bold uppercase tracking-wider shrink-0 ${
                      p.role?.toLowerCase() === 'owner' ? 'bg-gradient-to-br from-[hsl(var(--fab-amber))] to-[hsl(var(--fab-navy))] text-white' :
                      p.role?.toLowerCase() === 'admin' ? 'bg-[hsl(var(--fab-navy))]/10 text-[hsl(var(--fab-navy))]' :
                      p.role?.toLowerCase() === 'user' ? 'bg-primary/10 text-primary' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {p.role || 'Member'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Area - Conversation */}
          <div className="flex-1 flex flex-col bg-white min-w-0 min-h-0">
            {/* Conversation Header */}
            <div className="p-4 md:p-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {selectedParticipant ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                      {selectedParticipant.avatar ? (
                        <img src={selectedParticipant.avatar} alt={selectedParticipant.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-bold uppercase text-lg">{selectedParticipant.firstName?.charAt(0) || "?"}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">{selectedParticipant.firstName} {selectedParticipant.lastName}</h2>
                      <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-[300px]">{selectedParticipant.email}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-bold text-slate-900">Select a Chat</h2>
                    <p className="text-xs text-slate-500">Pick someone from the list to start chatting.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Messages Area */}
            <div className={`flex-1 p-6 overflow-y-auto flex flex-col ${messages.length === 0 ? 'items-center justify-center' : 'gap-4'}`}>
               {messages.length === 0 ? (
                 <div className="text-center max-w-sm">
                   <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                     <MessageSquare className="w-8 h-8 text-slate-300" />
                   </div>
                   <h3 className="font-bold text-slate-900 mb-2 text-lg">
                     {selectedParticipant ? `Say hi to ${selectedParticipant.firstName}!` : 'No messages yet'}
                   </h3>
                   <p className="text-sm text-slate-500">
                     {selectedParticipant ? 'Start the conversation by sending a message.' : 'Select someone to start chatting.'}
                   </p>
                 </div>
               ) : (
                 messages.map((msg) => {
                   const isSentByMe = String(msg.sender_id) === String(currentUser?.id);
                   return (
                   <div key={msg.id} className={`flex flex-col w-full ${isSentByMe ? 'items-end' : 'items-start'}`}>
                     <div className={`rounded-2xl max-w-[85%] md:max-w-[70%] flex flex-col overflow-hidden ${isSentByMe ? 'rounded-tr-none text-white' : 'rounded-tl-none bg-slate-100 text-slate-800'} ${
                       msg.file && !msg.text && (msg.file.type === 'image' || msg.file.type === 'video')
                         ? 'bg-transparent shadow-sm'
                         : (isSentByMe ? 'bg-primary p-1.5 shadow-sm' : 'p-1.5 shadow-sm')
                     }`}>
                       {msg.file && (
                         <div className={`rounded-xl overflow-hidden flex flex-col justify-center ${msg.text ? 'mb-1.5' : ''} ${
                           msg.file && !msg.text && (msg.file.type === 'image' || msg.file.type === 'video') ? 'border border-slate-200 bg-white' : 'bg-black/10'
                         }`}>
                           {msg.file.type === 'image' && (
                             <img src={msg.file.url} alt={msg.file.name} className="w-full h-auto max-h-[300px] object-contain bg-white" />
                           )}
                           {msg.file.type === 'video' && (
                             <video src={msg.file.url} controls className="w-full h-auto max-h-[300px] bg-black" />
                           )}
                           {msg.file.type === 'document' && (
                             <div className="flex items-center gap-3 p-4">
                               <FileText className="w-8 h-8 shrink-0 text-white/80" />
                               <span className="text-sm font-medium truncate max-w-[150px]">{msg.file.name}</span>
                             </div>
                           )}
                         </div>
                       )}
                       {msg.text && (
                         <p className="text-sm px-2.5 py-1">{msg.text}</p>
                       )}
                     </div>
                     <span className={`text-[10px] text-slate-400 mt-1 ${isSentByMe ? 'mr-1' : 'ml-1'}`}>{msg.time}</span>
                   </div>
                   );
                 })
               )}
               <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0 pr-20 lg:pr-24 relative">
              {selectedFile && (
                <div className="absolute bottom-full left-4 mb-2 bg-white border border-slate-200 shadow-lg rounded-xl p-3 flex items-center gap-3 w-64 animate-in slide-in-from-bottom-2 z-10">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                    {selectedFile.type === 'image' ? (
                      <img src={selectedFile.url} alt="preview" className="w-full h-full object-cover" />
                    ) : selectedFile.type === 'video' ? (
                      <Video className="w-5 h-5 text-primary" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{selectedFile.type}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFile(null)}
                    className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-700 transition-all shrink-0"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={selectedParticipant ? `Type your message to ${selectedParticipant.firstName}...` : "Type your message..."}
                  disabled={!selectedParticipant}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm min-w-0 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={(!messageInput.trim() && !selectedFile) || !selectedParticipant}
                  className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 shrink-0" 
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
