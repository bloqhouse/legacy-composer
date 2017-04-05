# Explanation

For now you need a locally running fabric cluster (this requires docker and docker-compose).
In the future a cloud fabric cluster + connection profile will be provided.

Note that permissioning is currently not applied.
Anyone can therefore create transactions, in future person only the appropriate
participant has access to a

## Install fabric composer

First install fabric composer. See their website.

## Install modules

$ npm install

## Install fabric and deploy cluster

$ npm run local-fabric

$ npm run deploy-bloqnetwork

$ npm run add-participants

**OR**

$ npm run all

## Create fund, sign a find, issue bloqs, transfer bloqs

$ node index.js

## Check the Bloq registry from the commandline

$ composer network list -n bloq-network -i WebAppAdmin -s DJY27pEnl16d -r 'org.notarynodes.bloqNetwork.Bloqs'
