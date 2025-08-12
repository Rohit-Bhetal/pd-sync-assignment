# Pipedrive Person Sync

This script reads person data from `inputData.json` and field mappings from `mappings.json`,  
then syncs it with **Pipedrive** by creating or updating the person based on their name.

## Issue in the mapping file given
  The mapping.json third entity has a typo in inputKey.This typo would mismatch the pipedrive matching.So please admin correct it.
  I have changed it while making the project.The Changes done in mappping.json is as below:
  Before 
  ```bash
{
    "pipedriveKey": "phone",
    "inputKey": "phone.home"
  }
```
  After
  ```bash
  {
    "pipedriveKey": "phone",
    "inputKey": "phoneNumber.home"
  }
```
The Input field for phone is phoneNumber.


## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Set ENV variable :
   ```bash
   PIPEDRIVE_API_KEY=your_api_key ,PIPEDRIVE_COMPANY_DOMAIN=your_domain
   ```

## Edge Cases:

    1. Missing JSON file
    inputData.json or mappings.json not found. I have used try catch to throw error if there is any.

    2. Invalid JSON format
    There might be issue while mapping the inputData with mapping,which handled through a try-catch again.

    3. API or domain might not been loaded
    Env not loaded , throws a Error

    4.Missing name field
    No mapping for name or the value is empty, so person lookup fails,Or PipeDrivePerson is not in desired Type , handled through a try-catch

    5.Empty payload
    All mapped values are null/undefined,Possibly due to mapping error.Catch the Error and with error message of error while searching for PipeDrive Person

    6.Pipedrive API error
    Invalid API key, network issues, or API downtime, efficiently catched using a try-catch also.




