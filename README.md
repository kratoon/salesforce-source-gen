# Salesforce source generator

[![npm version](https://badge.fury.io/js/salesforce-source-gen.svg)](https://badge.fury.io/js/salesforce-source-gen)

Generate Salesforce source files directly from your source.
Currently, only DX projects are supported.

## Installation.
Install globally using `npm i --global salesforce-source-gen`.

Configure your project with package.json file.

## Record Types
Generate record types class from record types defined in your source.
You can simply use `RecordTypes.ACCOUNT_AGENT_ID`
instead of `Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Agent');`
or `RecordTypes.ACCOUNT_AGENT` to access RecordTypeInfo.

##### Options:
* projectDir - Default: current working directory.
* outputDir - Default: default package directory from sfdx-project.json.
* outputClassName - Default: 'RecordTypes'.
* sourceApiVersion - Default: from sfdx-project.json.
* activeOnly - Filter active record types. Default: true.
* tests - Generate test class. Default: true
* trimCustomSuffix - Cut '__c' from object names. Default: true.

##### Example package.json:
```json
{
  "scripts": {
    "gen-record-types": "salesforce-source-gen record-types"
  },
  "sourceGen": {
    "recordTypes": {
      "outputDir": "src/main/default/classes"
    }
  }
}
```

