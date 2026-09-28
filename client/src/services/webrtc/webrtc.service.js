import signalingService from './signaling.service.js';

/**
 * WebRTC Core Service
 * Manages RTCPeerConnection lifecycle, local/remote media tracks, and P2P RTCDataChannel.
 */

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.targetUserId = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize WebRTC Peer Connection for a call
   * @param {string} targetUserId - Remote user ID
   * @param {RTCConfiguration} rtcConfig - Custom ICE server configuration
   */
  initConnection(targetUserId, rtcConfig = { iceServers: DEFAULT_ICE_SERVERS }) {
    this.cleanUp();
    this.targetUserId = targetUserId;
    this.peerConnection = new RTCPeerConnection(rtcConfig);

    // ICE candidate handler
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        signalingService.sendIceCandidate(this.targetUserId, event.candidate);
      }
    };

    // Track handler for remote streams
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
      this.emit('remote_stream', this.remoteStream);
    };

    // Data channel handler (for receiver)
    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    // Connection state monitoring
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      this.emit('connection_state_change', state);
      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        this.emit('call_ended');
      }
    };
  }

  /**
   * Setup local media stream (Audio/Video)
   */
  async getLocalMedia({ audio = true, video = true } = {}) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio, video });
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
      this.emit('local_stream', this.localStream);
      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices", error);
      throw error;
    }
  }

  /**
   * Create P2P Data Channel for live text/file transfer
   */
  createDataChannel(label = 'liveChat') {
    if (!this.peerConnection) {
      throw new Error("PeerConnection not initialized");
    }
    const channel = this.peerConnection.createDataChannel(label);
    this.setupDataChannel(channel);
    return channel;
  }

  setupDataChannel(channel) {
    this.dataChannel = channel;
    this.dataChannel.onopen = () => {
      this.emit('datachannel_open');
    };
    this.dataChannel.onmessage = (event) => {
      this.emit('datachannel_message', event.data);
    };
    this.dataChannel.onclose = () => {
      this.emit('datachannel_close');
    };
  }

  /**
   * Send message via WebRTC Data Channel
   */
  sendDataChannelMessage(data) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      throw new Error("Data channel is not open");
    }
  }

  /**
   * Caller flow: Create and send SDP Offer
   */
  async createOffer() {
    if (!this.peerConnection) throw new Error("PeerConnection not initialized");
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    signalingService.sendOffer(this.targetUserId, offer);
    return offer;
  }

  /**
   * Callee flow: Handle incoming offer and create Answer
   */
  async handleOfferAndAnswer(offerSdp) {
    if (!this.peerConnection) throw new Error("PeerConnection not initialized");
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    signalingService.sendAnswer(this.targetUserId, answer);
    return answer;
  }

  /**
   * Caller flow: Handle incoming SDP Answer
   */
  async handleAnswer(answerSdp) {
    if (!this.peerConnection) throw new Error("PeerConnection not initialized");
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerSdp));
  }

  /**
   * Add received remote ICE Candidate
   */
  async addIceCandidate(candidate) {
    if (this.peerConnection && candidate) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  /**
   * Register internal event listeners
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    const callbacks = this.eventListeners.get(event).filter(cb => cb !== callback);
    this.eventListeners.set(event, callbacks);
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(cb => cb(data));
    }
  }

  /**
   * Clean up media and peer connection
   */
  cleanUp() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.targetUserId = null;
  }
}

export const webRTCService = new WebRTCService();
export default webRTCService;
