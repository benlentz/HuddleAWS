var http = require('http');

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.3d7e4959-00ed-471f-9e6f-85a3d368f425") {
             context.fail("Invalid Application ID");
        }
        

        if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        }
    } catch (e) {
        console.error(e);
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("HuddleGetMeetingRoom" === intentName) {
        getMeetingRoom(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

// --------------- Functions that control the skill's behavior -----------------------

function getMeetingRoom(intent, session, callback) {
    var options = {
      host: 'slalomhuddleoutlookapi.azurewebsites.net',
      port: 80,
      path: '/api/rooms',
      method: 'GET'
    };
    console.log('OPTIONS: ' + options);

    http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (data) {
        console.log('BODY: ' + data);
        var dataAsObject = JSON.parse(data);
        callback(null, buildSpeechletResponse(dataAsObject.Text));
      });
    }).end();
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(output) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        }
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}