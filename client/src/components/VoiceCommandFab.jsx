import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceCommandFab = () => {
    const [isListening, setIsListening] = useState(false);
    const [support, setSupport] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupport(false);
        }
    }, []);

    const handleListen = () => {
        if (!support) {
            alert("Browser does not support Speech Recognition.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Voice Command:', transcript);

            if (transcript.includes('status')) {
                alert("Current Load Status: In Transit (On Time)");
            } else if (transcript.includes('balance')) {
                alert("Wallet Balance: $12,450.00");
            } else {
                alert(`Command not recognized: "${transcript}". Try "Status" or "Balance".`);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            alert("Voice command failed. Please try again.");
        };

        recognition.start();
    };

    if (!support) return null;

    return (
        <button
            onClick={handleListen}
            className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-colors z-50 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            title="Voice Command"
        >
            {isListening ? (
                <MicOff className="w-6 h-6 text-white animate-pulse" />
            ) : (
                <Mic className="w-6 h-6 text-white" />
            )}
        </button>
    );
};

export default VoiceCommandFab;
