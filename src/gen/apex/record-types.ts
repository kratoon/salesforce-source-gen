import fs from "fs-extra";
import {join} from "path";
import {readMetadataXML, writeMetadataXML} from "salesforce-metadata";
import {findCustomObjectChildFiles} from "salesforce-metadata/src/find-metadata";
import {ApexClass, RecordType} from "salesforce-metadata/src/metadata-types";
import slash from "slash";
import {loadProject, Project} from "../../project";
import {apexNotice} from "./notice";

export interface RecordTypesGenOptions {
    /**
     * Default: current working directory.
     */
    projectDir?: string;
    /**
     * Default: default package directory from sfdx-project.json
     */
    outputDir?: string;
    /**
     * Default: 'RecordTypes'.
     */
    outputClassName?: string;
    /**
     * Default: from sfdx-project.json
     */
    sourceApiVersion?: string;
    /**
     * Include inactive record types. Default: false.
     */
    includeInactive?: boolean;
    /**
     * Do not generate test class. Default: false.
     */
    ignoreTestClass?: boolean;
}

export function generateRecordTypesClass(options: RecordTypesGenOptions = {}): void {
    const project: Project = loadProject(options.projectDir || ".");
    if (!project.isDx) {
        throw Error("Only DX projects are currently supported.");
    }
    // Get options with default values.
    const outputDir: string = options.outputDir || project.join(project.sfdxDefaultProjectDirectory, "main", "default", "classes");
    const outputClassName: string = options.outputClassName || "RecordTypes";
    const sourceApiVersion: string = options.sourceApiVersion || project.sourceApiVersion;
    const activeOnly: boolean = options.includeInactive === undefined ? true : !options.includeInactive;
    const tests: boolean = options.ignoreTestClass === undefined ? true : !options.ignoreTestClass;
    const trimCustomSuffix: boolean = true;
    // Find paths to project record types.
    const recordTypePaths: string[] = findCustomObjectChildFiles("recordType", project.path);
    buildContent(recordTypePaths, activeOnly, trimCustomSuffix, outputClassName)
        .then((content: string) => {
            const classPath: string = join(outputDir, `${outputClassName}.cls`);
            console.log(`Writing record types to ${classPath}`);
            writeApexClassFile(classPath, content);
            const metaPath: string = join(outputDir, `${outputClassName}.cls-meta.xml`);
            console.log(`Writing meta file for class to ${metaPath}`);
            writeApexClassMetaFile(metaPath, sourceApiVersion);
        });
    if (tests) {
        buildTestContent(recordTypePaths, activeOnly, trimCustomSuffix, outputClassName).then((content: string) => {
            const classPath: string = join(outputDir, `${outputClassName}Test.cls`);
            console.log(`Writing record types test to ${classPath}`);
            writeApexClassFile(classPath, content);
            const metaPath: string = join(outputDir, `${outputClassName}Test.cls-meta.xml`);
            console.log(`Writing meta file for test class to ${metaPath}`);
            writeApexClassMetaFile(metaPath, sourceApiVersion);
        });
    }
}

function writeApexClassFile(path: string, content: string): void {
    fs.ensureFileSync(path);
    fs.writeFileSync(path, content);
}

function writeApexClassMetaFile(path: string, apiVersion: string): void {
    const data: {ApexClass: ApexClass} = {
        ApexClass: {
            $: {
                xmlns: "http://soap.sforce.com/2006/04/metadata"
            },
            // @ts-ignore
            apiVersion: apiVersion,
            status: ["Active"]
        }
    };
    writeMetadataXML(path, data);
}

function buildContent(
    recordTypePaths: string[],
    activeOnly: boolean,
    trimCustomSuffix: boolean,
    className: string
): Promise<string> {
    return recordTypePaths
        .reduce((content: Promise<string>, path: string) => {
            return content.then((allResult: string) => {
                return readMetadataXML(path).then((recordType: { RecordType: RecordType }) => {
                    if (activeOnly && !recordType.RecordType.active) {
                        return allResult;
                    }
                    const objectName: string | undefined = pathToObjectName(path);
                    if (!objectName) {
                        throw Error(`Couldn't parse object name from path ${path}`);
                    }
                    return allResult + buildRecordTypeProperty(recordType, objectName, trimCustomSuffix);
                });
            });
        }, Promise.resolve(""))
        .then((classContent: string) => {
            return `${apexNotice()}public inherited sharing class ${className} {\n\n${classContent}}\n`;
        });
}

function buildTestContent(
    recordTypePaths: string[],
    activeOnly: boolean,
    trimCustomSuffix: boolean,
    className: string
): Promise<string> {
    return recordTypePaths
        .reduce((content: Promise<string>, path: string) => {
            return content.then((allResult: string) => {
                return readMetadataXML(path).then((recordType: { RecordType: RecordType }) => {
                    if (activeOnly && !recordType.RecordType.active) {
                        return allResult;
                    }
                    const objectName: string | undefined = pathToObjectName(path);
                    if (!objectName) {
                        throw Error(`Couldn't parse object name from path ${path}`);
                    }
                    return allResult + buildTestRecordTypeProperty(recordType, objectName, className, trimCustomSuffix);
                });
            });
        }, Promise.resolve(""))
        .then((classContent: string) => buildTestClassContent(classContent, className));
}

function buildTestClassContent(classContent: string, className: string): string {
    return `${apexNotice()}@IsTest private class ${className}Test {

    private static void notNull(Object it) {
        System.assertNotEquals(null, it);
    }
    
    @IsTest private static void test() {
${classContent}    }
}`;
}

function buildRecordTypeProperty(
    recordType: { RecordType: RecordType },
    objectName: string,
    trimCustomSuffix: boolean
): string {
    const {fullName} = recordType.RecordType;
    if (!fullName || fullName.length === 0) {
        throw Error(`Record type without full name ${recordType}`);
    }
    const objName: string = trimCustomSuffix ? objectName.replace("__c", "") : objectName;
    const propertyName: string = `${objName}_${fullName}`.toUpperCase();
    const idPropertyName: string = `${propertyName}_ID`;
    return `    public static RecordTypeInfo ${propertyName} {
        get { return ${propertyName} = ${propertyName} != null
                ? ${propertyName} : Schema.SObjectType.${objectName}.getRecordTypeInfosByDeveloperName().get('${fullName[0]}'); }
        private set;
    }
    public static Id ${idPropertyName} {
        get { return ${propertyName}.getRecordTypeId(); }
        private set;
    }
`;
}

function buildTestRecordTypeProperty(
    recordType: { RecordType: RecordType },
    objectName: string,
    className: string,
    trimCustomSuffix: boolean
): string {
    const {fullName} = recordType.RecordType;
    if (!fullName || fullName.length === 0) {
        throw Error(`Record type without full name ${recordType}`);
    }
    const objName: string = trimCustomSuffix ? objectName.replace("__c", "") : objectName;
    const propertyName: string = `${objName}_${fullName}`.toUpperCase();
    const idPropertyName: string = `${propertyName}_ID`;
    return `        notNull(${className}.${idPropertyName});\n`;
}

function pathToObjectName(path: string): string | undefined {
    const execResult: any = slash(path).match(/.*[/\\]objects[/\\](.*?)[/\\].*/);
    return execResult ? execResult[1] : undefined;
}
