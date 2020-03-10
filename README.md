salesforce-source-gen
=====================

[![npm version](https://badge.fury.io/js/salesforce-source-gen.svg)](https://badge.fury.io/js/salesforce-source-gen)

Generate Salesforce source files directly from your source.
Currently, only DX projects are supported.

This project is not official Salesforce product.


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage
<!-- usage -->
```sh-session
$ npm install -g salesforce-source-gen
$ salesforce-source-gen COMMAND
running command...
$ salesforce-source-gen (-v|--version|version)
salesforce-source-gen/0.0.10 linux-x64 node-v8.10.0
$ salesforce-source-gen --help [COMMAND]
USAGE
  $ salesforce-source-gen COMMAND
...
```
<!-- usagestop -->

Optionally, you can configure `scripts` in your package.json file.
```json
{
  "scripts": {
    "record-types": "salesforce-source-gen record-types",
    "picklists": "salesforce-source-gen picklists"
  }
}
``` 

# Commands
<!-- commands -->
* [`salesforce-source-gen help [COMMAND]`](#salesforce-source-gen-help-command)
* [`salesforce-source-gen picklists`](#salesforce-source-gen-picklists)
* [`salesforce-source-gen record-types`](#salesforce-source-gen-record-types)

## `salesforce-source-gen help [COMMAND]`

display help for salesforce-source-gen

```
USAGE
  $ salesforce-source-gen help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `salesforce-source-gen picklists`

Generate Apex constants from field picklists and standard value sets.

```
USAGE
  $ salesforce-source-gen picklists

OPTIONS
  -h, --help                                       show CLI help
  --customFieldInfix=customFieldInfix              String between sobject name and field name. Default: '_'.
  --customFieldPrefix=customFieldPrefix            Prefix for classes generated from custom fields. Default: empty.
  --customFieldSuffix=customFieldSuffix            Suffix for classes generated from custom fields. Default: empty.
  --globalValueSetPrefix=globalValueSetPrefix      Suffix for classes generated from global value sets. Default: empty.
  --globalValueSetSuffix=globalValueSetSuffix      Suffix for classes generated from global value sets. Default: empty.
  --ignoreGlobalValueSets                          Ignore global value sets.
  --ignorePicklists                                Ignore custom fields.
  --ignoreStandardValueSets                        Ignore standard value sets.
  --outputDir=outputDir                            Default: default package directory.
  --projectDir=projectDir                          Default: current working directory.
  --sourceApiVersion=sourceApiVersion              Default: from sfdx-project.json.

  --standardValueSetPrefix=standardValueSetPrefix  Prefix for classes generated from standard value sets. Default:
                                                   empty.

  --standardValueSetSuffix=standardValueSetSuffix  Suffix for classes generated from standard value sets. Default:
                                                   empty.

DESCRIPTION
  To filter only specific picklists, add to your package.json 'include'.
  Only picklists defined in include will be generated.
  Include can contain:
       I)   ObjectApiName - all custom fields of that object will be used
       II)  ObjectApiName.FieldApiName - custom field will be used
       III) StandardValueSetName - standard value set will be used
       IV)  GlobalValueSetName - global value set will be used
  {
       "sourceGen": {
           "picklists": {
               "include": [
                   "Account",
                   "Building__c.Phase__c",
                   "Industry"
               ]
           }
       }
  }
```

_See code: [src/commands/picklists.ts](https://github.com/kratoon3/salesforce-source-gen/blob/v0.0.10/src/commands/picklists.ts)_

## `salesforce-source-gen record-types`

Generate Apex constants from record types defined in your source.

```
USAGE
  $ salesforce-source-gen record-types

OPTIONS
  -h, --help                           show CLI help
  --ignoreTestClass                    Do not generate test class.
  --includeInactive                    Include inactive record types.
  --outputClassName=outputClassName    Default: 'RecordTypes'.
  --outputDir=outputDir                Default: default package directory from sfdx-project.json.
  --projectDir=projectDir              Default: current working directory
  --sourceApiVersion=sourceApiVersion  Default: from sfdx-project.json.

DESCRIPTION
  You can use `RecordTypes.ACCOUNT_AGENT_ID`instead of 
  `Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Agent');`
  or `RecordTypes.ACCOUNT_AGENT` to access RecordTypeInfo.
```

_See code: [src/commands/record-types.ts](https://github.com/kratoon3/salesforce-source-gen/blob/v0.0.10/src/commands/record-types.ts)_
<!-- commandsstop -->
