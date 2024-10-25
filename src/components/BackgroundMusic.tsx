import React, { useEffect, useRef, useState } from 'react';
import zenMusic from './zen.mp3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const BackgroundMusic: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(error => {
                    console.log("Playback prevented by browser. User interaction required.");
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
        }
    }, []);

    return (
        <div style={{ position: 'fixed', top: 16, right: 100, zIndex: 1000 }}>
            <audio ref={audioRef} loop>
                <source src={zenMusic} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
            <button 
                onClick={toggleMusic} 
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                }}
                aria-label={isPlaying ? "Pause Music" : "Play Music"}
            >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="lg" />
            </button>
        </div>
    );
};

export default BackgroundMusic;
