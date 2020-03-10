import {Command, flags} from "@oclif/command";
import {generatePicklistClasses} from "..";

export default class Picklists extends Command {
    public static description: string = `Generate Apex constants from field picklists and standard value sets.
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
`;

    public static flags: flags.Input<any> = {
        help: flags.help({char: "h"}),
        projectDir: flags.string({description: "Default: current working directory."}),
        outputDir: flags.string({description: "Default: default package directory."}),
        sourceApiVersion: flags.string({description: "Default: from sfdx-project.json."}),
        ignorePicklists: flags.boolean({description: "Ignore custom fields."}),
        ignoreStandardValueSets: flags.boolean({description: "Ignore standard value sets."}),
        ignoreGlobalValueSets: flags.boolean({description: "Ignore global value sets."}),
        customFieldPrefix: flags.string({
            description: "Prefix for classes generated from custom fields. Default: empty."
        }),
        customFieldSuffix: flags.string({
            description: "Suffix for classes generated from custom fields. Default: empty."
        }),
        customFieldInfix: flags.string({
            description: "String between sobject name and field name. Default: '_'."
        }),
        standardValueSetPrefix: flags.string({description: "Prefix for classes generated from standard value sets. Default: empty."}),
        standardValueSetSuffix: flags.string({description: "Suffix for classes generated from standard value sets. Default: empty."}),
        globalValueSetPrefix: flags.string({description: "Suffix for classes generated from global value sets. Default: empty."}),
        globalValueSetSuffix: flags.string({description: "Suffix for classes generated from global value sets. Default: empty."})
    };

    public async run(): Promise<any> {
        const {flags: options} = this.parse(Picklists);
        generatePicklistClasses(options);
    }
}
