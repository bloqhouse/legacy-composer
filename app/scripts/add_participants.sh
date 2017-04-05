#!/bin/bash

composer participant add -n bloq-network -i WebAppAdmin -s DJY27pEnl16d -d '{"$class":"org.notarynodes.bloqNetwork.Notary","notaryId":"honesty"}'
composer participant add -n bloq-network -i WebAppAdmin -s DJY27pEnl16d -d '{"$class":"org.notarynodes.bloqNetwork.FundManager","fundManagerId":"realestatepro"}'
composer participant add -n bloq-network -i WebAppAdmin -s DJY27pEnl16d -d '{"$class":"org.notarynodes.bloqNetwork.BloqHolder","bloqHolderId":"escrow"}'
composer participant add -n bloq-network -i WebAppAdmin -s DJY27pEnl16d -d '{"$class":"org.notarynodes.bloqNetwork.BloqHolder","bloqHolderId":"jeroen"}'
composer participant add -n bloq-network -i WebAppAdmin -s DJY27pEnl16d -d '{"$class":"org.notarynodes.bloqNetwork.BloqHolder","bloqHolderId":"tim"}'
