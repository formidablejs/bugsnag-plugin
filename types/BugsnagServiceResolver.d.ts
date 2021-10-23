export default class BugsnagServiceResolver extends ServiceResolver {
    get config(): {
        apiKey: any;
        appType: any;
        appVersion: any;
        enabledReleaseStages: any;
        endpoints: {
            notify: any;
            sessions: string;
        };
        hostname: any;
        projectRoot: any;
        redactedKeys: any;
        releaseStage: any;
        sendCode: any;
        logger: any;
    };
    catchQueries(): import("@formidablejs/framework").Application;
    /**
    @param {Event} event
    */
    createQueryTab(request: any, event: Event): any;
    /**
    @param {FormRequest} request
    */
    setUser(request: any): any;
    /**
    @param {Event} event
    */
    handleCallbacks(event: Event): any[];
    catchErrors(): import("@formidablejs/framework").Application;
    /**
    @param {FormRequest} request
    */
    requestInformation(request: any): {
        url: string;
        path: any;
        httpMethod: any;
        headers: any;
        httpVersion: any;
        params: any;
        query: any;
        body: any;
    };
}
import { ServiceResolver } from "@formidablejs/framework";
