import {Command, flags} from "@oclif/command";
import {generatePicklistClasses} from "..";

export default class Picklists extends Command {
    public static description: string = "Generate Apex constants from field picklists and standard value sets.";

    public static flags: flags.Input<any> = {
        help: flags.help({char: "h"}),
        projectDir: flags.string({description: "Default: current working directory."}),
        outputDir: flags.string({description: "Default: default package directory."}),
        sourceApiVersion: flags.string({description: "Default: from sfdx-project.json."}),
        ignorePicklists: flags.boolean({description: "Ignore custom fields."}),
        ignoreStandardValueSets: flags.boolean({description: "Ignore standard value sets."}),
        ignoreGlobalValueSets: flags.boolean({description: "Ignore global value sets."}),
        picklistPrefix: flags.string({description: "Prefix for classes generated from custom fields. Default: empty."}),
        picklistSuffix: flags.string({description: "Suffix for classes generated from custom fields. Default: empty."}),
        picklistInfix: flags.string({description: "String between sobject name and field name. Default: '_'."}),
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
