//Todo - do this a singleton!
define(['Utils'], function (Utils) {
    return function MessageCenter() {
        this.subscriptions = [];
        this.subscribe = function (message, subscriber) {
            console.log('%c[Message Center]' + subscriber.subscriber + ' subscribed to:' + message, 'background: #222; color: #bada55')
            var i = 0;
            var l = this.subscriptions.length
            for (; i < l; i++) {
                if (this.subscriptions[i].message == message) break;
            }
            if (i == this.subscriptions.length) {
                this.subscriptions.push({
                    message: message,
                    subscribers: [subscriber]
                })
            } else {
                var j = 0;

                for (; j < this.subscriptions[i].subscribers.length; j++) {
                    if (this.subscriptions[i].subscribers[j].subscriber == subscriber.subscriber) break;
                }
                this.subscriptions[i].subscribers[j] = subscriber;
                return true;

            }

        }
        this.publish = function (message, args) {
            var txtArgs = (args)?", data:"+JSON.stringify(args): "";
            console.log('%c[Message Center] Published:' + message + txtArgs, 'background: #222; color: #bada55')
            var i = 0,
                l = this.subscriptions.length
            for (; i < l; i++) {
                if (this.subscriptions[i].message == message) break;
            }
            if ((i==l)) return; //Have not any subscribers
            if (this.subscriptions[i].subscribers && this.subscriptions[i].subscribers[0]) {
                var l = this.subscriptions[i].subscribers.length,
                    j = 0;
                for (; j < l; j++) {
                    var s = this.subscriptions[i].subscribers[j];
                    window.test = {
                        s: s,
                        args: args
                    }
                    s.callback.call(s.subscriber, args);
                    if(s.once) delete s;

                }
            }
        }
    }
})