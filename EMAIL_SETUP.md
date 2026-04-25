# PMG Embedded — company email setup

How to route `@pmgembedded.com` addresses to personal Gmail inboxes, and how to
reply from the company address inside Gmail.

Repeat **Section 2 and 3** for each new team member. Section 1 (Cloudflare routing)
is done once per address by whoever manages the domain.

---

## Section 1 — Cloudflare Email Routing (receive mail)

Done once per company address (e.g. `info@`, `danilo@`, `nikola@`, …).

1. Log in at **cloudflare.com** → select the `pmgembedded.com` domain.
2. Left sidebar → **Email** → **Email Routing**.
3. If Email Routing is not yet enabled, click **Enable Email Routing**.
   Cloudflare will add the required MX records automatically.
4. Under **Routing rules** → **Custom addresses** → **Create address**.
5. Fill in:
   - **Custom address:** `danilo` (just the part before the @)
   - **Action:** Send to an email → enter Danilo's personal Gmail address
6. Click **Save**.
7. Cloudflare sends a verification email to the destination Gmail. Open it and
   click the confirmation link before the rule becomes active.
8. Repeat for each person / each address you need.

From this point, any email sent to `danilo@pmgembedded.com` lands in Danilo's Gmail.

---

## Section 2 — App Password (one-time per Gmail account)

Gmail requires an App Password (a special 16-character password) to let its own
SMTP server send mail on your behalf under a different address. You need one per
person.

1. Make sure **2-Step Verification is turned on** for the Gmail account:
   `myaccount.google.com → Security → How you sign in to Google → 2-Step Verification`
   It must say **On**. If it just offers to set it up, do that first.

2. Go directly to:

   ```txt
   https://myaccount.google.com/apppasswords
   ```

   > If the page says "This setting is not available for your account":
   > - 2-Step Verification is not fully active (see step 1), or
   > - You're using a passkey as the *only* second factor — add an authenticator
   >   app or phone prompt alongside it, then try again.

3. In the **App name** field type something like `Gmail SMTP – pmgembedded`, then
   click **Create**.

4. Google shows a 16-character password **once** — copy it somewhere safe
   (password manager, notes). You'll need it in Section 3.

---

## Section 3 — Gmail "Send mail as" (reply from company address)

Each person does this once in their own Gmail.

1. Open Gmail → click the **gear icon** (top right) → **See all settings**.
2. Go to the **Accounts and Import** tab.
3. Under **Send mail as** → click **Add another email address**.
4. A popup appears:
   - **Name:** your name as it should appear to recipients
   - **Email address:** `danilo@pmgembedded.com`
   - **Treat as an alias:** **untick** this
   - Click **Next Step**.
5. SMTP server settings:

   | Field | Value |
   |-------|-------|
   | SMTP Server | `smtp.gmail.com` |
   | Port | `587` |
   | Username | your full personal Gmail address (e.g. `danilo@gmail.com`) |
   | Password | the App Password from Section 2 (not your normal Gmail password) |
   | Secured connection | TLS |

6. Click **Add Account**.
7. Gmail sends a confirmation code to `danilo@pmgembedded.com`. Because Cloudflare
   is already routing that address to your Gmail (Section 1), the code arrives in
   your inbox. Enter it in the popup to verify.

From now on, when composing or replying in Gmail, click **From:** to switch between
your personal address and `danilo@pmgembedded.com`.

---

## Quick reference — addresses and destinations

| Company address | Routes to |
|-----------------|-----------|
| `info@pmgembedded.com` | *(shared — decide who checks this)* |
| `danilo@pmgembedded.com` | Danilo's personal Gmail |
| `nikola@pmgembedded.com` | Nikola's personal Gmail |
| `sladjan@pmgembedded.com` | Sladjan's personal Gmail |
| `zelimir@pmgembedded.com` | Zelimir's personal Gmail |

Update this table as you add addresses.

---

## Adding a new team member later

1. **Section 1** — add their `name@pmgembedded.com` routing rule in Cloudflare.
2. Send them this document.
3. They do **Section 2** (App Password) and **Section 3** (Send mail as) themselves.
