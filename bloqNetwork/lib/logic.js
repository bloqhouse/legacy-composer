/**
 * Logic.js
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

/**
 * Check Bloq validity
 * Helper function
 */
function checkSig(asset){
  var assetType = asset.getType();
  var notary = asset.signer.getIdentifier().toString();
  var signatureId = notary + "#" + assetType + "#" + asset.getIdentifier().toString();
  return getAssetRegistry('org.notarynodes.bloqNetwork.Signature')
      .then(function (registry) {
        return registry.get(signatureId);
      })
      .then(function (signature) {
        if (signature.signer.getIdentifier().toString() == notary) { console.log('Signature is ok'); return true; }
        else { return false; }
      })
      .catch(function (error) {
        throw new Error("No signature found");
      });
}


/**
 * Check Bloq validity
 * Helper function
 */
function checkBloqValidity(bloq){
  if (bloq.emission){
    console.log('Bloq is an emission bloq');
    return checkSig(bloq)
      .then(function (check) {
        if (check != true) { console.log("Emission bloq is not signed by the notary"); return false; }
        else { console.log("Emission bloq is valid"); return true;}
      });
  }
  else {
    var aID = bloq.getIdentifier().toString();
    var aCount = bloq.count.toString();
    var aStart = bloq.start.toString();
    for(var i = 0; i < bloq.origin.destinations.length; i++){
        var bID = bloq.origin.destinations[i].getIdentifier().toString();
        var bCount = bloq.origin.destinations[i].count.toString();
        var bStart = bloq.origin.destinations[i].start.toString();
        // Todo implement all relevant checks
        if ((aID == bID) && (aCount == bCount) && (aStart == bStart)){
          console.log("Current bloq points to a valid origin bloq, now evaluating the origin bloq");
          return checkBloqValidity(bloq.origin);
        }
    }
  }
}


/**
 * Create fund
 * @param {org.notarynodes.bloqNetwork.CreateFund} transaction - the transaction transaction
 * @transaction
 */
function onCreateFund(transaction) {
  return getAssetRegistry('org.notarynodes.bloqNetwork.Fund')
    .then(function (registry) {
      var factory = getFactory();
      var newFund = factory.newResource('org.notarynodes.bloqNetwork', 'Fund', transaction.fundId);
      newFund.fundManager = transaction.creator;
      newFund.signer = transaction.signer;
      newFund.properties = transaction.properties;
      newFund.timestamp = new Date();
      return registry.add(newFund);
    });
}


/**
 * Sign asset
 * @param {org.notarynodes.bloqNetwork.Sign} transaction - the transaction transaction
 * @transaction
 */
function onSign(transaction) {
  // throw new Error("This does work")
  var signer = transaction.signer.getIdentifier().toString();
  return getAssetRegistry("org.notarynodes.bloqNetwork."+transaction.assetType)
    .then(function (registry) {
      return registry.get(transaction.assetId);
    })
    .then(function (asset) {
      if (asset.signer.getIdentifier().toString() != signer ){ throw new Error("To be signed object doesn't exist for this notary"); }
      return getAssetRegistry('org.notarynodes.bloqNetwork.Signature');
    })
    .then(function (registry) {
      var signatureId = signer + "#"+ transaction.assetType + "#" + transaction.assetId;
      var factory = getFactory();
      var newSignature = factory.newResource('org.notarynodes.bloqNetwork', 'Signature', signatureId);
      newSignature.signer = transaction.signer;
      newSignature.timestamp = new Date();
      return registry.add(newSignature);
    })
    .catch(function (err) {
      //Promise.reject(new Error(err));
      throw new Error("Could not create signature, does the object exist and does it belong to this notary?"); // this results only in an unhandled rejection instead of a caught error..
    });
}


/**
 * Bloq emission
 * @param {org.notarynodes.bloqNetwork.BloqEmission} transaction - the transaction transaction
 * @transaction
 */
function onBloqEmission(transaction) {
  return checkSig(transaction.fund)
    .then(function (check) {
      if (check != true) { throw new Error("Emission not permitted as fund is not (yet) signed by the notary");}
      return getAssetRegistry('org.notarynodes.bloqNetwork.Bloq');
    })
    .then(function (registry) {
      var factory = getFactory();
      var datetime = new Date();
      var bloqId = transaction.fund.getIdentifier().toString() + "-" + datetime.toISOString() + "-E";
      var newBloq = factory.newResource('org.notarynodes.bloqNetwork', 'Bloq', bloqId);
      newBloq.holder = transaction.escrow;
      newBloq.fund = transaction.fund;
      newBloq.count = transaction.count;
      newBloq.start = datetime;
      newBloq.emission = true;
      newBloq.signer = transaction.signer;
      return registry.add(newBloq);
    });
}


/**
 * Bloq transfer
 * @param {org.notarynodes.bloqNetwork.BloqTransfer} transaction - the transaction transaction
 * @transaction
 */
function onBloqTransfer(transaction) {
  if (transaction.destinations.length != transaction.counts.length){ throw new Error("No. destinations doesn't match no. counts");}
  if (transaction.origin.count != transaction.counts.reduce(function(a, b) { return a + b; })){ throw new Error("Total count not equal to Bloq count"); }
  if ((transaction.origin.end != undefined) || (transaction.origin.destinations != undefined)) { throw new Error("Double spends are not allowed"); }
  return checkBloqValidity(transaction.origin)
    .then(function (check) {
      if ( check != true){ throw new Error("Orgin bloq (or orgin's orign) is not valid"); }
      return getAssetRegistry('org.notarynodes.bloqNetwork.Bloq');
    })
    .then(function (registry) {
      var factory = getFactory();
      var datetime = new Date();
      var bloqs = [];
      var destinations = [];
      for(var i = 0; i < transaction.counts.length; i++){
        var bloqId = transaction.origin.fund.getIdentifier().toString() + "-" + datetime.toISOString() + "-" + i.toString();
        var newBloq = factory.newResource('org.notarynodes.bloqNetwork', 'Bloq', bloqId);
        newBloq.holder = transaction.destinations[i];
        newBloq.fund = transaction.origin.fund;
        newBloq.count = transaction.counts[i];
        newBloq.start = datetime;
        newBloq.emission = false;
        newBloq.origin = transaction.origin;
        bloqs.push(newBloq);
        destinations.push(newBloq);
      }
      transaction.origin.end = datetime;
      transaction.origin.destinations = destinations;
      return registry.addAll(bloqs)
        .then(function () {
          registry.update(transaction.origin);
        });
    });
}

/**
 * Bloq transfer
 * @param {org.notarynodes.bloqNetwork.GetHolderBloqcounts} transaction - the transaction transaction
 * @transaction
 */
function onGetHolderBloqcounts(transaction) {
  var counts = {};
  return getAssetRegistry('org.notarynodes.bloqNetwork.Bloq')
    .then(function (registry) {
      return registry.getAll();
    })
    .then(function (bloqs) {
      for(var i = 0; i < bloqs.length; i++){
        console.log("started counting...");
        if ((bloqs[i].holder.getIdentifier().toString() == transaction.holder.getIdentifier().toString()) && (bloqs[i].end == undefined)){
          // todo implement check if bloqs are valid
          var fund = bloqs[i].fund.getIdentifier().toString();
          var count = bloqs[i].count.toString();
          console.log("bloqf: "+fund + " - "+ count);
          if (fund in counts) { counts[fund] = parseInt(counts[fund]) + parseInt(count);}
          else { counts[fund] = parseInt(count); }
        }
      }
      console.log(counts);
      return counts;
    });
}
