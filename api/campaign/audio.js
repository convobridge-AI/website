import { proxyCampaign } from "./_proxy.js";

export default async function handler(req, res) {
  return proxyCampaign({ req, res, type: "audio" });
}
