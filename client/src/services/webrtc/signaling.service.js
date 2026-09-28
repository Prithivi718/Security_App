/**
 * WebRTC Signaling Service
 * Manages WebSocket/Socket.IO connections and signaling events for WebRTC peer connection setup.
 */

class SignalingService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    /**
     * Connect to the signaling server.
     * @param {string} url - WebSocket server URL or endpoint
     * @param {string} token - Auth token
     */
    connect(url, token) {
        if (this.socket) {
            return;
        }

        // Standard WebSocket or custom socket initialization
        const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            this.emit('connected');
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { type, payload } = message;
                this.emit(type, payload);
            } catch (err) {
                console.error("Failed to parse signaling message", err);
            }
        };

        this.socket.onclose = () => {
            this.emit('disconnected');
            this.socket = null;
        };

        this.socket.onerror = (error) => {
            this.emit('error', error);
        };
    }

    /**
     * Send a signaling message to a target peer via server
     */
    sendSignal(targetUserId, type, payload) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            throw new Error("Signaling socket is not connected");
        }

        const message = JSON.stringify({
            targetUserId,
            type,
            payload
        });

        this.socket.send(message);
    }

    /**
     * Send WebRTC Offer
     */
    sendOffer(targetUserId, sdp) {
        this.sendSignal(targetUserId, 'webrtc_offer', { sdp });
    }

    /**
     * Send WebRTC Answer
     */
    sendAnswer(targetUserId, sdp) {
        this.sendSignal(targetUserId, 'webrtc_answer', { sdp });
    }

    /**
     * Send ICE Candidate
     */
    sendIceCandidate(targetUserId, candidate) {
        this.sendSignal(targetUserId, 'webrtc_ice_candidate', { candidate });
    }

    /**
     * End call signal
     */
    sendEndCall(targetUserId) {
        this.sendSignal(targetUserId, 'webrtc_end_call', {});
    }

    /**
     * Register event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
        this.listeners.set(event, callbacks);
    }

    /**
     * Emit event internally
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }

    /**
     * Disconnect signaling socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.listeners.clear();
    }
}

export const signalingService = new SignalingService();
export default signalingService;
