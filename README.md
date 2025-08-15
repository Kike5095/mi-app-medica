# Despliegue en Netlify

La aplicación se compila con Vite y puede desplegarse en Netlify sin necesidad de un entorno local.

### Comandos de Netlify

- **Build command:** `npm run build`
- **Publish directory:** `dist`

### Variables de entorno

Configura las siguientes variables en Netlify (y en tu archivo `.env.local` para desarrollo):

- `VITE_API_KEY`
- `VITE_AUTH_DOMAIN`
- `VITE_PROJECT_ID`
- `VITE_STORAGE_BUCKET`
- `VITE_MESSAGING_SENDER_ID`
- `VITE_APP_ID`

## Firestore rules

Las reglas de seguridad de Firestore para los signos vitales de los pacientes se almacenan en [`firestore.rules`](firestore.rules). Después de modificar este archivo, despliega los cambios a Firebase con:

```bash
firebase deploy --only firestore:rules
```
