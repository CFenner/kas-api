import { KasApi } from "./kas-api";

export class KasMailForward {
    private readonly api: KasApi;

    constructor(account: string, password: string) {
        this.api = new KasApi(account, password);
    }

    public async list() {
        return this.api.call("get_mailforwards", {});
    }

    public async exists(source: string, domain: string) {
        return this.api.call("get_mailforwards", {
            mail_forward: source + "@" + domain,
        });
    }

    public async create(source: string, domain: string, target: string) {
        return this.api.call("add_mailforward", {
            domain_part: domain,
            local_part: source,
            target_0: target,
        });
    }

    public async delete(source: string, domain: string) {
        return this.api.call("delete_mailforward", {
            mail_forward: source + "@" + domain,
        });
    }
}
