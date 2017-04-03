# Bloqs: A real estate trading ecosystem

A business network created with Fabric composer that allows trading in partial real estate ownership certificates (Bloqs).
Plan is to launch a pilot with *real* real estate summer 2017.


## Participants, assets and process flow

1. Any ("FundManager") can create a fund using the ("CreateFund") transaction.
2. The ("Notary") appointed during (1) approves the ("Fund") by creating a ("Sign") transaction.
3. The ("FundManager") can issue new ("Bloq") by creating a ("BloqEmission") transaction
4. The ("Notary") appointed during (3) approves the emission by creating a ("Sign") transaction.
5. The ("Bloqholder") appointed during (3) holds all the Bloqs, Bloqs can be transferred to other ("Bloqholder") by creating a ("BloqTransfer") transaction.
6. The ("Bloqholder") can check it's balance by creating a ("GetHolderBloqcounts") transaction

Note that:
Assets can also be created directly without the transaction functions.
This technically allows Bloqholders to update Bloqs or create the out-of-thin air.
The transfer transaction however checks Bloq validity, only transfers created with the BloqTransfer function will be legally binding.

## TODO's

* Create update transactions for Fund
* Turn Fund/properties into a property asset list instead of a string
* Create legal documents that make transactions legally binding and direct CRUDs not legally binding
* Update permissions file (replace 2 level deep references, they don't seem to work)
* Check atomicity of all functions (no partial transactions)
* Change errors thrown such that transactions are not added to transaction registry if an error is thrown
* Consistent and complete error catching
* Auto increment id for new transactions
* Permissioning for adding participants (Notary > All, Fund manager,App > BloqHolder)
* Implement cashflows and rent distribution
