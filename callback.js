// /api/auth/steam/callback.js
// Étape 2 : Steam renvoie le visiteur ici avec des paramètres signés.
// On les renvoie à Steam pour vérifier qu'ils sont authentiques (obligatoire,
// c'est cette étape qui ne peut pas se faire directement depuis le navigateur).

// À adapter si votre page TERRIL MX n'est pas à la racine du site.
const REDIRECT_PAGE = '/terril-mx-serveur.html';

export default async function handler(req, res) {
  const query = req.query;

  if (query['openid.mode'] !== 'id_res') {
    return res.redirect(`${REDIRECT_PAGE}?steam_error=1`);
  }

  // On reconstruit exactement les paramètres reçus, en changeant juste le mode,
  // comme l'exige le protocole OpenID 2.0 pour la vérification.
  const verifyParams = new URLSearchParams();
  for (const key in query) {
    if (key.startsWith('openid.')) {
      verifyParams.append(key, query[key]);
    }
  }
  verifyParams.set('openid.mode', 'check_authentication');

  let steamResponseText;
  try {
    const steamRes = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    });
    steamResponseText = await steamRes.text();
  } catch (err) {
    return res.redirect(`${REDIRECT_PAGE}?steam_error=1`);
  }

  if (!steamResponseText.includes('is_valid:true')) {
    return res.redirect(`${REDIRECT_PAGE}?steam_error=1`);
  }

  const claimedId = query['openid.claimed_id'] || '';
  const match = claimedId.match(/\/openid\/id\/(\d+)$/);
  if (!match) {
    return res.redirect(`${REDIRECT_PAGE}?steam_error=1`);
  }

  const steamId64 = match[1];
  return res.redirect(`${REDIRECT_PAGE}?steamid=${steamId64}`);
}
