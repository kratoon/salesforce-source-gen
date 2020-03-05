import fs from "fs-extra";
import {join} from "path";
import {ApexClass, CustomField, readMetadataXML, writeMetadataXML} from "salesforce-metadata";
import {findFilesByMetadataType} from "salesforce-metadata/src/find-metadata";
import {
    CustomValue, StandardValue,
    StandardValueSet,
    ValueSet,
    ValueSetValuesDefinition
} from "salesforce-metadata/src/metadata-types";
import slash from "slash";
import {loadProject, Project} from "../../project";
import {apexNotice} from "./notice";

export interface PicklistsGenOptions {
    /**
     * Default: current working directory.
     */
    projectDir?: string;
    /**
     * Default: default package directory from sfdx-project.json
     */
    outputDir?: string;
    /**
     * Default: from sfdx-project.json
     */
    sourceApiVersion?: string;
    /**
     * Suffix for classes generated from custom fields. Default: empty.
     */
    picklistSuffix?: string;
    /**
     * Suffix for classes generated from standard value sets. Default: empty.
     */
    standardValueSetSuffix?: string;
    /**
     * Suffix for classes generated from global value sets. Default: empty.
     */
    // globalValueSetSuffix?: string;
}

export function generatePicklistClasses(options: PicklistsGenOptions = {}): void {
    const project: Project = loadProject(options.projectDir || ".");
    if (!project.isDx) {
        throw Error("Only DX projects are currently supported.");
    }
    // Get options with default values.
    const outputDir: string = options.outputDir || project.join(project.sfdxDefaultProjectDirectory, "main", "default", "classes");
    const sourceApiVersion: string = options.sourceApiVersion || project.sourceApiVersion;
    const trimCustomSuffix: boolean = true;
    const picklistSuffix: string = options.picklistSuffix || "";
    const standardValueSetSuffix: string = options.standardValueSetSuffix || "";
    const customFieldPaths: string[] = findFilesByMetadataType("CustomField", project.path);
    Promise.all(customFieldPaths.map(readMetadataXML))
        .then((fields) => {
            console.log("Building value set classes from custom fields.");
            fields.forEach((it: { CustomField: CustomField }, idx) => {
                if (it.CustomField && it.CustomField.fullName && isFieldWithValueSet(it.CustomField)) {
                    const fieldPath: string = customFieldPaths[idx];
                    const objectName: string | undefined = pathToObjectName(fieldPath);
                    if (!objectName) {
                        throw Error(`Couldn't parse object name from path ${fieldPath}`);
                    }
                    const fieldName: string = it.CustomField.fullName[0];
                    const trimmedObjectName: string = trimCustomSuffix
                        ? objectName.replace(/__c|__mdt|_/g, "") : objectName;
                    const trimmedFieldName: string = trimCustomSuffix
                        ? fieldName.replace(/__c|__mdt|_/g, "") : fieldName;
                    // Class name max 40
                    const className: string = `${(trimmedObjectName + trimmedFieldName).substring(0, 40 - picklistSuffix.length)}${picklistSuffix}`;
                    const content: string | undefined = buildApexClassContentFromPicklistField(
                        it.CustomField, objectName, className
                    );
                    if (content) {
                        writeApexClassFile(join(outputDir, `${className}.cls`), content);
                        writeApexClassMetaFile(join(outputDir, `${className}.cls-meta.xml`), sourceApiVersion);
                    } else {
                        console.log(`No values, skipping: ${objectName}.${fieldName}`);
                    }
                }
            });
        })
        .then(() => {
            const standardValueSetPaths: string[] = findFilesByMetadataType("StandardValueSet", project.path);
            Promise.all(standardValueSetPaths.map(readMetadataXML))
                .then((sets) => {
                    console.log("Building value set classes from standard value sets.");
                    sets.forEach((it: { StandardValueSet: StandardValueSet}, idx) => {
                        const setPath: string = standardValueSetPaths[idx];
                        const valueSetName: string | undefined = pathToMetadataName(setPath, "standardValueSets", "\.standardValueSet-meta\.xml");
                        if (!valueSetName) {
                            throw Error(`Couldn't parse standard value set name from path ${setPath}`);
                        }
                        // Class name max 40
                        const className: string = `${valueSetName.substring(0, 40 - standardValueSetSuffix.length)}${standardValueSetSuffix}`;
                        const content: string | undefined = buildApexClassContentFromStandardValueSet(
                            it.StandardValueSet, valueSetName, className
                        );
                        if (content) {
                            writeApexClassFile(join(outputDir, `${className}.cls`), content);
                            writeApexClassMetaFile(join(outputDir, `${className}.cls-meta.xml`), sourceApiVersion);
                        } else {
                            console.log(`No values, skipping: ${valueSetName}`);
                        }
                    });
                });
        });
}

function writeApexClassFile(path: string, content: string): void {
    fs.ensureFileSync(path);
    fs.writeFileSync(path, content);
}

function buildApexClassContentFromStandardValueSet(
    valueSet: StandardValueSet,
    valueSetName: string,
    className: string,
): string | undefined {
    const values: StandardValue[] = valueSet.standardValue || [];
    const properties: string[] = values.filter(it => it.fullName).map(it => {
        // tslint:disable-next-line:no-non-null-assertion
        const fullName: string = it.fullName![0];
        const propertyName: string = ensureValidApexPropertyName(fullName).toUpperCase();
        const value: string = fullName.replace("'", "\\'");
        return `\tpublic static final String ${propertyName} = '${value}';`;
    });
    const classHeader: string = `/**\n * ${valueSetName} standard value set.\n */\n`;
    return properties.length === 0 ? undefined : `${apexNotice()}\n${classHeader}public inherited sharing class ${className} {\n\n${properties.join("\n")}\n}`;
}

function buildApexClassContentFromPicklistField(
    customField: CustomField,
    objectName: string,
    className: string,
): string | undefined {
    const valueSets: ValueSet[] | undefined = customField.valueSet;
    const valueSet: ValueSet | undefined = valueSets ? valueSets[0] : undefined;
    const definition: ValueSetValuesDefinition | undefined = valueSet?.valueSetDefinition
        ? valueSet.valueSetDefinition[0] : undefined;
    const value: CustomValue[] | undefined = definition?.value ? definition.value : undefined;
    const properties: string[] = (value || []).filter(it => it.fullName).map((it: CustomValue) => {
        // tslint:disable-next-line:no-non-null-assertion
        const fullName: string = it.fullName![0];
        const propertyName: string = ensureValidApexPropertyName(fullName).toUpperCase();
        const propertyValue: string = fullName.replace("'", "\\'");
        return `\tpublic static final String ${propertyName} = '${propertyValue}';`;
    });
    const classHeader: string = `/**\n * ${objectName}.${customField.fullName} custom field value set.\n */\n`;
    return properties.length === 0 ? undefined : `${apexNotice()}\n${classHeader}public inherited sharing class ${className} {\n\n${properties.join("\n")}\n}`;
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

function ensureValidApexPropertyName(it: string): string {
    // The name can only contain characters, letters, and the underscore (_) character, must start with a letter,
    // and cannot end with an underscore or contain two consecutive underscore characters.
    const result: string = it.replace(/[^\w]+/g, "_")
        .replace(/_$/, "");
    const apexReservedWords: string[] = [
        "final", "static", "instanceof", "super", "this", "transient", "with",
        "without", "sharing", "inherited", "public", "private", "protected", "class", "new"
    ];
    return result.match(/^[a-zA-Z]/) && !apexReservedWords.includes(result.toLowerCase())  ? result : `a_${result}`;
}

function isFieldWithValueSet(customField: CustomField): boolean {
    return Boolean(customField.type && ["MultiselectPicklist", "Picklist"].includes(customField.type[0]));
}

function pathToMetadataName(path: string, dirName: string, suffix: string): string | undefined {
    const execResult: any = slash(path).match(new RegExp(`.*[/\]${dirName}[/\](.*?)${suffix}`));
    return execResult ? execResult[1] : undefined;
}

function pathToObjectName(path: string): string | undefined {
    const execResult: any = slash(path).match(/.*[/\\]objects[/\\](.*?)[/\\].*/);
    return execResult ? execResult[1] : undefined;
}
