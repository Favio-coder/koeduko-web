import { auth } from "./auth";
import { vapiWebhook } from "./functions/vapi_webhook";

// Las rutas de autenticación se montan sobre el mismo router que ya sirve el
// webhook de Vapi: Convex expone un único router HTTP por deployment.
auth.addHttpRoutes(vapiWebhook);

export default vapiWebhook;
