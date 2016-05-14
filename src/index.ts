import {MetadataArgsStorage} from "./metadata-builder/MetadataArgsStorage";
import {importClassesFromDirectories} from "./util/DirectoryExportedClassesLoader";
import {ExpressDriver} from "./driver/ExpressDriver";
import {RoutingControllerExecuter} from "./RoutingControllerExecuter";

// -------------------------------------------------------------------------
// Interfaces
// -------------------------------------------------------------------------

export interface RoutingControllersOptions {
    controllerDirs?: string[];
    middlewareDirs?: string[];
}

// -------------------------------------------------------------------------
// Helper Functions
// -------------------------------------------------------------------------

/**
 * Registers all loaded actions in your express application.
 */
export function useExpressServer(expressApp: any, options?: RoutingControllersOptions): void {
    const controllerRegistrator = new RoutingControllerExecuter(new ExpressDriver(expressApp));

    if (options && options.controllerDirs && options.controllerDirs.length)
        importClassesFromDirectories(options.controllerDirs);
    if (options && options.middlewareDirs && options.middlewareDirs.length)
        importClassesFromDirectories(options.middlewareDirs);

    controllerRegistrator.registerActions(); // register only for loaded controllers?
    controllerRegistrator.registerMiddlewares();
}

/**
 * Registers all loaded actions in your express application.
 */
export function createExpressServer(options?: RoutingControllersOptions): any {

    let expressApp: any;
    if (require) {
        try {
            expressApp = require("express");
        } catch (e) {
            throw new Error("express package was not found installed. Try to install it: npm install express --save");
        }
    } else {
        throw new Error("Cannot load express. Try to install all required dependencies.");
    }
    
    useExpressServer(expressApp, options);
    return expressApp;
}

// -------------------------------------------------------------------------
// Global Container
// -------------------------------------------------------------------------

/**
 * Container to be used by this library for inversion control. If container was not implicitly set then by default
 * container simply creates a new instance of the given class.
 */
let container: { get<T>(someClass: { new (...args: any[]): T }|Function): T } = new (class {
    private instances: any[] = [];
    get<T>(someClass: { new (...args: any[]): T }): T {
        if (!this.instances[<any>someClass])
            this.instances[<any>someClass] = new someClass();

        return this.instances[<any>someClass];
    }
})();

/**
 * Sets container to be used by this library.
 *
 * @param iocContainer
 */
export function useContainer(iocContainer: { get(someClass: any): any }) {
    container = iocContainer;
}

/**
 * Gets the IOC container used by this library.
 */
export function getContainer() {
    return container;
}

// -------------------------------------------------------------------------
// Global Metadata Storage
// -------------------------------------------------------------------------

/**
 * Gets the metadata arguments storage.
 */
export function defaultMetadataArgsStorage(): MetadataArgsStorage {
    return container.get(MetadataArgsStorage);
}

// -------------------------------------------------------------------------
// Commonly Used exports
// -------------------------------------------------------------------------

export * from "./decorator/controllers";
export * from "./decorator/decorators";
export * from "./decorator/methods";
export * from "./decorator/params";