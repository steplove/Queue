import { useCallback, useRef } from 'react';

export const useAudioQueue = () => {
  const isPlayingRef = useRef(false);
  const audioQueue = useRef([]);

  const playNextSound = useCallback(() => {
    if (audioQueue.current.length > 0) {
      const currentSoundArray = audioQueue.current.shift();
      let currentSoundIndex = 0;

      const playCurrentSoundArray = () => {
        if (currentSoundIndex < currentSoundArray.length) {
          const soundFile = currentSoundArray[currentSoundIndex];
          const audio = new Audio(`${soundFile}`);
          audio.addEventListener('ended', () => {
            currentSoundIndex++;
            playCurrentSoundArray();
          });
          audio.play();
        } else {
          isPlayingRef.current = false;
          if (audioQueue.current.length > 0) {
            isPlayingRef.current = true;
            playNextSound();
          }
        }
      };

      isPlayingRef.current = true;
      playCurrentSoundArray();
    }
  }, []);

  const runFunction = useCallback((newDataQueue, audioUrls) => {
    if (newDataQueue && audioUrls) {
      const { url, please, specificSound, ka } = audioUrls;
      const latestData = newDataQueue.VisitNumber;
      const soundFiles = latestData.split('').map((digit) => `${url}${digit}.mp3`);
      const combinedSrcArray = [please, ...soundFiles, specificSound, ka];

      audioQueue.current.push(combinedSrcArray);
      if (!isPlayingRef.current) {
        playNextSound();
      }
    } else {
      console.log('ไม่มีข้อมูลใหม่');
    }
  }, [playNextSound]);

  return { runFunction, playNextSound };
};
