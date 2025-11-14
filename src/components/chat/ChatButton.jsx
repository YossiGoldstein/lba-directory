import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import ChatWindow from "./ChatWindow";

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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
        />
      )}

      {/* Floating Button */}
      <Button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 z-50 transition-all hover:scale-110"
        size="icon"
      >
        {isOpen && !isMinimized ? (
          <Minimize2 className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Notification Badge (Optional) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-50 animate-pulse">
          Ask me!
        </div>
      )}
    </>
  );
}