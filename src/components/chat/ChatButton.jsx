import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Minimize2 } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function ChatButton({ pageContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          onClose={handleClose}
          isMinimized={isMinimized}
          onToggleMinimize={handleMinimize}
          isMobile={isMobile}
          pageContext={pageContext}
        />
      )}

      {/* Floating Button */}
      <Button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 z-50 transition-all hover:scale-110"
        size="icon"
        aria-label="Open chat assistant"
      >
        {isOpen && !isMinimized ? (
          <Minimize2 className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Notification Badge */}
      {!isOpen && !isMinimized && (
        <div className="fixed bottom-[4.5rem] right-5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full z-50 shadow-lg animate-bounce">
          Ask me! 💬
        </div>
      )}
    </>
  );
}