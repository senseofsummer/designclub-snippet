Use case: A user refers another user to the trading exchange.

The UpdateAffiliateTreesProcessor class processes a job to update the referral tree for a user:

Deletes existing records.
Adds a direct referrer.
Rebuilds the referral tree based on the referrer’s hierarchy, using a transaction to ensure data consistency.