class LocalStreamService {
    constructor() {
        this.connections = new Map();
    }

    async startStream(hiveId) {
        try {
            // Create new connection entry
            this.connections.set(hiveId, {
                id: hiveId,
                status: 'initializing',
                timestamp: new Date().toISOString()
            });

            return {
                status: 'success',
                message: 'Stream initialized',
                hiveId
            };
        } catch (error) {
            console.error('Error starting stream:', error);
            return {
                status: 'error',
                message: 'Failed to start stream',
                error: error.message
            };
        }
    }

    async handleAnswer(hiveId, answer) {
        try {
            const connection = this.connections.get(hiveId);
            if (!connection) {
                throw new Error('No connection found for this hive');
            }

            connection.status = 'connected';
            connection.lastUpdate = new Date().toISOString();
            this.connections.set(hiveId, connection);

            return { status: 'success' };
        } catch (error) {
            return {
                status: 'error',
                message: 'Failed to handle answer',
                error: error.message
            };
        }
    }

    stopStream(hiveId) {
        this.connections.delete(hiveId);
        return { status: 'success', message: 'Stream stopped' };
    }

    isStreamActive(hiveId) {
        const connection = this.connections.get(hiveId);
        return connection && connection.status === 'connected';
    }

    getStreamInfo(hiveId) {
        return this.connections.get(hiveId) || null;
    }
}

module.exports = new LocalStreamService();
