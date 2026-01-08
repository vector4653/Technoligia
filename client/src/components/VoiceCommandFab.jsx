import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const VoiceCommandFab = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [support, setSupport] = useState(true);
    const { user } = useAuth(); // Get authenticated user context

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setSupport(false);
        }
    }, []);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        } else {
            alert(text);
        }
    };

    const handleListen = () => {
        if (!support) {
            alert("Browser does not support Speech Recognition.");
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Voice Command:', transcript);

            try {
                if (transcript.includes('status')) {
                    const res = await axios.get('/api/users/my-active-load');
                    speak(res.data.status_text);
                } else if (transcript.includes('balance')) {
                    const res = await axios.get('/api/users/me');
                    speak(`Your current balance is ${res.data.wallet_balance} dollars.`);
                } else if (transcript.includes('bid')) {
                    // Advanced: For now, we'll prompt. Real implementation would parse "Bid 500"
                    if (user?.role === 'FLEET') {
                        speak("To place a bid, please say the amount clearly, like Bid 500.");
                    } else {
                        speak("Only Fleet Managers can place bids.");
                    }
                } else {
                    speak("I didn't catch that. Try saying Status or Balance.");
                }
            } catch (err) {
                console.error("Voice Command API Error:", err);
                speak("I'm having trouble reaching the server. Please try again.");
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            speak("Voice command failed. Please try again.");
        };

        recognition.start();
    };

    if (!support) return null;

    // Button Base Style
    const baseClasses = "fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-colors z-50 flex items-center justify-center";

    // Dynamic Style based on state
    let stateClasses = "bg-blue-600 hover:bg-blue-700";
    if (isListening) stateClasses = "bg-red-500 hover:bg-red-600";
    if (isSpeaking) stateClasses = "bg-green-500 hover:bg-green-600";

    return (
        <button
            onClick={handleListen}
            className={`${baseClasses} ${stateClasses}`}
            title="Voice Command"
        >
            {isListening ? (
                <MicOff className="w-6 h-6 text-white animate-pulse" />
            ) : isSpeaking ? (
                <Volume2 className="w-6 h-6 text-white animate-bounce" />
            ) : (
                <Mic className="w-6 h-6 text-white" />
            )}
        </button>
    );
};

export default VoiceCommandFab;
