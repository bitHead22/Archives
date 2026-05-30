import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { queryService } from '@/services/queryService'
import { papersService } from '@/services/papersService'
import { useSolvedPapers } from '@/hooks/useSolvedPapers'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Download, Minus, Plus, MousePointer2, Hand, Highlighter,
  RotateCw, Printer, ChevronLeft, ChevronRight, Sparkles, History,
  MoreVertical, Bot, ThumbsUp, Copy, FileText, FileQuestion, Lightbulb,
  PlusCircle, ArrowUp, Loader2
} from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { UserAvatar } from '@/components/UserAvatar'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`

export default function ViewerPage() {
  const { paperId } = useParams()
  const { user } = useAuthContext()
  const { solvedPapers, toggleSolved } = useSolvedPapers()
  const isSolved = !!solvedPapers[paperId]

  // Chat State
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I've analyzed this paper. What would you like to know?"
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Cloud Hydrate chat history
  useEffect(() => {
    async function loadCloudHistory() {
      if (!user?.id || !paperId) return

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('user_id', user.id)
        .eq('paper_id', paperId)
        .single()

      if (data?.messages) {
        setMessages(data.messages)
      } else if (error && error.code !== 'PGRST116') {
        console.error("Cloud history error:", error)
      }
    }
    loadCloudHistory()
  }, [user?.id, paperId])

  // Cloud Persist chat history automatically
  useEffect(() => {
    async function saveCloudHistory() {
      if (!user?.id || !paperId || messages.length <= 1) return

      // Limit to 15 messages (7 Q&A pairs + greeting) to prevent flooding as planned
      const cappedMessages = messages.length > 15 ? messages.slice(-15) : messages

      const { error } = await supabase
        .from('chat_sessions')
        .upsert({
          user_id: user.id,
          paper_id: paperId,
          messages: cappedMessages,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,paper_id' })

      if (error) console.error("Cloud persistence error:", error)
    }

    saveCloudHistory()
  }, [messages, user?.id, paperId])
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (forcedInput = null) => {
    const textToSend = forcedInput !== null ? forcedInput : input
    if (!textToSend.trim() || isLoading) return

    const userMsg = { role: 'user', content: textToSend }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const chatHistoryForBackend = messages.filter((_, idx) => idx > 0).map(m => ({ role: m.role, content: m.content }))

      const response = await queryService.ask({
        question: textToSend,
        paperId: paperId,
        chatHistory: chatHistoryForBackend,
      })

      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'assistant', content: "**Error:** Failed to analyze the document. The backend server might be unavailable." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const [paper, setPaper] = useState({ subject: "Loading...", term: "" })
  const [pdfUrl, setPdfUrl] = useState(null)

  // PDF Viewer Controls
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [isChatOpen, setIsChatOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 768 : true)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  useEffect(() => {
    async function loadPaper() {
      try {
        const metadata = await papersService.getPaper(paperId)
        setPaper({
          subject: metadata.subject,
          term: `${metadata.exam_type || ''} • ${metadata.year || ''}`
        })
        if (metadata.storage_path && metadata.storage_path !== 'local_testing') {
          const url = await papersService.getDownloadUrl(paperId)
          setPdfUrl(url)
        } else if (metadata.storage_path === 'local_testing') {
          // Prevent blank loading state for CLI injected test papers
          setPdfUrl('about:blank')
        }
      } catch (e) {
        console.error("Failed to load paper", e)
      }
    }
    if (paperId) loadPaper()
  }, [paperId])

  return (
    <div className="bg-black text-white font-sans flex flex-col h-screen overflow-hidden antialiased selection:bg-neutral-800 selection:text-white">
      {/* Header */}
      <header className="flex-none h-14 bg-black border-b border-neutral-800 px-4 md:px-6 flex items-center justify-between z-20 relative">
        <div className="flex-1 min-w-0 flex items-center gap-3 md:gap-4 overflow-hidden pr-2">
          <button
            onClick={() => window.history.back()}
            className="flex-none p-2 hover:bg-neutral-900 rounded-none transition-colors text-neutral-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col justify-center overflow-hidden min-w-0">
            <h1 className="font-semibold text-sm md:text-base tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {paper.subject}
            </h1>
            <p className="text-xs text-neutral-400 font-normal whitespace-nowrap overflow-hidden text-ellipsis">
              {paper.term}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-none shrink-0">
          {/* Mark Solved Toggle */}
          <div className="flex items-center gap-2 md:gap-3 bg-black py-1 px-2 md:px-3 border border-neutral-800">
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-xs font-medium text-white leading-none">Mark Solved</span>
            </div>
            <label className="relative flex h-[20px] w-[36px] cursor-pointer items-center rounded-full border border-neutral-700 bg-neutral-900 p-0.5 has-[:checked]:bg-white transition-colors duration-200">
              <div className={`h-full w-[16px] rounded-full shadow-sm transition-transform duration-200 ${isSolved ? 'translate-x-[16px] bg-black' : 'translate-x-0 bg-neutral-400'}`}></div>
              <input
                className="invisible absolute"
                type="checkbox"
                checked={isSolved}
                onChange={(e) => toggleSolved(paperId, e.target.checked)}
              />
            </label>
          </div>

          <div className="hidden md:block h-6 w-px bg-neutral-800"></div>

          {/* Download Button */}
          {pdfUrl ? (
            <a
              href={pdfUrl}
              download={`${paper.subject}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 md:w-auto md:px-4 md:py-1.5 md:gap-2 text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-none transition-colors cursor-pointer"
            >
              <Download size={16} />
              <span className="hidden md:inline text-xs font-medium">Download</span>
            </a>
          ) : (
            <button disabled className="flex items-center justify-center w-8 h-8 md:w-auto md:px-4 md:py-1.5 md:gap-2 opacity-50 text-white bg-neutral-900 border border-neutral-800 rounded-none transition-colors cursor-not-allowed">
              <Download size={16} />
              <span className="hidden md:inline text-xs font-medium">Download</span>
            </button>
          )}

          <div className="hidden md:block h-6 w-px bg-neutral-800"></div>

          {/* Toggle Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center justify-center w-8 h-8 md:w-auto md:px-4 md:py-1.5 md:gap-2 border transition-colors ${isChatOpen
                ? 'bg-white text-black border-white hover:bg-neutral-200'
                : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'
              }`}
            title="Toggle Assistant"
          >
            <Bot size={16} />
            <span className="hidden lg:inline text-xs font-medium">{isChatOpen ? "Close Assistant" : "Open Assistant"}</span>
          </button>

          {/* User Profile */}
          <div className="hidden sm:block">
            <UserAvatar />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black">
        {/* PDF Viewer Section */}
        <section className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a] relative md:border-r border-neutral-800 group/pdf-viewer">
          {/* PDF Toolbar */}
          <div className="flex-none bg-black border-b border-neutral-800 px-4 py-2 flex justify-between items-center z-10">
            <div className="flex items-center gap-px bg-neutral-900 border border-neutral-800">
              <button
                onClick={() => setZoom(z => Math.max(25, z - 25))}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Zoom Out"
              >
                <Minus size={18} />
              </button>
              <span className="text-xs font-mono w-12 text-center text-white bg-black py-1.5 border-x border-neutral-800">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(500, z + 25))}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Zoom In"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-px bg-neutral-900 border border-neutral-800">
              <button
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                title="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-mono w-20 text-center text-white bg-black py-1.5 border-x border-neutral-800 tracking-widest">
                {numPages ? `${pageNumber} / ${numPages}` : '-- / --'}
              </span>
              <button
                onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
                disabled={!numPages || pageNumber >= numPages}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                title="Next Page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* PDF Render Area */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-[#111111] relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className={`relative w-full ${isChatOpen ? 'max-w-4xl' : 'max-w-6xl'} bg-white shadow-2xl shadow-black h-[1200px] transition-all duration-300 ease-in-out mx-auto`}>
              <div className="w-full h-full relative overflow-hidden bg-white">
                {pdfUrl ? (
                  <div className="w-full h-[1200px] overflow-auto flex justify-center items-start pt-4 pb-4 px-4 bg-[#111111] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={<div className="flex items-center justify-center p-20"><Loader2 size={32} className="animate-spin text-neutral-500" /></div>}
                      className="shadow-2xl shadow-black/80"
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={zoom / 100}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="bg-white"
                      />
                    </Document>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* AI Tutor Chat Section */}
        <aside
          className={`flex flex-none flex-col bg-black border-neutral-800 z-30 transition-all duration-300 ease-in-out ${isChatOpen ? 'h-[55vh] md:h-auto w-full md:w-[400px] lg:w-[480px] xl:w-[520px] border-t md:border-t-0 md:border-l opacity-100' : 'h-0 md:h-auto w-full md:w-0 border-none opacity-0 overflow-hidden'}`}
        >
          <div className="flex-none px-5 py-3 border-b border-neutral-800 flex items-center gap-3 bg-black sticky top-0 w-full min-w-[400px]">
            <div className="size-8 bg-white flex items-center justify-center text-black shadow-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white leading-tight">Archi</h2>
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Context Aware</p>
            </div>
            <div className="ml-auto flex gap-1">
              <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                <History size={18} />
              </button>
              <button className="p-2 text-neutral-400 hover:text-white transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-black custom-scrollbar">
            <div className="flex justify-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900 border border-neutral-800 px-3 py-1">Today</span>
            </div>

            {messages.map((msg, idx) => (
              msg.role === 'assistant' ? (
                <div key={idx} className="flex gap-4 group/ai-msg animate-fade-in-up">
                  <div className="flex-none w-6 h-6 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mt-1">
                    <Bot size={12} />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[90%]">
                    <div className="bg-neutral-900 border border-neutral-800 p-4 text-sm text-white leading-relaxed shadow-sm">
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex flex-row-reverse gap-4 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                  <div className="flex-none w-6 h-6 bg-neutral-800 flex items-center justify-center ring-1 ring-neutral-700 text-xs font-bold uppercase text-white mt-1">
                    {user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col gap-1 items-end max-w-[90%]">
                    <div className="bg-white text-black p-4 text-sm leading-relaxed border border-white">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )
            ))}

            {isLoading && (
              <div className="flex gap-4 group/ai-msg animate-fade-in-up">
                <div className="flex-none w-6 h-6 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mt-1">
                  <Bot size={12} />
                </div>
                <div className="flex flex-col gap-1 max-w-[90%]">
                  <div className="bg-neutral-900 border border-neutral-800 p-4 text-sm text-white flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-neutral-400" />
                    <span className="text-neutral-400">Analyzing doc...</span>
                  </div>
                </div>
              </div>
            )}
            <div className="h-4" ref={chatEndRef}></div>
          </div>

          <div className="flex-none p-5 bg-black border-t border-neutral-800 z-40 relative">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-2 px-2 snap-x">
              <button onClick={() => handleSend("Can you summarize the most important topics in this paper?")} className="snap-start flex-none px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-xs font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-2 group">
                <FileText size={14} className="text-neutral-400 group-hover:text-white" /> Summarize Paper
              </button>
              <button onClick={() => handleSend("Please generate a 3 question pop-quiz based on this paper.")} className="snap-start flex-none px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-xs font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-2 group">
                <FileQuestion size={14} className="text-neutral-400 group-hover:text-white" /> Generate Quiz
              </button>
              <button onClick={() => handleSend("Can you explain the key concepts taught in this text in simple terms?")} className="snap-start flex-none px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-xs font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-2 group">
                <Lightbulb size={14} className="text-neutral-400 group-hover:text-white" /> Explain Concepts
              </button>
            </div>

            <div className="relative flex items-end gap-0 bg-black border border-neutral-800 p-0 focus-within:ring-1 focus-within:ring-white focus-within:border-white transition-all shadow-sm">
              <button className="p-3 text-neutral-500 hover:text-white transition-colors flex-none h-[46px]" title="Upload Image or File">
                <PlusCircle size={20} />
              </button>
              <textarea
                className="w-full bg-transparent border-none text-sm text-white placeholder-neutral-500 focus:ring-0 resize-none py-3 px-1 max-h-32 leading-relaxed outline-none"
                placeholder="Ask AI about this paper..."
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                style={{ minHeight: '46px' }}
              ></textarea>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-white hover:bg-neutral-200 text-black transition-all flex items-center justify-center flex-none h-[46px] w-[46px] disabled:opacity-50"
              >
                <ArrowUp size={18} />
              </button>
            </div>
            <div className="text-center mt-3">
              <p className="text-[10px] text-neutral-600 font-mono">AI can make mistakes. Double check important info.</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
