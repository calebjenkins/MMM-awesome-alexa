"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Reference: https://developer.amazon.com/public/solutions/alexa/alexa-voice-service/rest/speechrecognizer-recognize-request
const fs = require("fs");
const request = require("request");
const url = "https://access-alexa-na.amazon.com/v1/avs/speechrecognizer/recognize";
class AudioService {
    sendAudio(token, file) {
        const stream = fs.createWriteStream(`${process.env.CWD}/temp/output.mpeg`);
        return new Promise((resolve, reject) => {
            request.post({
                uri: url,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                formData: {
                    metadata: {
                        value: JSON.stringify({
                            messageHeader: {},
                            messageBody: {
                                profile: "alexa-close-talk",
                                locale: "en-us",
                                format: "audio/L16; rate=16000; channels=1",
                            },
                        }),
                        options: {
                            "Content-Disposition": 'form-data; name="metadata"',
                            "Content-Type": "application/json; charset=UTF-8",
                        },
                    },
                    audio: {
                        value: file,
                        options: {
                            "Content-Type": "audio/L16; rate=16000; channels=1",
                            "Content-Disposition": 'form-data; name="audio"',
                        },
                    },
                },
            }, (err, response, body) => {
                if (err !== null) {
                    reject(err);
                    return;
                }
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    reject(body);
                    return;
                }
            }).pipe(stream);
            stream.on("finish", () => {
                if (stream.bytesWritten === 0) {
                    fs.unlink(`${process.env.CWD}/temp/output.mpeg`, () => {
                        resolve();
                    });
                    return;
                }
                resolve();
            });
        });
    }
}
exports.AudioService = AudioService;
