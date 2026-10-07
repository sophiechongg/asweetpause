# A Sweet Pause

The website for A Sweet Pause: brown butter cookies, baked to order in Ann Arbor.

It's plain HTML, CSS and JavaScript with no build step.

- `index.html`: the page
- `css/style.css`: colors, fonts and layout
- `js/main.js`: works out whether ordering is open right now
- `js/order.js`: the order form, which sends orders to the Google Form
- `assets/`: logo and photos

## See it on your computer

In this folder, run:

```
python3 -m http.server
```

Then open http://localhost:8000.

To see the page when ordering is closed, open http://localhost:8000/?preview=thu-11:00.

## Change the seasonal cookie

Update three places, then place a test order:

1. In `index.html`, find `SEASONAL FLAVOR`. Change the photo, name and note on that flavor card, and the second photo in the "Half and half" card.
2. In the Google Form, update the answer choices in "Choose your box".
3. In `js/order.js`, update the `seasonal` and `half` answers so they match the Google Form exactly, emoji included.

Flavor photos match each other: a cookie broken in half and stacked on the white plate, seen from the side, cropped square and close around the cookie. Crop it square in the Photos app and export it into `Photos/`, then run this from the project folder:

```
sips -s format jpeg -s formatOptions 80 -Z 480 Photos/NEW.jpg --out assets/img/flavor-NEW.jpg
```

## Change the ordering days

The days and times live at the top of `js/main.js`. The same times are written in the short list at the top of the Order section in `index.html` (look for `ORDERING DAYS`), so update both.

## When a week sells out

At the top of `js/main.js`, change `WEEK_IS_FULL` to `true` and publish. The cookies stay on the page as a menu, but the form closes. Change it back to `false` before Sunday.

Don't only close the Google Form. People would still see the form on the site, and their orders wouldn't arrive.

## Taking a week off

For a week you already know about, like travel or a holiday, add it to `TIME_OFF` at the top of `js/main.js`:

```js
var TIME_OFF = [
  {
    from: "2026-10-10",
    to: "2026-10-17",
    message: "No cookies this week: I'm running the Detroit Marathon. Ordering opens again Sunday, October 18 at 8 AM."
  }
];
```

- **from**: the Saturday before ordering would have opened.
- **to**: the Saturday after the delivery you're skipping.
- **message**: shown in place of the ordering status. Say when ordering comes back.

Ordering closes itself on those dates and opens again afterwards, so there's nothing to switch back. Add as many as you like, separated by commas. Old ones can stay or be deleted.

To check a week off, add the date to the address: http://localhost:8000/?preview=2026-10-12

## How the order form works

The form sends each order to the Google Form, so orders show up in Google Forms and its spreadsheet as before. The question IDs and answer text live in `js/order.js`. If you change a question in the Google Form, update that file to match.

The website can't tell whether Google accepted an order. After any change to the form, place a test order, check that it arrives, then delete it.

## The contact form

Messages from the "Say hello" form are emailed to sophiechongg@gmail.com through FormSubmit (formsubmit.co), a free service with no account.

**It needs a one-time activation before messages arrive.** Send a message through the form. FormSubmit emails sophiechongg@gmail.com an "Activate Form" link. Click it, then send the message again. Early messages may land in spam; mark them "not spam". If FormSubmit asks for activation again after the site is published, click the new link once more.

To change the address, edit `SEND_TO` at the top of `js/contact.js`.

## Change the logo

The logo is `assets/logo.png`. If you replace it, also remake the small browser tab and iPhone icons:

```
sips -Z 32  Photos/Sticker.png --out assets/favicon-32.png
sips -Z 180 Photos/Sticker.png --out assets/apple-touch-icon.png
```

## Publishing changes

The site lives at https://asweetpausebakery.com. It's hosted for free on GitHub Pages from the `sophiechongg/asweetpause` repository.

After you change anything, open GitHub Desktop, write a short summary, click **Commit to main**, then **Push origin**. The live site updates in a minute or two.

## The domain

`asweetpausebakery.com` is registered at Namecheap (auto-renews yearly). The `CNAME` file in this folder tells GitHub Pages to use it, so don't delete that file.

Namecheap → Domain List → Manage → Advanced DNS has these records:

| Type | Host | Value |
|---|---|---|
| A Record | @ | 185.199.108.153 |
| A Record | @ | 185.199.109.153 |
| A Record | @ | 185.199.110.153 |
| A Record | @ | 185.199.111.153 |
| CNAME Record | www | sophiechongg.github.io |
