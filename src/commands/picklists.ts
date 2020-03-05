import {Command, flags} from "@oclif/command";
import {generatePicklistClasses} from "..";

export default class Picklists extends Command {
    public static description: string = "Generate Apex constants from field picklists and standard value sets.";

    public static flags: flags.Input<any> = {
        help: flags.help({char: "h"}),
        projectDir: flags.string({description: "Default: current working directory"}),
        outputDir: flags.string({description: "Default: default package directory from sfdx-project.json."}),
        sourceApiVersion: flags.string({description: "Default: from sfdx-project.json."}),
        picklistSuffix: flags.string({description: "Suffix for classes generated from custom fields. Default: empty."}),
        standardValueSetSuffix: flags.string({description: "Suffix for classes generated from standard value sets. Default: empty."})
    };

    public async run(): Promise<any> {
        const {flags: f} = this.parse(Picklists);
        generatePicklistClasses(f);
    }
}
