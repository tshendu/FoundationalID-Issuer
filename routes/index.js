"use strict";

// var express = require('express');
const express = require("express");
var url = require("url");
// const request = require("request");
const request = require("request-promise");
var http = require('http');
var router = express.Router();
const debug = require("debug")("my-issuer-app");
const jwt = require('jsonwebtoken');

// const mariadb = require("mariadb");

//evernyms code start
const fs = require("fs");
const axios = require("axios");
// const express = require('express') //repeated
const QR = require("qrcode");
const uuid4 = require("uuid4");
const urljoin = require("url-join");

const ANSII_GREEN = "\u001b[32m";
const ANSII_RESET = "\x1b[0m";
const CRED_DEF_FILE = "public/images/cred_def_id.txt";

const verityUrl = "https://vas.pps.evernym.com"; // address of Verity Application Service
var domainDid = "JSEWYK4KKToxmPQQMrmGxn"; // your Domain DID on the multi-tenant Verity Application Service
var xApiKey =
  "Ho2snpJSVBYSYMq2ffDHEaTqpD9H5Eqfg28EsyxXL5Zh:3nXg4v7QvWxKWUXGGmFMNaYm4MY6UgNgeNU5L43XGaVtrJHf6fTFxAn6VfCU1T8uNEFMW7JwSmwzAYw4uvCzfDMp"; // REST API key associated with your Domain DID
//end evernym's code

var creddefid = "Az7EziYKwtpbtb3wtfgbsG:3:CL:281718:latest";




var vasOperationStatus; //to check the operation of VAS response
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("TashiB/indexTB", { title: "DCRC" });
});

router.get("/update-webhook", function (req, res, next) {
  res.render("TashiB/updateWdbhook", { title: "Update Webhook" });
});

router.get("/relationship", function (req, res, next) {
  res.render("TashiB/relationship", {
    domaindid: domainDid,
    title: "Create Relation",
  });
});

router.get('/cid-request', async(req, res) => {
  console.log(req.query.cid);
  // var token = 'eyJ4NXQiOiJZamxtTmprM1lXTTFPVFEwWkdNeVpHSXlZVGN5TkRjMk1ERTVOelZsWW1JeVkyUmxPRGRrWlEiLCJraWQiOiJPVEV3TXpVeU1EazNZekF4WWpVNFlqaGtNbU5pTVRNM1pUQmlZamhsTmpNek5UQmpOVE0zTlRZMk5EbGpORFl5WWpSallUY3hNMlE0TTJNek5qVTFPQV9SUzI1NiIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkaXR0b3BlbiIsImF1dCI6IkFQUExJQ0FUSU9OIiwiYXVkIjoiOFJkTm9qbUtvTXcxNGgzdVJXcWJuTjM0ZzM4YSIsIm5iZiI6MTY1NzI1NzAyOSwiYXpwIjoiOFJkTm9qbUtvTXcxNGgzdVJXcWJuTjM0ZzM4YSIsInNjb3BlIjoicmVhZCIsImlzcyI6Imh0dHBzOlwvXC9zdGctc3NvLmRpdC5nb3YuYnRcL29hdXRoMlwvdG9rZW4iLCJleHAiOjE2NTcyNjA2MjksImlhdCI6MTY1NzI1NzAyOSwianRpIjoiNGRkZjgyOTYtMWE1Yy00MGJiLTlhNzEtMDgyMjlhNDMxYWEwIn0.K33JAFZtc4ZrHnP8r1RZwa1g_kkZ7QC-fHS_OldSRlwwJAgEVUTlbnQIZMetRZSqHvMTY43pMmILltTZb3hyKzDHjJQmfgEchoNPYQsdynAX51Na73sj0ixHoqx8145XqJUoTQ7zuB7zXT-HZSeuqzvc5mEw9yAGQwnZxOs4_za5EwJ-kuFom2m_YzflFG6x7vUAW8vwDyqaFDRu6Krxx7T87FK0W7vx8ZYZGDCvuh0JhCzGM_74hm86kPMGRCof9mtcO5i01_yZDf7gUu16BisD9bn7ATJKna5jn2gO7CdVkPTeFwnD3oqldA029rmVa1UxUZyPRm44eYdipjZ7SA'
  var token = 'eyJ4NXQiOiJZamxtTmprM1lXTTFPVFEwWkdNeVpHSXlZVGN5TkRjMk1ERTVOelZsWW1JeVkyUmxPRGRrWlEiLCJraWQiOiJPVEV3TXpVeU1EazNZekF4WWpVNFlqaGtNbU5pTVRNM1pUQmlZamhsTmpNek5UQmpOVE0zTlRZMk5EbGpORFl5WWpSallUY3hNMlE0TTJNek5qVTFPQV9SUzI1NiIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkaXR0b3BlbiIsImF1dCI6IkFQUExJQ0FUSU9OIiwiYXVkIjoiOFJkTm9qbUtvTXcxNGgzdVJXcWJuTjM0ZzM4YSIsIm5iZiI6MTY1NzUzNTI5OCwiYXpwIjoiOFJkTm9qbUtvTXcxNGgzdVJXcWJuTjM0ZzM4YSIsInNjb3BlIjoicmVhZCIsImlzcyI6Imh0dHBzOlwvXC9zdGctc3NvLmRpdC5nb3YuYnRcL29hdXRoMlwvdG9rZW4iLCJleHAiOjE2NTc1Mzg4OTgsImlhdCI6MTY1NzUzNTI5OCwianRpIjoiNGZhZmYwYmItNjYxNC00YTFmLTkwODEtNDg0NzkyNzgzZTgxIn0.lQnwv7cOJsjYQqypYiDe49Ciw6eWYT33NUMdW-r6mM9qHoF41Fesl-AWRKJnsBcbxIThivmuuUJ5Ndx7_0Ri8Yvpauno-pkoOyFvAnEBbeyfuzMZBcUa3hmST9C3teVQbL0D5kix2iI1K4d9HzAfjL7-c33mpU0y6uJ9qm8-7htcTW1gBdoirXdiu0YihpxF6P8hF-CTQO_9byiHpIDyVHUqH0-F-JgGbkBh9oLk10G0PLOFFkr49In9y_RYO3PAsyfkWUKUg-39p0t1izjAHPmz52BGbu6pBpp30IJPrsyVmZfM3HmTV8mGfFG1h4vwALes34H9qtVwQuhUN9KJBg';
  /* validate token call expiry*/
  
    // if (token && jwt.decode(token)) {
      var isTokenExpired = 0;
      const expiry = jwt.decode(token).exp;
      var expiry1 = new Date(expiry);
      const now = new Date();
      console.log(expiry);
      console.log(expiry1);
      console.log(now);
      if(now.getTime() > expiry *1000){
       isTokenExpired=1;
        console.log("expired!")
      }
      else{
        isTokenExpired=0;
        console.log("valid date")
      }
    // }
    // console.log(ss);
/* test dcrc api calls*/
if(isTokenExpired ==1){

}
else{
}
const external_url= 'https://apim.staging.api.gov.bt/dcrc_individualcitizendetailapi/1.0.0/citizendetail/'+req.query.cid+'';
var options = {
  url: external_url,
  method: 'GET',
  json: null,
  headers: {
    'User-Agent': 'my request',
    'Authorization': 'Bearer eyJ4NXQiOiJZamxtTmprM1lXTTFPVFEwWkdNeVpHSXlZVGN5TkRjMk1ERTVOelZsWW1JeVkyUmxPRGRrWlEiLCJraWQiOiJPVEV3TXpVeU1EazNZekF4WWpVNFlqaGtNbU5pTVRNM1pUQmlZamhsTmpNek5UQmpOVE0zTlRZMk5EbGpORFl5WWpSallUY3hNMlE0TTJNek5qVTFPQV9SUzI1NiIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkaXR0b3BlbiIsImF1dCI6IkFQUExJQ0FUSU9OIiwiYXVkIjoiOFJkTm9qbUtvTXcxNGgzdVJXcWJuTjM0ZzM4YSIsIm5iZiI6MTY1NzI1NzAyOSwiYXpwIjoiOFJkTm9qbUtvTXcxNGgzdVJXcWJuTjM0ZzM4YSIsInNjb3BlIjoicmVhZCIsImlzcyI6Imh0dHBzOlwvXC9zdGctc3NvLmRpdC5nb3YuYnRcL29hdXRoMlwvdG9rZW4iLCJleHAiOjE2NTcyNjA2MjksImlhdCI6MTY1NzI1NzAyOSwianRpIjoiNGRkZjgyOTYtMWE1Yy00MGJiLTlhNzEtMDgyMjlhNDMxYWEwIn0.K33JAFZtc4ZrHnP8r1RZwa1g_kkZ7QC-fHS_OldSRlwwJAgEVUTlbnQIZMetRZSqHvMTY43pMmILltTZb3hyKzDHjJQmfgEchoNPYQsdynAX51Na73sj0ixHoqx8145XqJUoTQ7zuB7zXT-HZSeuqzvc5mEw9yAGQwnZxOs4_za5EwJ-kuFom2m_YzflFG6x7vUAW8vwDyqaFDRu6Krxx7T87FK0W7vx8ZYZGDCvuh0JhCzGM_74hm86kPMGRCof9mtcO5i01_yZDf7gUu16BisD9bn7ATJKna5jn2gO7CdVkPTeFwnD3oqldA029rmVa1UxUZyPRm44eYdipjZ7SA',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
var firstName = '';
var lastName='';
var gender='';
var dob ='';
var householdNo ='';


var callback =  (error, response, body) => {
  
  if(response.statusCode ==401){
    res.status(401).end({message:"error"})
    
  }
  else if(res.statusCode==200){
    console.log(body);
    console.log(response.statusCode);
    var string = JSON.stringify(body);
         var objectValue = JSON.parse(body);
         console.log(objectValue.citizendetails.citizendetail);
         var citizendetails = objectValue.citizendetails.citizendetail;
  
         console.log(citizendetails.map(o=>o.firstName));
  
          firstName = citizendetails.map(o => o.firstName)
          lastName = citizendetails.map(o => o.lastName)
          gender = citizendetails.map(o => o.gender)
          dob = citizendetails.map(o => o.dob)
          householdNo = citizendetails.map(o => o.householdNo)   
  }
  else{
 console.log("error")
  }
}
try{
 await request(options, callback);
}
catch(err){
  console.log("errordfkjkjjkjjkjjkjkljkjkjkjkjjkjkjk")
  // res.status(400).send({message:"dfdffd"})
}
// console.log(res.status)

// res.status(200).send({firstname: firstName, lastName: lastName, gender:gender, dob:dob, household_number: householdNo });

})


router.get("/issue-credentials", function (req, res, next) {
  res.render("TashiB/issuecred", { creddefid: creddefid, title: "Issue Credentials", firstname:"" });
});

// ----------------------------Databse Part-----------------------
// async function insertIntoTable(query, preparedparam) {
// let conn;
// try {
// conn = await pool.getConnection();
// const rows = await conn.query(query, preparedparam);

// console.log(rows); //[ {val: 1}, meta: ... ]
// } catch (err) {
// console.log(err);
// throw err;
// } finally {
// if (conn) return conn.end();
// }
// }
// ----------------------------------------------------------------

router.get("/webhook_update", async function (req, res) {
  var webhookurl = req.query.webhookurl;
  var webhookurlFinal = webhookurl + "/webhook"; //append /webhook endpoint
  await updateWebhookEndpoint(webhookurlFinal)
    .then(function () {
      var currentUrl = req.url;
      var urlname = url.parse(currentUrl, true);

      // let query =
      ("INSERT INTO t_webhookendpoint (domaindid, webhookendpoint) VALUES (?, ?);");
      // insertIntoTable(query, [domainDid, webhookurl]);
      res.render("success", {
        message: "Webhook Endpoint Updated Successfully",
        routename: urlname.pathname,
      });
    })
    .catch(function (err) {
      console.log("WRONG ENDPOINT");
      debug("fail");
      res.render("fail", { message: "Something went wrong" });
    });
});

router.get("/create_relationdid", async function (req, res) {
  await createRelation();
  var currentUrl = req.url;
  var urlname = url.parse(currentUrl, true);

  // let query =
  // "INSERT INTO t_relationshipdid (domaindid, relatioinshipdid) VALUES (?, ?);";
  // insertIntoTable(query, [domainDid, relationshipDidGlobal]);

  res.render("success", {
    message:
      "Scan QR Code from connect.me<br> <b>Relationship DID: </b>" +
      relationshipDidGlobal +
      "<br><i>Please save RelationshipDID to issue credential.</i>",
    routename: urlname.pathname,
    qrcode: "qrcode.png",
  });
});


router.get("/issue_credential", async function (req, res) {
  // var credentialInputData = req.query.credentialData;
  // credentialInputData = '{"name": "sonam", "age": "20", "gender" : "male", "empid": "758"}';
  var credentialInputData = "{";
  credentialInputData += '"First Name":"' + req.query.first_name + '",';
  credentialInputData += '"Last Name": "' + req.query.last_name + '",';
  credentialInputData += '"Gender": "' + req.query.gender + '",';
  credentialInputData += '"Date of Birth": "' + req.query.dob + '",';
  // credentialInputData += '"Household Number": "' + '",';
  credentialInputData += '"Middle Name": "",';
  // credentialInputData += '"Mode of Operation": "",';

  // credentialInputData += '"Middle Name": "' + req.query.middle_name + '",';

  credentialInputData +=  '"Household Number": "' + req.query.household_number + '" ';

  credentialInputData += "}"; //end json string

  console.log(credentialInputData);
  // process.exit(1);
  var creddefid = req.query.creddefid;
  var relationshipdid = req.query.relationshipdid;
  var remark = req.query.remark;
  await issueCredential(
    credentialInputData,
    creddefid,
    relationshipdid,
    remark
  );

  var currentUrl = req.url;
  var urlname = url.parse(currentUrl, true);

  // let query =
  // "INSERT INTO t_credential (domaindid, credential_data, credef_id, relationshipdid, remarks) VALUES (?, ?, ?, ?, ?);";
  // insertIntoTable(query, [
  // domainDid,
  // JSON.stringify(credentialInputData),
  // creddefid,
  // relationshipdid,
  // remark,
  // ]);

  res.render("success", {
    message: "Credential Issued Successfully",
    routename: urlname.pathname,
  });
});

// router.get("/success", function (req, res, next) {
// res.render("success", { message: "Issuer Setup Successful!" });
// });
//
// router.get("/fail", function (req, res, next) {
// res.render("fail", { message: "Issuer Setup Operation Failed!" });
// });

//Actual Evernym's method

// Sends a message to the Verity Application Service via the Verity REST API
async function sendVerityRESTMessage(
  qualifier,
  msgFamily,
  msgFamilyVersion,
  msgName,
  message,
  threadId
) {
  debug("inside sendverity");
  message[
    "@type"
  ] = `did:sov:${qualifier};spec/${msgFamily}/${msgFamilyVersion}/${msgName}`;
  message["@id"] = uuid4();

  if (!threadId) {
    threadId = uuid4();
  }

  // send prepared message to Verity and return Axios request promise
  const url = urljoin(
    verityUrl,
    "api",
    domainDid,
    msgFamily,
    msgFamilyVersion,
    threadId
  );
  console.log(`Posting message to ${ANSII_GREEN}${url}${ANSII_RESET}`);
  console.log(
    `${ANSII_GREEN}${JSON.stringify(message, null, 4)}${ANSII_RESET}`
  );
  return axios({
    method: "POST",
    url: url,
    data: message,
    headers: {
      "X-API-key": xApiKey, // <-- REST API Key is added in the header
    },
  });
}

// Maps containing promises for the started interactions - threadId is used as the map key
// Update configs
const updateConfigsMap = new Map();
// Relationship create
const relCreateMap = new Map();
// Relationship invitation
const relInvitationMap = new Map();
// Issue Credential
const issueCredentialMap = new Map();

// Map for connection accepted promise - relationship DID is used as the map key
const connectionAccepted = new Map();

// Update webhook protocol is synchronous and does not support threadId
let webhookResolve;

async function updateWebhookEndpoint(webhookurl) {
  debug("inside updatewebhok function");
  const webhookMessage = {
    comMethod: {
      id: "webhook",
      type: 2,
      value: webhookurl,
      packaging: {
        pkgType: "plain",
      },
    },
  };

  const updateWebhook = new Promise(function (resolve, reject) {
    webhookResolve = resolve;
    sendVerityRESTMessage(
      "123456789abcdefghi1234",
      "configs",
      "0.6",
      "UPDATE_COM_METHOD",
      webhookMessage
    ).catch(function (err) {
      console.log("WRONG ENDPOINT");
      reject(new Error("Something went wrong, please enter a valid endpoint"));
    });
  });

  // await updateWebhook
  await updateWebhook.catch(function (err) {
    console.log("WRONG ENDPOINT");
    throw new Error("something went wrong...");
  });
}

let relationshipDidGlobal;

async function createRelation() {
  // STEP 5 - Relationship creation
  // create relationship key
  const relationshipCreateMessage = {};
  const relThreadId = uuid4();
  const relationshipCreate = new Promise(function (resolve, reject) {
    relCreateMap.set(relThreadId, resolve);
  });

  await sendVerityRESTMessage(
    "123456789abcdefghi1234",
    "relationship",
    "1.0",
    "create",
    relationshipCreateMessage,
    relThreadId
  );
  const relationshipDid = await relationshipCreate;
  relationshipDidGlobal = relationshipDid;

  // create invitation for the relationship
  const relationshipInvitationMessage = {
    "~for_relationship": relationshipDid,
    goalCode: "issue-vc",
    goal: "To issue a credential",
    shortInvite: true,
  };
  const relationshipInvitation = new Promise(function (resolve, reject) {
    relInvitationMap.set(relThreadId, resolve);
  });

  await sendVerityRESTMessage(
    "123456789abcdefghi1234",
    "relationship",
    "1.0",
    "out-of-band-invitation",
    relationshipInvitationMessage,
    relThreadId
  );
  const inviteUrl = await relationshipInvitation; //shorturl
  console.log(`Invite URL is:\n${ANSII_GREEN}${inviteUrl}${ANSII_RESET}`);
  await QR.toFile("public/images/qrcode.png", inviteUrl);

  // wait for the user to scan the QR code and accept the connection
  const connection = new Promise(function (resolve, reject) {
    connectionAccepted.set(relationshipDid, resolve);
  });
  console.log('Open the file "qrcode.png" and scan it with the ConnectMe app');

  // await connection  // SD Edit. Otherwise it is not navigating to success page
}

async function issueCredential(
  credentialInputData,
  creddefid,
  relationshipdid,
  remarks
) {
  // credentialInputData = '{"name": "sonam", "age": "20", "gender" : "male", "empid": "758"}';

  // STEP 6 - Credential issuance
  const credentialData = JSON.parse(credentialInputData);

  const credentialMessage = {
    "~for_relationship": relationshipdid,
    cred_def_id: creddefid,
    credential_values: credentialData,
    price: 0,
    comment: remarks,
    auto_issue: true,
  };
  const issueCredThreadId = uuid4();

  const credentialOffer = new Promise(function (resolve, reject) {
    issueCredentialMap.set(issueCredThreadId, resolve);
  });

  await sendVerityRESTMessage(
    "BzCbsNYhMrjHiqZDTUASHg",
    "issue-credential",
    "1.0",
    "offer",
    credentialMessage,
    issueCredThreadId
  );
  await credentialOffer;

  console.log("Demo completed!");
  // process.exit(0)
}

// Verity Application Server will send REST API callbacks to this endpoint
router.post("/webhook", async (req, res) => {
  const message = req.body;
  const threadId = message["~thread"] ? message["~thread"].thid : null;
  console.log("Got message on the webhook");
  console.log(
    `${ANSII_GREEN}${JSON.stringify(message, null, 4)}${ANSII_RESET}`
  );
  res.status(202).send("Accepted");
  // Handle received message differently based on the message type
  switch (message["@type"]) {
    case "did:sov:123456789abcdefghi1234;spec/configs/0.6/COM_METHOD_UPDATED":
      webhookResolve("webhook updated");
      break;
    case "did:sov:123456789abcdefghi1234;spec/relationship/1.0/created":
      relCreateMap.get(threadId)(message.did);
      break;
    case "did:sov:123456789abcdefghi1234;spec/relationship/1.0/invitation":
      relInvitationMap.get(threadId)(message.shortInviteURL);
      break;
    case "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request-received":
      break;
    case "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response-sent":
      connectionAccepted.get(message.myDID)("connection accepted");
      break;
    case "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/sent-response":
      break;
    case "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/out-of-band/1.0/relationship-reused":
      console.log(
        "The mobile wallet app signalled that it already has the connection with this Issuer"
      );
      console.log(
        "This application does not support relationship-reuse since it does not store the data about previous relationships"
      );
      console.log(
        "Please delete existing connection with this Issuer in your mobile app and re-run the application"
      );
      console.log(
        'To learn how relationship-reuse can be used check out "ssi-auth" or "out-of-band" sample apps'
      );
      break;
    // process.exit(1)
    case "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/sent":
      if (message.msg["credentials~attach"]) {
        issueCredentialMap.get(threadId)("credential issued");
      }
      break;
    default:
      console.log(`Unexpected message type ${message["@type"]}`);
      // if(!message['@type'] == 'did:sov:123456789abcdefghi1234;spec/write-schema/0.6/needs-endorsement'){ //dont terminate if asked for endorsement while writing schema
      process.exit(1);
    // }
  }
});

module.exports = router;
