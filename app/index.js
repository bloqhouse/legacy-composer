/**
 * Index.js
 *
 * Copyright Bloqhouse NL BV. 2017 All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *		 http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var config = require('config').get('admin');

var participantId = config.get('participantId');
var participantPwd = config.get('participantPwd');
var connectionProfile = config.get('connectionProfile');
var businessNetworkIdentifier = config.get('businessNetworkIdentifier');

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
var bizNetworkConnection = new BusinessNetworkConnection();
var bizNetworkDefinition = undefined;

var fundId = 'Herengracht179';

var fundManager = 'realestatepro';
var notary = 'honesty';
var escrow = 'escrow';
var bh1 = 'jeroen';
var bh2 = 'tim';
var bloq = undefined;

function assets(){
  return bizNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
    .then((bizNetworkDef) => {

      bizNetworkDefinition = bizNetworkDef;
      var random = Math.floor(Math.random() * 999999999999).toString();
      var tx = {'$class':'org.notarynodes.bloqNetwork.CreateFund', 'fundId':fundId, 'creator':fundManager, 'properties':'PROP#3', 'signer':notary, 'transactionId':random};
      var serializer = bizNetworkDefinition.getSerializer();
      var resource = serializer.fromJSON(tx);
      console.log("Submitting: ");console.log(tx);
      return bizNetworkConnection.submitTransaction(resource);

    })
    .then(() => {

      var random = Math.floor(Math.random() * 999999999999).toString();
      var tx = {'$class':'org.notarynodes.bloqNetwork.Sign', 'assetType':'Fund', 'assetId':fundId, 'signer':notary, 'transactionId':random};
      var serializer = bizNetworkDefinition.getSerializer();
      var resource = serializer.fromJSON(tx);
      console.log("Submitting: ");console.log(tx);
      return bizNetworkConnection.submitTransaction(resource);

    })
    .then(() => {

      var random = Math.floor(Math.random() * 999999999999).toString();
      var tx = {'$class':'org.notarynodes.bloqNetwork.BloqEmission', 'fund':fundId, 'escrow':escrow, 'count':'100', 'signer':notary, 'transactionId':random};
      var serializer = bizNetworkDefinition.getSerializer();
      var resource = serializer.fromJSON(tx);
      console.log("Submitting: ");console.log(tx);
      return bizNetworkConnection.submitTransaction(resource);

    })
    .then(() => {

      return bizNetworkConnection.getAssetRegistry('org.notarynodes.bloqNetwork.Bloq');

    })
    .then((registry) => {

      return registry.getAll();

    })
    .then((bloqs) => {

      bloqs.forEach(function(element) { if (element.fund.getIdentifier().toString() == fundId){ bloq = element.getIdentifier().toString(); }});
      var random = Math.floor(Math.random() * 999999999999).toString();
      var tx = {'$class':'org.notarynodes.bloqNetwork.Sign', 'assetType': 'Bloq', 'assetId':bloq, 'signer':notary, 'transactionId':random};
      var serializer = bizNetworkDefinition.getSerializer();
      var resource = serializer.fromJSON(tx);
      console.log("Submitting: ");console.log(tx);
      return bizNetworkConnection.submitTransaction(resource);

    })
    .then(() => {

      var random = Math.floor(Math.random() * 999999999999).toString();
      var tx = {'$class':'org.notarynodes.bloqNetwork.BloqTransfer', 'origin':bloq, 'destinations':[escrow,bh1,bh2], 'counts':['60','30','10'], 'transactionId':random};
      var serializer = bizNetworkDefinition.getSerializer();
      var resource = serializer.fromJSON(tx);
      console.log("Submitting: ");console.log(tx);
      return bizNetworkConnection.submitTransaction(resource);

    })
    .then(() => {

      return bizNetworkConnection.disconnect();

    });
}

assets();
