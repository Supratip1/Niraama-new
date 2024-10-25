// src/components/AnimatedBackground.tsx

import Lottie from 'lottie-react';
import animationData from './Animation - 1729883441761.json' // Update the path to your animation JSON file

const AnimatedBackground = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <Lottie 
        animationData={animationData} 
        loop={true} 
        autoplay={true} 
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
};

export default AnimatedBackground;
