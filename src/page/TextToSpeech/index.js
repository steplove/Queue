import React from "react";

class TextToSpeech extends React.Component {
  speak = () => {
    const message = new SpeechSynthesisUtterance(" ขอเชิญหมายเลข  001   ที่ห้องตรวจ 3");
    message.rate = 0.30;
    message.lang = "th-TH";
    window.speechSynthesis.speak(message);
    const voices = window.speechSynthesis.getVoices();
    console.log(voices);
  };

  render() {
    return (
      <div>
        <button onClick={this.speak}>พูด</button>
      </div>
    );
  }
}

export default TextToSpeech;
