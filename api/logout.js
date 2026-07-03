export default function handler(req,res){res.setHeader('Set-Cookie','terrilmx_session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');res.redirect('/');}
