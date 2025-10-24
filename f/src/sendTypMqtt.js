"use strict"; 

var utils = require("../utils"); 

module.exports = function (defaultFuncs, api, ctx) {
    let count_req = 0;
    
    function makeTypingIndicator(typ, threadID, callback) {
        if (!ctx.mqttClient || !ctx.mqttClient.connected) {
            if (typeof callback === "function") {
                callback(new Error("MQTT client not connected"));
            }
            return;
        }
        threadID = utils.formatID(threadID.toString());
        
        try {
            var wsContent = { 
                app_id: 2220391788200892, 
                payload: JSON.stringify({ 
                    label: 3, 
                    payload: JSON.stringify({ 
                        thread_key: threadID, 
                        is_group_thread: +(threadID.length >= 16), 
                        is_typing: +typ, 
                        attribution: 0 
                    }), 
                    version: 5849951561777440 
                }), 
                request_id: ++count_req, 
                type: 4 
            };
            
            ctx.mqttClient.publish('/ls_req', JSON.stringify(wsContent), {}, (err, _packet) => {
                if (typeof callback === "function") {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                }
            });
        } catch (err) {
            if (typeof callback === "function") {
                callback(err);
            }
        }
    }
    
    return function sendTypMqtt(threadID, callback) {
        if (
            utils.getType(callback) !== "Function" &&
            utils.getType(callback) !== "AsyncFunction"
        ) {
            if (callback) {
                console.warn("sendTypMqtt", "callback is not a function - ignoring.");
            }
            callback = () => { };
        }
        
        makeTypingIndicator(true, threadID, callback);
        
        return function end(cb) {
            if (
                utils.getType(cb) !== "Function" &&
                utils.getType(cb) !== "AsyncFunction"
            ) {
                if (cb) {
                    console.warn("sendTypMqtt", "callback is not a function - ignoring.");
                }
                cb = () => { };
            }
            
            makeTypingIndicator(false, threadID, cb);
        };
    };
};