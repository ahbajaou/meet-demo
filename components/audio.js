// audio-processor.js
class MyAudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    // Process audio data here without blocking the UI
    // You can send processed data back to the main thread via this.port.postMessage()
    for (let channel = 0; channel < output.length; channel++) {
      output[channel].set(input[channel]);
    }
    return true; // Keep the processor alive
  }
}
registerProcessor('my-audio-processor', MyAudioProcessor);