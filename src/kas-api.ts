import { createHash } from "crypto";
import { createClientAsync } from "soap";
import { parseString } from "xml2js";
import { APIResultTransformer } from "./api-result-transformer";

type APIFunction =
    "add_mailforward" | "delete_mailforward" | "get_mailforwards" | "update_mailforward";

export class KasApi {
    private static endpoint = "https://kasapi.kasserver.com/soap/wsdl/KasApi.wsdl";

    private readonly account: string;
    private readonly password: string;

    constructor(account: string, password: string) {
        this.account = account;
        this.password = password;
    }

    public async call(action: APIFunction, data?: object) {
        const soapClient = await createClientAsync(KasApi.endpoint, {
            disableCache: true,
            // @ts-ignore
            suppressStack: true,
        });

        const hash = createHash("sha1")
            .update(this.password)
            .digest("hex");

        const payload = JSON.stringify({
            KasAuthData: hash,
            KasAuthType: "sha1",
            KasRequestParams: data || {},
            KasRequestType: action,
            KasUser: this.account,
        });

        let response: any[];
        try {
            // @ts-ignore
            response = await soapClient.KasApiAsync({params: payload});
        } catch (e) {
            return e;
        }

        const jsonResponse = await new Promise((res, rej) => {
            parseString(response[1], {
                async: true,
                explicitArray: false,
                ignoreAttrs: true,
                mergeAttrs: true,
                trim: true,
            }, (err, result) => {
                if (err) {
                    rej(err);
                }
                res(result);
            });
        });

        const parsedResponse = APIResultTransformer.transform(jsonResponse);

        // @ts-ignore
        if (parsedResponse.Response.ReturnString !== "TRUE") {
            throw new Error("Request wasn't successful.");
        }

        // @ts-ignore
        return parsedResponse.Response.ReturnInfo;
    }
}
