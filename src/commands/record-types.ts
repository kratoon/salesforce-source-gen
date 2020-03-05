import {Command, flags} from "@oclif/command";
import {generateRecordTypesClass} from "..";

export default class RecordTypes extends Command {
    public static description: string = `Generate Apex constants from record types defined in your source.
You can use \`RecordTypes.ACCOUNT_AGENT_ID\`instead of \`Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName().get('Agent');\`
or \`RecordTypes.ACCOUNT_AGENT\` to access RecordTypeInfo.`;

    public static flags: flags.Input<any> = {
        help: flags.help({char: "h"}),
        projectDir: flags.string({description: "Default: current working directory"}),
        outputDir: flags.string({description: "Default: default package directory from sfdx-project.json."}),
        outputClassName: flags.string({description: "Default: 'RecordTypes'."}),
        sourceApiVersion: flags.string({description: "Default: from sfdx-project.json."}),
        includeInactive: flags.boolean({description: "Include inactive record types."}),
        ignoreTestClass: flags.boolean({description: "Do not generate test class."})
    };

    public async run(): Promise<any> {
        const {flags: options} = this.parse(RecordTypes);
        generateRecordTypesClass(options);
    }
}
