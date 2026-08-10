// Default greeting subheading. Shared by the settings schema default and the
// data-migration seed so the two never drift. Stores HTML for autofill fields.
export const defaultSubheading =
  '<p>Everything you need to work with <autofill-field data-value="{{workspace.brand}}"></autofill-field>, all in one place.</p>'

export const defaultContent = `<h1>How we'll work together</h1>
<p></p>
<h2>🏠 This is your home base</h2>
<p>Everything we share with you — messages, files, requests, and updates — lives here.</p><p></p>
<h2>🔔 We'll keep you posted</h2>
<p>Anything that needs your attention will appear right at the top of this page. You'll also get an email, so you never miss a thing.</p><p></p>
<h2>💬 Questions? Just message us</h2>
<p>Use the Messages tab on the left to reach the team directly. No email threads to dig through.</p>
`

export const SETTINGS_QUERY_KEY = 'settings'
