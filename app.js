/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger Platform Quick Start Tutorial
 *
 * This is the completed code for the Messenger Platform quick start tutorial
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 * To run this code, you must do the following:
 *
 * 1. Deploy this code to a server running Node.js
 * 2. Run `yarn install`
 * 3. Add your VERIFY_TOKEN and PAGE_ACCESS_TOKEN to your environment vars
 */

"use strict";

// Use dotenv to read .env vars into Node
require("dotenv").config();

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  { urlencoded, json } = require("body-parser"),
  app = express();
const axios = require("axios");
// Sets server port and logs message on success
const port = 3000;

// Parse application/x-www-form-urlencoded
app.use(urlencoded({ extended: true }));

// Parse application/json
app.use(json());

// Respond with 'Hello World' when a GET request is made to the homepage
app.get("/", function (_req, res) {
  res.send("Hello World");
});

// Adds support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  // const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  console.log("get method");
  const VERIFY_TOKEN = "test_token";
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Creates the endpoint for your webhook
app.post("/webhook", (req, res) => {
  let body = req.body;

  // Checks if this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhookEvent = entry.standby[0];
      console.log(webhookEvent);
      try {
        const url =
          "http://41.32.245.59:210/ksiapisocialmedia/MessengerNotification";
        // let requestBody = {
        //   senderId: "fff",
        //   recipientId: "fff",
        //   timestamp: 17564654,
        //   Messege: {
        //     id: "ffff",
        //     text: "hello world",
        //   },
        // };
        const response = axios.post(url, webhookEvent);
        res.status(response.status).json(response.data);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }

      // Get the sender PSID
      let senderPsid = webhookEvent.sender.id;
      console.log("Sender PSID: " + senderPsid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(senderPsid, webhookEvent.postback);
      }
    });
    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});
// request({
//   'uri': 'http://localhost/KsiApi/GetMessangerMessages',
//   'method': 'GET',
// }, (err, _res, _body) => {
//   console.log(_res.body);
//   if (!err) {
//     console.log('Message sent!');
//   } else {
//     console.error('Unable to send message:' + err);
//   }
// });
// Handles messages events
// function handleMessage(senderPsid, receivedMessage) {
//   let response;

//   // Checks if the message contains text
//   if (receivedMessage.text) {
//     // Create the payload for a basic text message, which
//     // will be added to the body of your request to the Send API
//     response = {
//       text: `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`,
//     };
//   } else if (receivedMessage.attachments) {
//     // Get the URL of the message attachment
//     let attachmentUrl = receivedMessage.attachments[0].payload.url;
//     response = {
//       attachment: {
//         type: "template",
//         payload: {
//           template_type: "generic",
//           elements: [
//             {
//               title: "Is this the right picture?",
//               subtitle: "Tap a button to answer.",
//               image_url: attachmentUrl,
//               buttons: [
//                 {
//                   type: "postback",
//                   title: "Yes!",
//                   payload: "yes",
//                 },
//                 {
//                   type: "postback",
//                   title: "No!",
//                   payload: "no",
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     };
//   }

//   // Send the response message
//   callSendAPI(senderPsid, response);
// }

// Handles messaging_postbacks events
// function handlePostback(senderPsid, receivedPostback) {
//   let response;

//   // Get the payload for the postback
//   let payload = receivedPostback.payload;

//   // Set the response based on the postback payload
//   if (payload === "yes") {
//     response = { text: "Thanks!" };
//   } else if (payload === "no") {
//     response = { text: "Oops, try sending another image." };
//   }
//   // Send the message to acknowledge the postback
//   callSendAPI(senderPsid, response);
// }

// Sends response messages via the Send API
// function callSendAPI(senderPsid, response) {
//   // The page access token we have generated in your app settings
//   const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

//   // Construct the message body
//   // let requestBody = {
//   //   'recipient': {
//   //     'id': senderPsid
//   //   },
//   //   'message': response,
//   //   'messaging_type': 'RESPONSE',
//   // };
//   let requestBody = {
//     senderId: "fff",
//     recipientId: "fff",
//     timestamp: 17564654,
//     Messege: {
//       id: "ffff",
//       text: "ddfffff",
//     },
//   };
//   // Send the HTTP request to the Messenger Platform
//   // request({
//   //   'uri': 'https://graph.facebook.com/v18.0/111445836871456/messages',
//   //   'qs': { 'access_token': PAGE_ACCESS_TOKEN },
//   //   'method': 'POST',
//   //   'json': requestBody
//   // }, (err, _res, _body) => {
//   //   if (!err) {
//   //     console.log('Message sent!');
//   //   } else {
//   //     console.error('Unable to send message:' + err);
//   //   }
//   // });

//   request(
//     {
//       uri: "http://41.32.245.59:210/ksiapisocialmedia/MessengerNotification",
//       method: "POST",
//       json: requestBody,
//     },
//     (err, _res, _body) => {
//       if (!err) {
//         console.log("Message sent!");
//       } else {
//         console.error("Unable to send message:" + err);
//       }
//     }
//   );
// }

// Verify that the callback came from Facebook.
// function verifyRequestSignature(req, res, buf) {
//   var signature = req.headers["x-hub-signature-256"];

//   if (!signature) {
//     console.warn(`Couldn't find "x-hub-signature-256" in headers.`);
//   } else {
//     var elements = signature.split("=");
//     var signatureHash = elements[1];
//     var expectedHash = crypto
//       .createHmac("sha256", config.appSecret)
//       .update(buf)
//       .digest("hex");
//     if (signatureHash != expectedHash) {
//       throw new Error("Couldn't validate the request signature.");
//     }
//   }
// }

// // listen for requests :)
// var listener = app.listen(process.env.PORT, function() {
//   console.log('Your app is listening on port ' + listener.address().port);
// });
app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}/webhook`);
});
