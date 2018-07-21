const sendPasswordlessEmail = require('lib/email/send-passwordless');
const generateToken = require('lib/tokens/generate');
const MySQL = require('lib/mysql');

/*
  GET /api/login/passwordless
  REQUIRED
    email: string
  RETURN
    { message?: string, authId?: string, userId?: number }
  DESCRIPTION
    Send user a passwordless login link via email if enabled
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await db.getConnection();
    let rows = await db.query('SELECT id FROM users WHERE email = ?', [
      req.query.email
    ]);

    if (!rows.length) throw 'Could not find user';

    const uid = +rows[0].id;

    const [{ passwordless }] = await db.query(
      'SELECT passwordless FROM security WHERE user_id = ?',
      [uid]
    );
    db.release();

    if (!passwordless) throw 'Passwordless login not enabled';

    const { id: authId, token } = await generateToken({ user: uid, type: 1 });

    // Send via email
    if (passwordless == 2) {
      await sendPasswordlessEmail(req.query.email, uid, token);
    }

    res.status(200).json({ authId, userId: uid });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
};
