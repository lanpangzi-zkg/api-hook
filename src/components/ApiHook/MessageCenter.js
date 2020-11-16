const messageCenter = {
    listeners: [],
    postOriginMessage: function(data) {
        dispatchMessage(this.listeners, data, 'onOriginMessage');
    },
    postEditMessage: function(data) {
        dispatchMessage(this.listeners, data, 'onEditMessage');
    },
    observe: function(listener) {
        this.listeners.push(listener);
    }
};

function dispatchMessage(listeners, data, fn) {
    listeners.forEach((listener) => {
        if (typeof listener[fn] === 'function') {
            listener[fn](data);
        }
    });
}

export default messageCenter;
